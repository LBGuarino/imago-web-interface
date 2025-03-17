import * as functions from "firebase-functions/v1";
import {
  approveUserByUid,
  setUserApprovedFalse,
} from "../../src/services/claims.service";
import sgMail from "@sendgrid/mail";
import admin from "../../src/firebaseAdmin";
/**
 * Trigger que se dispara al crear un usuario. Establece el custom claim "approved" en false.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    await setUserApprovedFalse(user.uid);
  } catch (error) {
    console.error("Error al establecer custom claim en onUserCreate:", error);
  }
});

/**
 * Función callable para aprobar a un usuario. Solo usuarios con el claim "admin" pueden llamarla.
 */
export const approveUser = functions.https.onCall(async (data, context) => {
  // Verificar que la solicitud provenga de un usuario autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "La solicitud debe estar autenticada."
    );
  }

  // Verificar que el usuario tenga el claim "admin"
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "El usuario no tiene permisos de administrador."
    );
  }

  // Verificar que se proporcione un UID válido
  const uid = data.uid;
  if (!uid || typeof uid !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "El UID del usuario es obligatorio y debe ser un string."
    );
  }

  try {
    // Actualizamos el custom claim 'approved' a true para el usuario indicado
    await approveUserByUid(uid);
    return {message: "Usuario aprobado exitosamente."};
  } catch (error) {
    console.error("Error al aprobar usuario:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error al aprobar el usuario."
    );
  }
});

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
sgMail.setApiKey(SENDGRID_API_KEY);

exports.sendEmailVerification = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  if (!email) return;

  // Configura los parámetros para el enlace de verificación
  const actionCodeSettings = {
    // URL a la que el usuario será redirigido después de verificar
    url: "http://localhost:3000/verification" + user.uid,
    handleCodeInApp: false, // Si usas una app, puedes poner true y configurar el deep linking
  };

  try {
    // Genera el enlace de verificación usando Firebase Admin SDK
    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(email, actionCodeSettings);

    // Configura el mensaje para SendGrid, utilizando la plantilla dinámica
    const msg = {
      to: email,
      from: "guarinolucia@icloud.com", // Debe ser un email verificado en SendGrid
      templateId: "d-19f0d5230e614192a91c9c1942c29a8d", // El ID de la plantilla que creaste en SendGrid
      dynamic_template_data: {
        // La variable definida en tu plantilla para insertar el link
        verificationLink: verificationLink,
        // Puedes incluir otras variables dinámicas que uses en la plantilla
      },
    };

    // Envía el email
    await sgMail.send(msg);
    console.log("Email de verificación enviado a:", email);
  } catch (error) {
    console.error("Error al enviar el email de verificación:", error);
  }
});

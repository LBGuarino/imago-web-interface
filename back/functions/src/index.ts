import * as functions from "firebase-functions/v1";
import {
  approveUserByUid,
  setUserApprovedFalse,
} from "../../src/services/claims.service";
import sgMail from "@sendgrid/mail";
import admin from "../../src/lib/firebaseAdmin";

// eslint-disable-next-line require-jsdoc
function generateRandomPassword(length = 12): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
/**
 * Trigger que se dispara al crear un usuario. Establece el custom claim "approved" en false.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    await setUserApprovedFalse(user.uid);

    const email = user.email;
    if (!email) return;

    const generatedPassword = generateRandomPassword();

    await admin.auth().updateUser(user.uid, {
      password: generatedPassword,
    });

    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(email, {
        url: "http://localhost:3000/verification",
      });

    const passwordResetLink = await admin
      .auth()
      .generatePasswordResetLink(email, {
        url: "http://localhost:3000/login",
      });

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    const msg = {
      to: email,
      from: "guarinolucia@icloud.com", // Debe ser un email verificado en SendGrid
      templateId: "d-19f0d5230e614192a91c9c1942c29a8d", // ID de plantilla en SendGrid
      dynamic_template_data: {
        userEmail: email,
        verificationLink: verificationLink,
        generatedPassword: generatedPassword, // Nueva contraseña temporal
        resetPasswordLink: passwordResetLink,
      },
    };

    // Enviar email con SendGrid
    await sgMail.send(msg);
    console.log("📩 Email enviado con credenciales a:", email);
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

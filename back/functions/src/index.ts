import * as functions from "firebase-functions/v1";
import {approveUserByUid, setUserApprovedFalse} from "../../src/services/claims.service";
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
    throw new functions.https.HttpsError("unauthenticated", "La solicitud debe estar autenticada.");
  }

  // Verificar que el usuario tenga el claim "admin"
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "El usuario no tiene permisos de administrador.");
  }

  // Verificar que se proporcione un UID válido
  const uid = data.uid;
  if (!uid || typeof uid !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "El UID del usuario es obligatorio y debe ser un string.");
  }

  try {
    // Actualizamos el custom claim 'approved' a true para el usuario indicado
    await approveUserByUid(uid);
    return {message: "Usuario aprobado exitosamente."};
  } catch (error) {
    console.error("Error al aprobar usuario:", error);
    throw new functions.https.HttpsError("internal", "Error al aprobar el usuario.");
  }
});

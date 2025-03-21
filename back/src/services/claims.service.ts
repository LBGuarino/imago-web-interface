// services/claimsService.ts
import admin from "../lib/firebaseAdmin";

/**
 * Asigna el claim 'approved' a false a un usuario.
 * Se usa en el trigger onUserCreate.
 */
export async function setUserApprovedFalse(uid: string): Promise<void> {
  await admin.auth().setCustomUserClaims(uid, { approved: false });
  console.log(`Usuario ${uid} creado con claim 'approved': false`);
}

/**
 * Asigna el claim 'approved' a true a un usuario.
 * Esta función se puede llamar desde Firebase Functions o desde un endpoint del backend.
 */
export async function approveUserByUid(uid: string): Promise<void> {
  const user = await admin.auth().getUser(uid);
  const curentClaims = user.customClaims || {};

  const updatedClaims = {
    ...curentClaims,
    approved: true,
  };

  await admin.auth().setCustomUserClaims(uid, updatedClaims);
  await admin.auth().revokeRefreshTokens(uid);
  console.log(`Usuario ${uid} aprobado exitosamente.`);
}

/**
 * Asigna el claim 'admin' a true a un usuario.
 */
export async function assignAdminRole(uid: string): Promise<void> {
  const user = await admin.auth().getUser(uid);
  const curentClaims = user.customClaims || {};

  const updatedClaims = {
    ...curentClaims,
    admin: true,
  };

  await admin.auth().setCustomUserClaims(uid, updatedClaims);
  await admin.auth().revokeRefreshTokens(uid);
  console.log(`Usuario ${uid} asignado como admin exitosamente.`);
}

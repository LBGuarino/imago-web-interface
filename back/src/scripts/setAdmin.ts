import admin from "../lib/firebaseAdmin";

async function setOwnerAsAdmin(ownerUid: string) {
  try {
    await admin
      .auth()
      .setCustomUserClaims(ownerUid, { admin: true, approved: true });
    console.log(`Usuario ${ownerUid} ha sido asignado como admin.`);
  } catch (error) {
    console.error("Error al asignar el usuario como admin:", error);
  }
}

setOwnerAsAdmin("Y9hbc0rIatbWYdFB0KalggMOSqj1")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error al asignar el usuario como admin:", error);
    process.exit(1);
  });

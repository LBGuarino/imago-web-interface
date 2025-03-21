import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let serviceAccount: admin.ServiceAccount | undefined;

if (process.env.FUNCTIONS_EMULATOR) {
  // Cargar credenciales desde el archivo local en emulador
  serviceAccount = require("../../serviceAccountKey.json");
}

// Evitar múltiples inicializaciones
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      serviceAccount || {
        projectId: process.env.ADMIN_PROJECT_ID,
        clientEmail: process.env.ADMIN_CLIENT_EMAIL,
        privateKey: process.env.ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }
    ),
  });
}

export default admin;

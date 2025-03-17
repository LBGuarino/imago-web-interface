// lib/firebaseAdmin.ts
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

if (process.env.FUNCTIONS_EMULATOR) {
  // En entorno local (emulación), utiliza el archivo de credenciales
  const serviceAccount = require("../../googleApiKeys/imago-web-interface-firebase-adminsdk-fbsvc-714fed1076.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  const serviceAccount = require("../../googleApiKeys/imago-web-interface-firebase-adminsdk-fbsvc-714fed1076.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;

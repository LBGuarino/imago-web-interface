// lib/firebaseAdmin.ts
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

if (!admin.apps.length) {
  const credentialPath = process.env.ADMIN_CREDENTIALS;
  if (!credentialPath) {
    throw new Error("La variable FIREBASE_ADMIN_CREDENTIALS no está definida");
  }
  const serviceAccount = require(credentialPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;

import admin from "firebase-admin";
import { join } from 'path';
import * as fs from 'fs';

if (!admin.apps.length) {
  try {
    // Agregar logs para debug
    const filePath = join(process.cwd(), 'googleApiKeys', 'googleApiKeys/imago-web-interface-firebase-adminsdk-fbsvc-92d7d02c53.json');
    console.log('Attempting to read file from:', filePath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Firebase credentials file not found at: ${filePath}`);
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(filePath, 'utf8')
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw error;
  }
}

export default admin;
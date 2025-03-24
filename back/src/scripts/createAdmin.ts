import admin from "../lib/firebaseAdmin";
import { generateRandomPassword } from "../utils/passwordGenerator";
import { UserRepository } from "../repositories/user.repository";
import { AppDataSource } from "../config/dataSource";

async function createAndSetAdmin(
  email: string, 
  firstName: string, 
  lastName: string, 
  title: string,
  dni: string,
  address: string
) {
  try {
    // Inicializar la conexión a la base de datos
    await AppDataSource.initialize();

    // Verificar si el usuario ya existe
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      // Si el usuario existe, solo actualizamos sus claims
      await admin
        .auth()
        .setCustomUserClaims(existingUser.uid, { admin: true, approved: true });

      console.log(`Usuario existente actualizado como admin:`);
      console.log(`UID: ${existingUser.uid}`);
      console.log(`Email: ${existingUser.email}`);
      console.log(`Role: admin`);
    } catch (error) {
      // Si el usuario no existe, lo creamos
      const password = generateRandomPassword();
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: firstName + " " + lastName,
        emailVerified: false
      });

      await admin
        .auth()
        .setCustomUserClaims(userRecord.uid, { admin: true, approved: true });

      // Crear registro en la base de datos con todos los campos requeridos
      const newUser = UserRepository.create({
        uid: userRecord.uid,
        title: title,
        firstName: firstName,
        lastName: lastName,
        dni: dni,
        address: address
      });

      await UserRepository.save(newUser);

      console.log(`Nuevo usuario admin creado exitosamente:`);
      console.log(`UID: ${userRecord.uid}`);
      console.log(`Email: ${userRecord.email}`);
      console.log(`Nombre: ${firstName} ${lastName}`);
      console.log(`DNI: ${dni}`);
      console.log(`Role: admin`);
      console.log(`Firebase enviará un email automáticamente a ${email}`);
    }

    // Cerrar la conexión a la base de datos
    await AppDataSource.destroy();
  } catch (error) {
    console.error("Error al crear y asignar el usuario como admin:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Obtener argumentos desde la línea de comandos
const email = process.argv[2];
const firstName = process.argv[3];
const lastName = process.argv[4];
const title = process.argv[5];
const dni = process.argv[6];
const address = process.argv[7];

if (!email || !firstName || !lastName || !title || !dni || !address) {
  console.error("Por favor proporciona todos los argumentos necesarios");
  console.log("Uso: ts-node createAdmin.ts <email> <nombre> <apellido> <titulo> <dni> <direccion>");
  process.exit(1);
}

createAndSetAdmin(email, firstName, lastName, title, dni, address)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  }); 


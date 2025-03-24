import { Request, Response } from "express";
import admin from "../lib/firebaseAdmin";
import { approveUserByUid } from "../services/claims.service";
import { UserRepository } from "../repositories/user.repository";
import { HealthcenterRepository } from "../repositories/healthcenter.repository";
import { generateRandomPassword } from "../utils/passwordGenerator";
import { In } from "typeorm";

export async function getUsersController(req: Request, res: Response): Promise<void> {
  try {
    // 1. Obtener todos los usuarios de Firebase
    const firebaseResult = await admin.auth().listUsers();
    const firebaseUsers = firebaseResult.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      claims: user.customClaims || {},
    }));

    // 2. Extraer los UIDs para consultar la base de datos local
    const firebaseUids = firebaseUsers.map((user) => user.uid);

    // 3. Obtener usuarios locales de PostgreSQL cuyos uid estén en Firebase
    const localUsers = await UserRepository.find({
      where: { uid: In(firebaseUids) },
      relations: ["healthcenter"],
    });

    // 4. Crear un diccionario de usuarios locales usando el uid como clave
    const localUsersDict = localUsers.reduce((acc: Record<string, any>, user) => {
      acc[user.uid] = user;
      return acc;
    }, {});

    // 5. Combinar los datos de Firebase con la información local
    const mergedUsers = firebaseUsers.map((firebaseUser) => {
      const localData = localUsersDict[firebaseUser.uid] || {};
      return {
        ...firebaseUser,
        ...localData, // se sobrescriben o agregan propiedades locales
      };
    });

    res.status(200).json({ users: mergedUsers });
  } catch (error) {
    console.error("Error al obtener lista de usuarios:", error);
    res.status(500).json({ error: "Error al obtener lista de usuarios" });
  }
}

export async function approveUserController(
  req: Request,
  res: Response
): Promise<void> {
  const { uid } = req.body;
  if (!uid || typeof uid !== "string") {
    res.status(400).json({ error: "UID inválido o no proporcionado" });
    return;
  }
  try {
    await approveUserByUid(uid);
    res.status(200).json({ message: "Usuario aprobado exitosamente." });
    return;
  } catch (error) {
    console.error("Error al aprobar usuario:", error);
    res.status(500).json({ error: "Error al aprobar el usuario" });
    return;
  }
}

export async function deleteUserController(
  req: Request,
  res: Response
): Promise<void> {
  const { uid } = req.body;
  if (!uid || typeof uid !== "string") {
    res.status(400).json({ error: "UID inválido o no proporcionado" });
    return;
  }
  try {
    await admin.auth().deleteUser(uid);
    res.status(200).json({ message: "Usuario eliminado exitosamente." });
    return;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
    return;
  }
}

export async function localRegisterController(
  req: Request,
  res: Response
): Promise<void> {
  console.log(req.body);

  const password = generateRandomPassword();

  const { title, firstName, lastName, dni, address, healthcenter, email } =
    req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: firstName + " " + lastName,
      emailVerified: false,
    });

    const userRec = await admin.auth().getUserByEmail(email);
    if (!userRec.uid || typeof userRec.uid !== "string") {
      res.status(400).json({ error: "UID inválido o no proporcionado" });
      return;
    }

    const newUser = UserRepository.create({
      uid: userRec.uid,
      title: title,
      firstName: firstName,
      lastName: lastName,
      dni: dni,
      address: address,
    });

    const newHC = HealthcenterRepository.create({
      name: healthcenter,
      authorized: "false",
    });
    await HealthcenterRepository.save(newHC);

    newUser.healthcenter = newHC;
    await UserRepository.save(newUser);
    res
      .status(201)
      .json({ uid: userRecord.uid, message: "Usuario creado exitosamente." });
    return;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear el usuario" });
    return;
  }
}

import { Request, Response } from 'express';
import admin from '../firebaseAdmin';
import { approveUserByUid } from '../services/claims.service';
import { UserRepository } from '../repositories/user.repository';
import { HealthcenterRepository } from '../repositories/healthcenter.repository';

export async function getUsersController(req: Request, res: Response): Promise<void> {
  try {
    const users = await admin.auth().listUsers();
    const formattedUsers = users.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      claims: user.customClaims || {},
    }));
    res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error('Error al obtener lista de usuarios:', error);
    res.status(500).json({ error: 'Error al obtener lista de usuarios' });
  }
}

export async function approveUserController(req: Request, res: Response): Promise<void> {
  const { uid } = req.body;
  if (!uid || typeof uid !== 'string') {
    res.status(400).json({ error: 'UID inválido o no proporcionado' });
    return;
  }
  try {
    await approveUserByUid(uid);
    res.status(200).json({ message: 'Usuario aprobado exitosamente.' });
    return;
  } catch (error) {
    console.error('Error al aprobar usuario:', error);
    res.status(500).json({ error: 'Error al aprobar el usuario' });
    return;
  }
}

export async function deleteUserController(req: Request, res: Response): Promise<void> {
  const { uid } = req.body;
  if (!uid || typeof uid !== 'string') {
    res.status(400).json({ error: 'UID inválido o no proporcionado' });
    return;
  }
  try {
    await admin.auth().deleteUser(uid);
    res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
    return;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
    return;
  }
}

export async function localRegisterController(req: Request, res: Response): Promise<void> {
  const { uid, title, firstName, lastName, dni, address, healthcenter } = req.body;
  if (!uid || typeof uid !== 'string') {
    res.status(400).json({ error: 'UID inválido o no proporcionado' });
    return;
  }
  try {
    const newUser = UserRepository.create({
      uid: uid,
      title: title,
      firstName: firstName,
      lastName: lastName,
      dni: dni,
      address: address,
    });

    const newHC = HealthcenterRepository.create({
      name: healthcenter,
      authorized: "false"
    });
    await HealthcenterRepository.save(newHC);

    newUser.healthcenter = newHC;
    await UserRepository.save(newUser);
    res.status(200).json({ message: 'Usuario creado exitosamente.' });
    return;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
    return;
  }
}
import { UserRepository } from "../repositories/user.repository";

interface UserData {
  firstName?: string;
  lastName?: string;
  dni?: string;
  address?: string;
}

export default async function getLocalUserService(
  uid: string
): Promise<UserData> {
  const userData = await UserRepository.findOne({
    where: {
      uid,
    },
  });
  if (!userData) {
    throw new Error("No se ha encontrado el usuario");
  }

  const userFields = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    dni: userData.dni,
    address: userData.address,
  };

  return userFields;
}

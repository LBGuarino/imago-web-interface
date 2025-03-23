import { getAuth } from "firebase/auth";
import firebase from "@/lib/firebase";

interface UserData {
  firstName?: string;
  lastName?: string;
  dni?: string;
  address?: string;
}

const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = isProd
  ? process.env.BACKEND_DOMAIN
  : "http://localhost:3001";

export default async function getUserInfo(): Promise<UserData> {
  const auth = getAuth(firebase);
  const user = auth.currentUser;

  if (!user) throw new Error("Usuario no autenticado.");

  const token = await user.getIdToken();

  const response = await fetch(`${BACKEND_URL}/api/local-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al obtener datos del usuario");
  }

  const userData: UserData = await response.json();
  if (!userData.firstName) {
    throw new Error("Error al obtener datos del usuario.");
  }

  return userData;
}

import { getAuth } from "firebase/auth";
import firebase from "@/lib/firebase";

const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = isProd
  ? process.env.BACKEND_DOMAIN
  : "http://localhost:3001";

export default async function getUserInfo() {
  const auth = getAuth(firebase);
  const user = auth.currentUser;

  if (!user) throw new Error("Usuario no autenticado.");

  const token = await user.getIdToken();

  const response = await fetch(`${BACKEND_URL}/api/local_userdata`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Error del servidor: ${response.status} - ${errorMessage}`);
  }

  return response.json();
}

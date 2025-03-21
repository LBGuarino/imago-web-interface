// lib/auth.ts
import { getAuth } from "firebase/auth";
import firebase from "@/lib/firebase";

export const refreshAuth = async (): Promise<{
  newIdToken: string;
} | null> => {
  try {
    const auth = getAuth(firebase);
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) {
      window.location.href = "/login";
      return null;
    }

    const newIdToken = await user.getIdToken(true);
    const refreshRes = await fetch(
      "http://localhost:3001/api/refresh-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ idToken: newIdToken }),
      }
    );
    if (!refreshRes.ok) {
      console.error("Error al refrescar la sesión:", refreshRes.statusText);
      return null;
    }

    return { newIdToken };
  } catch (error) {
    console.error("Error en refreshAuth:", error);
    window.location.href = "/login";
    return null;
  }
};

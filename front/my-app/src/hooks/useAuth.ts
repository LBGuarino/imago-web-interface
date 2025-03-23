import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebase from "@/lib/firebase";
import getUserInfo from "@/helpers/userInfo";

interface UserData extends User {
  firstName?: string;
  lastName?: string;
  dni?: string;
  address?: string;
}

export function useAuth() {
  const [loggedUser, setLoggedUser] = useState<UserData | null>(null);
  const [backendUserData, setBackendUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(firebase);
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user: UserData | null) => {
        if (user) {
          try {
            const data = await getUserInfo();
            setLoggedUser({
              ...user,
              firstName: data.firstName,
              lastName: data.lastName,
              dni: data.dni,
              address: data.address,
            });
            setBackendUserData(data);
          } catch (error) {
            console.error("Error al obtener datos del backend:", error);
            setLoggedUser(null);
            setBackendUserData(null);
            // Redirigir al login si hay error
            window.location.href = "/login";
          }
        } else {
          setLoggedUser(null);
          setBackendUserData(null);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { loggedUser, backendUserData, loading };
}

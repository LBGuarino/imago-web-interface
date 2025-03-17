import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebase from "@/lib/firebase";
import getUserInfo from "@/helpers/userInfo";

interface UserData {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

export function useAuth() {
  const [loggedUser, setLoggedUser] = useState<UserData | null>(null);
  const [backendUserData, setBackendUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(firebase);
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setLoggedUser({
          uid: user.uid,
          email: user.email || undefined,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
        });

        try {
          const data = await getUserInfo();
          setBackendUserData(data);
        } catch (error) {
          console.error("Error al obtener datos del backend:", error);
          setBackendUserData(null);
        }
      } else {
        setLoggedUser(null);
        setBackendUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { loggedUser, backendUserData, loading };
}

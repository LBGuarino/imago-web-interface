import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebase from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const auth = getAuth(firebase);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      
      if (user) {
        try {
          const userData = localStorage.getItem('userData');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else {
        setUser(null);
      }
      
      if (mounted && !isLoggingOut) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [auth, isLoggingOut]);

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      setLoading(true);
      await auth.signOut();
      
      const res = await fetch("http://localhost:3001/api/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error('Error en logout del backend');
      }

      localStorage.clear();
      setUser(null);
      
      // Wait for 2 seconds while keeping loading state active
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      router.push("/");
    } catch (error) {
      console.error("Error durante el logout:", error);
    } finally {
      setIsLoggingOut(false);
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isLoggingOut,
    logout,
  };
}

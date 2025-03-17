'use client'
import "./globals.css";
import Image from "next/image";
import AnimatedPage from "@/components/AnimatedPage";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebase from "@/lib/firebase";
import { useEffect, useState } from "react";

interface UserData {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

export default function Home() {
  const [loggedUser, setLoggedUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(firebase);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedUser({
          uid: user.uid,
          email: user.email || undefined,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined
        });
      } else {
        setLoggedUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative w-full h-80">
          <Image src="/imago.jpg" alt="Logo" fill className="object-cover" />
          <div className="absolute inset-0 bg-black opacity-20"></div>
        </div>

        <div className="p-8">
          {loggedUser ? (
            <p className="text-2xl text-gray-800 text-center">
              ¡Bienvenido Dr/a. {loggedUser.email}!
            </p>
          ) : (
            <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200">
              <h1 className="text-3xl font-light text-blue-600 mb-4 text-center">
                Bienvenidos a la plataforma de acceso de Imago ICE Reveal Argentina
              </h1>
              <h2 className="text-xl font-normal mb-2 text-center">¡Importante!</h2>
              <p className="text-gray-700 mb-2 text-center">
                Para acceder a la plataforma necesitas tener una cuenta de Imago Argentina y estar autorizado.
              </p>
              <p className="text-gray-700 text-center">
                Si no tienes una cuenta y estás interesado/a en Imago ICE Reveal,{" "}
                <Link href="/access_request">
                  <span className="text-blue-600 hover:text-blue-800 transition-colors">
                    haz click aquí.
                  </span>
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}

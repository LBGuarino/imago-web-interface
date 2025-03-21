// components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAuth, onIdTokenChanged, User } from "firebase/auth";
import firebase from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { refreshAuth } from "@/lib/auth";

interface NavBarProps {
  csrfToken?: string;
}

export default function Navbar({ csrfToken }: NavBarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const auth = getAuth(firebase);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true);
          await refreshAuth();
          const tokenResult = await user.getIdTokenResult();
          setIsApproved(tokenResult.claims.approved === true);
          setIsAdmin(tokenResult.claims.admin === true);
          setUser(user);
        } catch (error) {
          console.error("Error al obtener custom claims:", error);
        }
      } else {
        setUser(null);
        setIsApproved(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, router]);

  const handleLogout = async () => {
    auth.signOut();
    try {
      const res = await fetch("http://localhost:3001/api/logout", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/");
      } else {
        console.error("Error al realizar el logout:", res.statusText);
      }
    } catch (error) {
      console.error("Error al realizar el logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center">
        <div className="bg-white shadow-2xl rounded-xl p-8 border border-gray-200 animate-pulse">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-60"></div>
            <p className="text-gray-700 font-semibold text-lg">
              Cargando, por favor espere...
            </p>
            <p className="text-sm text-gray-500">
              Esto puede tomar algunos segundos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <nav className="w-full relative border-b border-b-[#d9d9d9] box-border overflow-visible flex flex-row items-center justify-between px-8 text-[#1e1e1e] bg-transparent transition-colors duration-200 ease hover:bg-[#d3dadf]">
      <div className="flex items-center">
        <Link href="/">
          <div className="flex items-center p-4">
            <Image src="/logo.svg" width={100} height={100} alt="Logo" />
          </div>
        </Link>
      </div>
      {!user ? (
        <ul className="flex items-center gap-4 p-4">
          <li className="flex items-center font-light hover:text-[#3f6d9e] transition-all duration-200 ease-in-out">
            <Link href="/access_request">Solicitar acceso</Link>
          </li>
          <li className="flex items-center font-light hover:text-[#3f6d9e] transition-all duration-200 ease-in-out">
            <Link href="/login">Ingresar</Link>
          </li>
        </ul>
      ) : (
        <ul className="flex items-center gap-4 p-4">
          {isAdmin && (
            <>
              <li className="flex items-center font-light text-[#3c976d] hover:text-[#3f6d9e] transition-all duration-200 ease-in-out">
                <Link href="/dashboard">Panel de control</Link>
              </li>
              <li className="flex items-center font-light text-[#555dc7] hover:text-[#3f6d9e] transition-all duration-200 ease-in-out">
                <Link href="/admin_dashboard">Panel de administración</Link>
              </li>
            </>
          )}
          <li className="flex items-center font-light hover:text-[#3f6d9e] transition-all duration-200 ease-in-out">
            <Link href="/account">Mi cuenta</Link>
          </li>
          <li className="flex items-center font-light hover:text-[#3f6d9e] transition-all duration-200 ease-in-out">
            <button onClick={handleLogout}>Cerrar sesión</button>
          </li>
          {isApproved && !isAdmin && (
            <li className="flex items-center font-light text-[#3c976d] hover:text-[#3f6d9e] transition-all duration-200 ease-in-out">
              <Link href="/dashboard">Panel de control</Link>
            </li>
          )}
          {!isApproved && (
            <li className="flex items-center font-light text-red-600">
              Pendiente de aprobación
            </li>
          )}
        </ul>
      )}
    </nav>
  );
}

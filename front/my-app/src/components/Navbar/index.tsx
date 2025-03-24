// components/Navbar.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAuth, onIdTokenChanged, User } from "firebase/auth";
import firebase from "@/lib/firebase";
import { refreshAuth } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Navbar() {
  const { user, loading, isLoggingOut, logout } = useAuth();
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [lastTokenRefresh, setLastTokenRefresh] = useState<number>(0);

  const auth = getAuth(firebase);

  const handleTokenRefresh = useCallback(async (user: User) => {
    try {
      const now = Date.now();
      const MIN_REFRESH_INTERVAL = 10000; // 10 segundos

      if (now - lastTokenRefresh >= MIN_REFRESH_INTERVAL) {
        const authResult = await refreshAuth();
        if (authResult) {
          setLastTokenRefresh(now);
        }
      }

      const tokenResult = await user.getIdTokenResult();
      setIsApproved(tokenResult.claims.approved === true);
      setIsAdmin(tokenResult.claims.admin === true);
    } catch (error) {
      console.error("Error al obtener custom claims:", error);
    }
  }, [lastTokenRefresh]);

  useEffect(() => {
    let mounted = true;
  
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user && mounted) {
        await handleTokenRefresh(user);
      } else if (mounted) {
        setIsApproved(false);
        setIsAdmin(false);
      }
    });
  
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [auth, handleTokenRefresh]);

  return (
    <>
      {(loading || isLoggingOut) && (
        <LoadingSpinner 
          overlay={true} 
          message={isLoggingOut ? "Cerrando sesión..." : "Cargando..."} 
        />
      )}
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
                <li className="flex items-center font-light hover:text-[#3f6d9e] transition-all duration-200 ease-in-out">
                  <Link href="/account">Mi cuenta</Link>
                </li>
              </>
            )}
            {isApproved && !isAdmin && (
              <>
              <li className="flex items-center font-light text-[#3c976d] hover:text-[#3f6d9e] transition-all duration-200 ease-in-out">
                <Link href="/dashboard">Panel de control</Link>
              </li>
              <li className="flex items-center font-light hover:text-[#3f6d9e] transition-all duration-200 ease-in-out">
                <Link href="/account">Mi cuenta</Link>
              </li>
              </>
            
            )}
            <li className="flex items-center font-light hover:text-[#3f6d9e] transition-all duration-200 ease-in-out">
              <button onClick={logout}>Cerrar sesión</button>
            </li>
            {!isApproved && (
              <li className="flex items-center font-light text-red-600">
                Pendiente de aprobación
              </li>
            )}
          </ul>
        )}
      </nav>
    </>
  );
}

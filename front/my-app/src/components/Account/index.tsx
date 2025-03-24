"use client";

import { useState, useEffect } from "react";
import getUserInfo from "@/helpers/userInfo";
import { refreshAuth } from "@/lib/auth";
import LoadingSpinner from "@/components/LoadingSpinner";

interface UserData {
  firstName?: string;
  lastName?: string;
  dni?: string;
  address?: string;
}

export default function Account({ userData }: { userData: UserData }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchUserData = async () => {
      try {
        // Primero intentamos usar los datos en caché
        if (typeof window !== 'undefined') {
          const cachedData = localStorage.getItem('userData');
          if (cachedData && mounted) {
            setUser(JSON.parse(cachedData));
            setLoading(false);
          }
        }

        // Luego actualizamos con datos frescos
        const authResult = await refreshAuth();
        if (!mounted || !authResult) return;

        const userData = await getUserInfo();
        if (!mounted) return;

        // Actualizar el estado y el caché
        setUser(userData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (mounted) {
          window.location.href = "/login";
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner fullScreen message="Cargando información..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h1 className="text-2xl font-semibold text-gray-800">
              Mi Cuenta
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Información Personal
              </h2>
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <span className="font-medium w-24">Nombre:</span>
                  <span>{user?.firstName}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="font-medium w-24">Apellido:</span>
                  <span>{user?.lastName}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="font-medium w-24">DNI:</span>
                  <span>{user?.dni}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="font-medium w-24">Dirección:</span>
                  <span>{user?.address}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Seguridad
              </h2>
              <div className="space-y-4">
                <button className="w-full py-3 bg-white text-green-700 font-medium rounded-xl transition-all duration-200 hover:bg-green-100 flex items-center justify-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>Cambiar Contraseña</span>
                </button>
                <button className="w-full py-3 bg-white text-green-700 font-medium rounded-xl transition-all duration-200 hover:bg-green-100 flex items-center justify-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Autenticación de Dos Factores</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

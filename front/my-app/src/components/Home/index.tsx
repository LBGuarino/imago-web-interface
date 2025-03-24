"use client";
import "../../app/globals.css";
import Image from "next/image";
import AnimatedPage from "@/components/AnimatedPage";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import NotificationCenter from "@/components/NotificationCenter";

interface UserData {
  firstName: string;
  lastName: string;
  dni: string;
  address: string;
}

interface UserWelcomeProps {
  backendUserData: UserData;
}

export default function HomePage() {
  const { user: loggedUser, loading } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      setUserData(JSON.parse(stored));
    }
  }, []);

  if (loading) return <div className="text-center mt-10">Cargando...</div>;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative w-full h-80">
          <Image src="/imago.jpg" alt="Logo" fill className="object-cover" />
          <div className="absolute inset-0 bg-black opacity-20"></div>
        </div>

        <div className="p-8">
          {loggedUser && userData ? (
            <div className="flex gap-8">
              <div className="w-1/3">
                <NotificationCenter />
              </div>
              <div className="w-2/3">
                <UserWelcome backendUserData={userData} />
              </div>
            </div>
          ) : (
            <PublicWelcome />
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
const UserWelcome = ({ backendUserData }: UserWelcomeProps) => (
  <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-light text-blue-600 mb-2">
        Bienvenido Dr/a.{" "}
        <span className="font-medium text-gray-800">
          {backendUserData.firstName + " " + backendUserData.lastName}
        </span>
      </h1>
      <p className="text-gray-600">Panel de Control</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Información Personal
        </h3>
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <span className="font-medium w-24">DNI:</span>
            <span>{backendUserData.dni}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="font-medium w-24">Dirección:</span>
            <span>{backendUserData.address}</span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-xl border border-green-100">
        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Acciones Rápidas
        </h3>
        <div className="space-y-3">
          <Link 
            href="/patients" 
            className="flex items-center text-green-700 hover:text-green-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Ver Pacientes
          </Link>
          <Link 
            href="/appointments" 
            className="flex items-center text-green-700 hover:text-green-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Gestionar Citas
          </Link>
          <Link 
            href="/reports" 
            className="flex items-center text-green-700 hover:text-green-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ver Reportes
          </Link>
        </div>
      </div>
    </div>
  </div>
);


const PublicWelcome = () => (
  <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200">
    <h1 className="text-3xl font-light text-blue-600 mb-4 text-center">
      Bienvenidos a la plataforma de acceso de Imago ICE Reveal Argentina
    </h1>
    <h2 className="text-xl font-normal mb-2 text-center">¡Importante!</h2>
    <p className="text-gray-700 mb-2 text-center">
      Para acceder necesitas una cuenta de Imago Argentina autorizada.
    </p>
    <p className="text-gray-700 text-center">
      Si no tienes una cuenta y estás interesado/a en Imago ICE Reveal,{" "}
      <Link
        href="/access_request"
        className="text-blue-600 hover:text-blue-800 transition-colors"
      >
        haz click aquí.
      </Link>
    </p>
  </div>
);


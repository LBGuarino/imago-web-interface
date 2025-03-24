"use client";

import { useEffect, useState } from "react";
import DashboardForm from "@/components/DashboardForm";
import getUserInfo from "@/helpers/userInfo";
import { refreshAuth } from "@/lib/auth";
import Link from "next/link";

interface Study {
  id: number;
  name: string;
  status: string;
  progress: number;
}

interface UserData {
  firstName?: string;
  lastName?: string;
  dni?: string;
  address?: string;
}

export default function MyDashboard() {
  const [activeTab, setActiveTab] = useState<
    "misEstudios" | "nuevoEstudio" | "configuracion"
  >("misEstudios");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const [studies, setStudies] = useState<Study[]>([
    {
      id: 1,
      name: "Estudio Mamografía 20-03-2025",
      status: "En Progreso",
      progress: 60,
    },
    {
      id: 2,
      name: "Estudio Mamografía 14-03-2025",
      status: "Completado",
      progress: 100,
    },
  ]);

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
  
  return (
    <div className="max-w-7xl mx-auto p-10">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-light text-blue-600 mb-2">
          Bienvenido/a Dr./a{" "}
          <span className="font-medium text-gray-800">
            {user?.firstName} {user?.lastName}
          </span>
        </h1>
        <p className="text-xl text-gray-600">Panel de Control</p>
      </header>

      <nav className="flex justify-center mb-12 space-x-4">
        <button
          onClick={() => setActiveTab("misEstudios")}
          className={`px-8 py-3 rounded-xl text-lg font-medium transition-all duration-200 flex items-center space-x-2
            ${
              activeTab === "misEstudios"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white/80 text-gray-800 hover:bg-blue-50 hover:shadow-md"
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Últimos Estudios</span>
        </button>
        <button
          onClick={() => setActiveTab("nuevoEstudio")}
          className={`px-8 py-3 rounded-xl text-lg font-medium transition-all duration-200 flex items-center space-x-2
            ${
              activeTab === "nuevoEstudio"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white/80 text-gray-800 hover:bg-blue-50 hover:shadow-md"
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Estudio</span>
        </button>
        <button
          onClick={() => setActiveTab("configuracion")}
          className={`px-8 py-3 rounded-xl text-lg font-medium transition-all duration-200 flex items-center space-x-2
            ${
              activeTab === "configuracion"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white/80 text-gray-800 hover:bg-blue-50 hover:shadow-md"
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Configuración</span>
        </button>
      </nav>

      <section>
        {activeTab === "misEstudios" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {studies.length > 0 ? (
              studies.map((study) => (
                <div
                  key={study.id}
                  className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl px-3 font-semibold text-gray-800">
                      {study.name}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        study.status === "Completado" ? "bg-green-500" : "bg-blue-500"
                      }`}></div>
                      <span className="text-gray-600 font-medium">
                        {study.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${study.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 text-right">
                      {study.progress}% completado
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      disabled
                      className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl transition-all duration-200 opacity-50 cursor-not-allowed hover:bg-blue-700"
                    >
                      Descargar Imágenes Procesadas
                    </button>
                    <button
                      className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl transition-all duration-200 hover:bg-gray-200"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              )) 
            ) : (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-xl text-gray-600">
                    No hay estudios guardados
                  </p>
                  <button
                    onClick={() => setActiveTab("nuevoEstudio")}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Nuevo Estudio
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "nuevoEstudio" && <DashboardForm />}
        {activeTab === "configuracion" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-800">
                Configuración
              </h2>
            </div>
            <p className="text-gray-600">
              Ajustes de la cuenta y estado del sistema.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

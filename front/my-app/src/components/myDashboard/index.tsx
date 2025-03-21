"use client";

import { useEffect, useState } from "react";
import DashboardForm from "@/components/DashboardForm";
import getUserInfo from "@/helpers/userInfo";
import { refreshAuth } from "@/lib/auth";

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
  const [user, setUser] = useState<UserData>();

  const [studies, setStudies] = useState<Study[]>([
    {
      id: 1,
      name: "Estudio Mamografía 2023-05-01",
      status: "En Progreso",
      progress: 60,
    },
    {
      id: 2,
      name: "Estudio Mamografía 2023-04-20",
      status: "Completado",
      progress: 100,
    },
  ]);

  useEffect(() => {
    const checkAuthAndFetchUserInfo = async () => {
      try {
        await refreshAuth();
        const userData = await getUserInfo();
        setUser(userData);
      } catch (error) {
        window.location.href = "/login";
      }
    };

    if (typeof window !== "undefined") {
      checkAuthAndFetchUserInfo();
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-10">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-light text-gray-800">
          Bienvenido/a Dr./a {user?.firstName} {user?.lastName}
        </h1>
        <p className="mt-4 text-xl text-gray-600">Panel de Control</p>
      </header>

      <nav className="flex justify-center mb-8 space-x-4">
        <button
          onClick={() => setActiveTab("misEstudios")}
          className={`px-6 py-2 rounded-full text-lg font-medium transition-colors 
            ${
              activeTab === "misEstudios"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white/80 text-gray-800 hover:bg-blue-100"
            }`}
        >
          Mis Estudios
        </button>
        <button
          onClick={() => setActiveTab("nuevoEstudio")}
          className={`px-6 py-2 rounded-full text-lg font-medium transition-colors 
            ${
              activeTab === "nuevoEstudio"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white/80 text-gray-800 hover:bg-blue-100"
            }`}
        >
          Nuevo Estudio
        </button>
        <button
          onClick={() => setActiveTab("configuracion")}
          className={`px-6 py-2 rounded-full text-lg font-medium transition-colors 
            ${
              activeTab === "configuracion"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white/80 text-gray-800 hover:bg-blue-100"
            }`}
        >
          Configuración
        </button>
      </nav>

      <section>
        {activeTab === "misEstudios" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {studies.length > 0 ? (
              studies.map((study) => (
                <div
                  key={study.id}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200"
                >
                  <h2 className="text-3xl font-semibold mb-4 text-gray-700">
                    {study.name}
                  </h2>
                  <div className="flex items-center mb-4">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-xl text-gray-700">
                      {study.status}
                    </span>
                  </div>
                  <div className="mt-6">
                    <button
                      disabled
                      className="w-full py-3 bg-green-600 text-white font-bold rounded-xl transition-colors opacity-50 cursor-not-allowed"
                    >
                      Descargar Imágenes Procesadas
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200 text-center">
                <p className="text-gray-600 text-lg">
                  No hay estudios guardados
                </p>
              </div>
            )}
          </div>
        )}
        {activeTab === "nuevoEstudio" && <DashboardForm />}
        {activeTab === "configuracion" && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200">
            <h2 className="text-3xl font-semibold mb-4 text-gray-700">
              Configuración
            </h2>
            <p className="text-gray-600">
              Ajustes de la cuenta y estado del sistema.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

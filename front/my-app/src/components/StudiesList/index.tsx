"use client";
import React, { useState, useEffect } from "react";
import { refreshAuth } from "@/lib/auth";

interface Study {
  StudyInstanceUID: string;
  PatientName: string;
  StudyDate: string;
  Modality: string;
  [key: string]: any;
}

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const location = process.env.NEXT_PUBLIC_LOCATION;
const datasetId = process.env.NEXT_PUBLIC_DATASET_ID;
const dicomStoreId = process.env.NEXT_PUBLIC_DICOMSTORE_ID;

export default function StudiesList() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/search-studies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          location,
          datasetId,
          dicomStoreId,
        }),
        credentials: "include",
      });
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        setStudies(data);
      } else if (response.status === 401) {
        await refreshAuth();
        return fetchStudies();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al cargar los estudios");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-60"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-700">Mis Estudios</h2>
        <button
          onClick={fetchStudies}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {studies.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No hay estudios disponibles
        </p>
      ) : (
        <div className="grid gap-4">
          {studies.map((study, index) => (
            <div
              key={study.StudyInstanceUID || `study-${index}`}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {study.PatientName || "Sin nombre"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Fecha: {formatDate(study.StudyDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Modalidad: {study.Modality || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    UID: {study.StudyInstanceUID}
                  </p>
                </div>
                <div className="flex justify-end items-center">
                  <button
                    onClick={() => {
                      // Aquí puedes agregar la lógica para ver el estudio
                      console.log("Ver estudio:", study.StudyInstanceUID);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Ver Estudio
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

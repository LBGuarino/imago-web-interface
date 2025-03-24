"use client";
import React, { useState, useEffect } from "react";
import { refreshAuth } from "@/lib/auth";
import axiosInstance from "@/lib/axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import { GrRefresh } from "react-icons/gr";

interface Study {
  StudyInstanceUID: string;
  PatientName: string;
  StudyDate: string;
  Modality: string;
  Status: string;
  [key: string]: any;
}

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const location = process.env.NEXT_PUBLIC_LOCATION;
const datasetId = process.env.NEXT_PUBLIC_DATASET_ID;
const dicomStoreId = process.env.NEXT_PUBLIC_DICOMSTORE_ID;

const studiesMock = [
  {
    StudyInstanceUID: "1.2.3.4.5",
    PatientName: "Sofia Ramirez",
    StudyDate: "20240101",
    Modality: "MG",
    Status: "En proceso",
  },
  {
    StudyInstanceUID: "1.2.3.4.6",
    PatientName: "Maria Lopez",
    StudyDate: "20240102",
    Modality: "MG",
    Status: "Procesado",
  },
  {
    StudyInstanceUID: "1.2.3.4.7",
    PatientName: "Pilar Gomez",
    StudyDate: "20240103",
    Modality: "MG",
    Status: "Procesado",
  },
  {
    StudyInstanceUID: "1.2.3.4.8",  
    PatientName: "Ana Torres",
    StudyDate: "20240104",
    Modality: "MG",
    Status: "En proceso",
  },
  {
    StudyInstanceUID: "1.2.3.4.10",
    PatientName: "Laura Fernandez",
    StudyDate: "20240106",
    Modality: "MG",
    Status: "En proceso",
  },
  {
    StudyInstanceUID: "1.2.3.4.11",
    PatientName: "Daniela Martinez",
    StudyDate: "20240107",
    Modality: "MG",
    Status: "En proceso",
  },
];

export default function StudiesList() {
  const [studies, setStudies] = useState<Study[]>(studiesMock);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const fetchStudies = async () => {
  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     const response = await axiosInstance.post("/api/search-studies", {
  //       projectId,
  //       location,
  //       datasetId,
  //       dicomStoreId,
  //     });
      
  //     setStudies(response.data);
  //   } catch (err: any) {
  //     if (err.response?.status === 401) {
  //       await refreshAuth();
  //       return fetchStudies();
  //     }
  //     setError(err.response?.data?.error || "Error al cargar los estudios");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchStudies();
  // }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200">
        <LoadingSpinner message="Cargando estudios..." />
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
          // onClick={fetchStudies}
          className="px-2 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center"
        >
          <GrRefresh />
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {(study.PatientName).toUpperCase() || "Sin nombre"}
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
                <div>
                  <p className="text-sm text-gray-600">
                    Estado: {study.Status || "N/A"}
                  </p>
                </div>
                <div className="flex justify-end items-center">
                  <button
                    onClick={() => {
                      // Aquí puedes agregar la lógica para ver el estudio
                      console.log("Ver estudio:", study.StudyInstanceUID);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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

"use client";
import React, { useState } from "react";
import FileUploadField from "../FileUploadField";
import { refreshAuth } from "@/lib/auth";
import axiosInstance from "@/lib/axios";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const location = process.env.NEXT_PUBLIC_LOCATION;
const datasetId = process.env.NEXT_PUBLIC_DATASET_ID;
const dicomStoreId = process.env.NEXT_PUBLIC_DICOMSTORE_ID;

export default function DashboardForm() {
  const [files, setFiles] = useState<Record<string, File>>({});
  const [studyName, setStudyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (
    file: File,
    fieldName: string,
    patientName?: string
  ) => {
    setFiles((prev) => ({ ...prev, [fieldName]: file }));
    if (patientName && patientName.toLowerCase() !== undefined) {
      setStudyName(patientName);
    }
  };

  const handleFileRemove = (fieldName: string) => {
    setFiles((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
    if (Object.keys(files).length === 1) {
      setStudyName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    Object.keys(files).forEach((fieldName) => {
      formData.append(fieldName, files[fieldName]);
    });

    formData.append("projectId", projectId || "");
    formData.append("location", location || "");
    formData.append("datasetId", datasetId || "");
    formData.append("dicomStoreId", dicomStoreId || "");

    try {
      const response = await axiosInstance.post("/api/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        await refreshAuth();
        setIsLoading(false);
        return handleSubmit(e);
      }
      console.error("Error al cargar los archivos:", error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    studyName.trim() !== "" &&
    files["view1"] &&
    files["view2"] &&
    files["view3"] &&
    files["view4"];

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-60"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-800">
                  Subiendo estudio, por favor espere...
                </p>
                <p className="text-gray-600 mt-2">
                  Esto puede tomar algunos segundos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-800">
            Nuevo Estudio
          </h2>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploadField
              id="view1"
              name="view1"
              label="Vista 1 (Obligatorio)"
              accept=".dcm"
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
            />
            <FileUploadField
              id="view2"
              name="view2"
              label="Vista 2 (Obligatorio)"
              accept=".dcm"
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
            />
            <FileUploadField
              id="view3"
              name="view3"
              label="Vista 3 (Obligatorio)"
              accept=".dcm"
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
            />
            <FileUploadField
              id="view4"
              name="view4"
              label="Vista 4 (Obligatorio)"
              accept=".dcm"
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
            />
            <FileUploadField
              id="tomo"
              name="tomo"
              label="Tomosíntesis (Opcional)"
              accept=".dcm"
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="studyName"
                className="block text-lg font-medium text-gray-700"
              >
                Nombre del Estudio
              </label>
              <input
                value={studyName}
                readOnly
                type="text"
                id="studyName"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="studyDesc"
                className="block text-lg font-medium text-gray-700"
              >
                Comentarios
              </label>
              <textarea
                id="studyDesc"
                rows={4}
                placeholder="Ingrese la descripción del estudio"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Formato aceptado: .dcm</span>
            </div>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`px-8 py-3 font-medium rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                isFormValid && !isLoading
                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Crear Nuevo Estudio</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

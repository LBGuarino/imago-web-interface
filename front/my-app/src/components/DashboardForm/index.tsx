"use client";
import React, { useState } from "react";
import FileUploadField from "../FileUploadField";
import { refreshAuthToken } from "@/lib/auth";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const location = process.env.NEXT_PUBLIC_LOCATION;
const datasetId = process.env.NEXT_PUBLIC_DATASET_ID;
const dicomStoreId = process.env.NEXT_PUBLIC_DICOMSTORE_ID;

export default function DashboardForm() {
  const [files, setFiles] = useState<Record<string, File>>({});
  const [studyName, setStudyName] = useState("");

  const handleFileUpload = (file: File, fieldName: string, patientName?: string) => {
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
  
    const formData = new FormData();
    Object.keys(files).forEach((fieldName) => {
      formData.append(fieldName, files[fieldName]);
    });

    formData.append("projectId", projectId || "");
    formData.append("location", location || "");
    formData.append("datasetId", datasetId || "");
    formData.append("dicomStoreId", dicomStoreId || "");
  
    try {
      const response = await fetch("http://localhost:3001/api/upload-dicom", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      console.log(response)
      if (response.ok) {
        console.log("Archivos cargados:", files);
      } 
      else if (response.status === 401) {
        await refreshAuthToken();
        return handleSubmit(e);
      }
      else {
        console.error("Error al cargar los archivos:", response.statusText);
      }
    } catch (error) {
      console.error("Error al cargar los archivos:", error);
    }
  };
  
  const isFormValid = 
    studyName.trim() !== "" &&
    files["view1"] &&
    files["view2"] &&
    files["view3"] &&
    files["view4"]

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200">
      <h2 className="text-3xl font-semibold mb-6 text-gray-700">Nuevo Estudio</h2>
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-5">
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
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="studyName"
              className="block text-lg text-gray-600 font-medium"
            >
              Nombre del Estudio
            </label>
            <input
              value={studyName}
              readOnly
              type="text"
              id="studyName"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="studyDesc"
              className="block text-lg text-gray-600 font-medium"
            >
              Comentarios
            </label>
            <textarea
              id="studyDesc"
              rows={4}
              placeholder="Ingrese la descripción del estudio"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>
        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full py-3 font-bold rounded-xl transition-colors ${
            isFormValid
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}        
          >
          Crear Nuevo Estudio
        </button>
      </form>
    </div>
  );
}

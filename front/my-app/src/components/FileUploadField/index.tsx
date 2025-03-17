import { useState, useRef } from "react";
import { GrAdd } from "react-icons/gr";
import dicomParser from "dicom-parser";

interface FileUploadFieldProps {
  id: string;
  name: string; 
  label: string;
  accept: string;
  required?: boolean;
  onFileUpload: (file: File, fieldName: string, studyName?: string) => void;
  onFileRemove?: (fieldName: string) => void;
}

export default function FileUploadField({
  id,
  name,
  label,
  accept,
  required,
  onFileUpload,
  onFileRemove,
}: FileUploadFieldProps) {
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      const MAX_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        alert("El archivo es demasiado grande. El tamaño máximo permitido es 50MB.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setFileName("");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result && result instanceof ArrayBuffer) {
          if (result.byteLength < 132) {
            alert("El archivo es demasiado corto y no es un DICOM válido.");
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            setFileName("");
            return;
          }
          const byteArray = new Uint8Array(result);
          const preamble = new TextDecoder("utf-8").decode(byteArray.slice(128, 132));
          if (preamble !== "DICM") {
            alert("El archivo no contiene la marca DICM y no es un archivo DICOM válido.");
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            setFileName("");
            return;
          }

          const fullReader = new FileReader();
          fullReader.onload = (e) => {
            try {
                const fullBuffer = e.target?.result;
                if (fullBuffer && fullBuffer instanceof ArrayBuffer) {
                  const fullByteArray = new Uint8Array(fullBuffer);
                  const dataSet = dicomParser.parseDicom(fullByteArray);
                  const patientName = dataSet.string("x00100010");
                  setFileName(file.name);
                  onFileUpload(file, name, patientName);
                }
            } catch (error) {
              console.error("Error al parsear el archivo:", error);
              alert("Error al parsear el archivo. Por favor, intente nuevamente.");
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
              setFileName("");
            }
          };
          fullReader.readAsArrayBuffer(file);
        }
      };

      const blob = file.slice(0, 132);
      reader.readAsArrayBuffer(blob);
    } else {
      setFileName("");
    }

};
const handleRemove = () => {
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFileRemove) {
      onFileRemove(name);
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-lg text-gray-600 font-medium">
        {label}
      </label>
      <div className="flex items-center border border-gray-300 rounded-md p-2 bg-gray-50">
        <label
          htmlFor={id}
          className="cursor-pointer inline-block p-2 border rounded-full hover:bg-gray-100 transition-colors"
        >
          <GrAdd color="blue" />
        </label>
        <span className="ml-4 flex-1 text-gray-700 truncate">
          {fileName ? fileName : "Ningún archivo seleccionado"}
        </span>
        {fileName && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-gray-500 hover:text-gray-700 ml-2"
          >
            X
          </button>
        )}
      </div>
      <input
        type="file"
        id={id}
        accept={accept}
        required={required}
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
    </div>
  );
}

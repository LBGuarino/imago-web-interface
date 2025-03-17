// src/services/googleHealthcareService.test.ts
import { google, healthcare_v1 } from "googleapis";
import type { GaxiosResponse } from "gaxios";

// Configuramos el mock de googleapis antes de importar nuestro módulo de servicio.
jest.mock("googleapis", () => {
  const originalModule = jest.requireActual("googleapis");
  return {
    ...originalModule,
    google: {
      healthcare: jest.fn(() => ({
        projects: {
          locations: {
            datasets: {
              dicomStores: {
                deidentify: jest.fn(),
              },
            },
          },
        },
      })),
      options: jest.fn(),
      auth: {
        GoogleAuth: jest.fn().mockImplementation(() => ({
          getClient: jest.fn().mockResolvedValue({}),
        })),
      },
    },
  };
});

describe("deidentifyDICOMService", () => {
  let deidentifyDICOMService: (
    projectId: string,
    location: string,
    datasetId: string,
    sourceDicomStoreId: string,
    deidentifyRequest: healthcare_v1.Schema$DeidentifyDicomStoreRequest
  ) => Promise<healthcare_v1.Schema$Operation>;
  
  let fakeHealthcareInstance: any;
  let deidentifyMock: jest.Mock;
  let googleMock: any;
  
  beforeEach(async () => {
    // Reinicia los módulos para que se reimporten usando nuestro mock
    jest.resetModules();
    // Reimporta el módulo de servicio
    const module = await import("./googleHealthcareService");
    deidentifyDICOMService = module.deidentifyDICOMService;
    
    // Reimporta google para configurar el retorno del mock
    const { google } = await import("googleapis");
    googleMock = google;
    
    // Define la instancia falsa que debe retornar google.healthcare('v1')
    fakeHealthcareInstance = {
      projects: {
        locations: {
          datasets: {
            dicomStores: {
              deidentify: jest.fn(),
            },
          },
        },
      },
    };
    // Forzamos que google.healthcare() retorne nuestra instancia falsa.
    googleMock.healthcare.mockReturnValue(fakeHealthcareInstance);
    
    // Extraemos el mock de la función de deidentify
    deidentifyMock = fakeHealthcareInstance.projects.locations.datasets.dicomStores.deidentify;
  });
  
  it("should call deidentify and return an operation", async () => {
    // Creamos una operación y respuesta falsas.
    const fakeOperation: healthcare_v1.Schema$Operation = { name: "operation-123", done: false };
    const fakeResponse: GaxiosResponse<healthcare_v1.Schema$Operation> = {
      data: fakeOperation,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
      request: {} as any,
    };
    
    // Configuramos el mock para que resuelva la respuesta falsa.
    deidentifyMock.mockResolvedValueOnce(fakeResponse);
    
    // Definimos los parámetros para la prueba.
    const projectId = "test-project";
    const location = "us-central1";
    const datasetId = "test-dataset";
    const sourceDicomStoreId = "source-store";
    
    // Template de configuración para de-identificar los DICOM.
    const deidentifyRequest: healthcare_v1.Schema$DeidentifyDicomStoreRequest = {
      destinationStore:
        "projects/test-project/locations/us-central1/datasets/test-dataset/dicomStores/destination-store",
      config: {
dicom: {
keepList: {},
removeList: {
tags: [
"00100010", // Nombre del paciente
"00100020", // ID del paciente
"00100030", // Fecha de nacimiento
"00100040", // Sexo del paciente
"00080050", // Número de Acceso
"00400020", // Identificador del estudio (opcional)
"00104000"  // Comentarios u otro texto sensible
],
},
},
      },
    };
    
    // Llamamos a la función de servicio.
    const result = await deidentifyDICOMService(
      projectId,
      location,
      datasetId,
      sourceDicomStoreId,
      deidentifyRequest
    );
    
    // Verificamos que se retorne la operación esperada.
    expect(result).toEqual(fakeOperation);
    // Verificamos que se haya llamado al mock con los parámetros correctos.
    expect(deidentifyMock).toHaveBeenCalledWith({
      sourceStore: `projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${sourceDicomStoreId}`,
      requestBody: deidentifyRequest,
    });
  });
});

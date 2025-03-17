// src/services/googleHealthcareService.ts
import { google, healthcare_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import type { GaxiosResponse } from 'gaxios';

const healthcare: healthcare_v1.Healthcare = google.healthcare('v1');

// Función para autenticar utilizando la cuenta de servicio.
async function authenticate(): Promise<OAuth2Client> {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.KEYFILE_PATH, // Asegúrate de definir esta variable de entorno.
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  return auth.getClient() as Promise<OAuth2Client>;
}

/**
 * Llama al endpoint de de-identificación.
 * @param projectId Identificador del proyecto.
 * @param location Ubicación (por ejemplo, "us-central1").
 * @param datasetId Identificador del dataset.
 * @param sourceDicomStoreId Identificador de la tienda DICOM origen.
 * @param deidentifyRequest Objeto con la configuración de de-identificación.
 * @returns Una operación asíncrona (Operation).
 */
export async function deidentifyDICOMService(
  projectId: string,
  location: string,
  datasetId: string,
  sourceDicomStoreId: string,
  deidentifyRequest: healthcare_v1.Schema$DeidentifyDicomStoreRequest
): Promise<healthcare_v1.Schema$Operation> {
  const authClient = await authenticate();
  google.options({ auth: authClient });

  // Construye el nombre del recurso de la tienda DICOM origen.
  const sourceStore: string = `projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${sourceDicomStoreId}`;

  // Define los parámetros para la llamada a la API.
  const params: healthcare_v1.Params$Resource$Projects$Locations$Datasets$Dicomstores$Deidentify = {
    sourceStore,
    requestBody: deidentifyRequest,
  };

  try {
    // La llamada retorna un objeto Operation.
    const response: GaxiosResponse<healthcare_v1.Schema$Operation> =
      await healthcare.projects.locations.datasets.dicomStores.deidentify(params);
    console.log('Operación de de-identificación iniciada:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error durante la de-identificación:', error);
    throw error;
  }
}

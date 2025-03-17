import { google, healthcare_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import type { GaxiosResponse } from "gaxios";
import axios from "axios";

const healthcare: healthcare_v1.Healthcare = google.healthcare("v1");

export async function authenticate(): Promise<OAuth2Client> {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.KEYFILE_PATH,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  return auth.getClient() as Promise<OAuth2Client>;
}

export async function uploadDicomToHealthcare(
  projectId: string,
  location: string,
  datasetId: string,
  dicomStoreId: string,
  fileBuffer: Buffer
): Promise<healthcare_v1.Schema$Operation> {
  const authClient = await authenticate();
  google.options({ auth: authClient });

  const parent = `projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;
  const url = `https://healthcare.googleapis.com/v1/${parent}/dicomWeb/studies`;

  const tokenResponse = await authClient.getAccessToken();
  const accessToken = typeof tokenResponse === "string" ? tokenResponse : tokenResponse.token;
  console.log("Access token:", accessToken);

  const response : GaxiosResponse<healthcare_v1.Schema$Operation> = 
    await axios.post(url, fileBuffer, {
      headers: {
        "Content-Type": "application/dicom",
        Authorization: `Bearer ${accessToken}`,
      },
      transformRequest: [(data: any) => data],
    });

    return response.data;
}
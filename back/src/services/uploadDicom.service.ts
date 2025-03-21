import { google, healthcare_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import type { GaxiosResponse } from "gaxios";
import axios from "axios";
import fs from "fs";
import { MammographyStudyRepository } from "../repositories/mammostudy.repository";
import { MammographySeriesRepository } from "../repositories/mammoseries.repository";
import { MammographyImageRepository } from "../repositories/mammoimage.repository";
import { Buffer } from "buffer";
import path from "path";

const healthcare: healthcare_v1.Healthcare = google.healthcare("v1");

interface MulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype?: string;
  size?: number;
}

export async function authenticate(): Promise<OAuth2Client> {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.KEYFILE_PATH,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  console.log("clave", process.env.KEYFILE_PATH);
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
  const accessToken =
    typeof tokenResponse === "string" ? tokenResponse : tokenResponse.token;

  const response: GaxiosResponse<healthcare_v1.Schema$Operation> =
    await axios.post(url, fileBuffer, {
      headers: {
        "Content-Type": "application/dicom",
        Authorization: `Bearer ${accessToken}`,
      },
      transformRequest: [(data: any) => data],
    });

  return response.data;
}

export async function saveMetadataToDB(
  dicomMetadata: any,
  file: Express.Multer.File
) {
  const {
    SOPInstanceUID: sopInstanceUID,
    SeriesInstanceUID: seriesInstanceUID,
    StudyInstanceUID: studyInstanceUID,
    PatientID: patientId,
    PatientName: patientName,
    StudyDate: studyDateStr,
    Modality: modality,
    ImageLaterality: laterality,
    ViewPosition: viewPosition,
  } = dicomMetadata;

  const studyDate = new Date(
    parseInt(studyDateStr.substring(0, 4)),
    parseInt(studyDateStr.substring(4, 6)) - 1,
    parseInt(studyDateStr.substring(6, 8))
  );

  let study = await MammographyStudyRepository.findOne({
    where: { studyInstanceUID },
  });
  if (!study) {
    study = MammographyStudyRepository.create({
      studyInstanceUID,
      patientId,
      patientName,
      studyDate,
      modality,
    });
    await MammographyStudyRepository.save(study);
  }

  let series = await MammographySeriesRepository.findOne({
    where: { seriesInstanceUID, viewPosition },
  });
  if (!series) {
    series = MammographySeriesRepository.create({
      seriesInstanceUID,
      laterality,
      viewPosition,
      study,
    });
    await MammographySeriesRepository.save(series);
  }

  const mammographyImage = MammographyImageRepository.create({
    sopInstanceUID,
    imageUrl: `ruta_donde_guardes/${file.originalname}`,
    originalMetadata: dicomMetadata,
    series,
  });

  await MammographyImageRepository.save(mammographyImage);
}

export async function dicomTxtLog(file: MulterFile) {
  try {
    const formData = new FormData();

    // Convertir el Buffer a Blob
    const blob = new Blob([file.buffer], { type: "application/dicom" });

    // Adjuntar el Blob al FormData
    formData.append("dicom_file", blob, file.originalname);

    const response = await axios.post(
      "http://localhost:5001/extract-metadata?format=txt",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "stream",
      }
    );

    const outputDir = path.resolve(__dirname, "../../../metadata_files");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.resolve(
      outputDir,
      `metadata-${file.originalname}.txt`
    );

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log(`✅ Archivo guardado como metadata-${file.originalname}.txt`);
  } catch (error) {
    console.error("❌ Error al guardar archivo metadata:", error);
    throw error;
  }
}

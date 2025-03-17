import { AppDataSource } from "../config/dataSource";
import { MammographyImage } from "../entities/MammoImage";

export const MammographyImageRepository = AppDataSource.getRepository(MammographyImage);
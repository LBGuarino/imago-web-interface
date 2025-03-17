import { AppDataSource } from "../config/dataSource";
import { MammographyStudy } from "../entities/MammoStudy";

export const MammographyStudyRepository = AppDataSource.getRepository(MammographyStudy);
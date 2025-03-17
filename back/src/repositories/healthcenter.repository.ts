import { AppDataSource } from "../config/dataSource";
import { Healthcenter } from "../entities/Healthcenter";

export const HealthcenterRepository = AppDataSource.getRepository(Healthcenter);
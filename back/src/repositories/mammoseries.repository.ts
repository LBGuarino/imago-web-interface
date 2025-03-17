import { AppDataSource } from "../config/dataSource";
import { MammographySeries } from "../entities/MammoSeries";

export const MammographySeriesRepository = AppDataSource.getRepository(MammographySeries);
import { DataSource } from "typeorm";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "./envs";
import { User } from "../entities/User";
import { MammographyStudy } from "../entities/MammoStudy";
import { MammographySeries } from "../entities/MammoSeries";
import { MammographyImage } from "../entities/MammoImage";
import { Healthcenter } from "../entities/Healthcenter";

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: !isProduction,
  // dropSchema: true,
  logging: isProduction,
  entities: [
    User,
    MammographyStudy,
    MammographySeries,
    MammographyImage,
    Healthcenter,
  ],
  migrations: [],
});

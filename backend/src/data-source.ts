import "reflect-metadata";
import { DataSource } from "typeorm";
import { Room } from "./entity/Room";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Use synchronize: false in production!
  synchronize: process.env.NODE_ENV !== "production",
  logging: false,
  entities: [Room],
  ssl: {
    rejectUnauthorized: false, // Common requirement for serverless DB providers
  },
  extra: {
    max: 2,
    connectionTimeoutMillis: 10000, // Increase to 10 seconds
  },
});

export const initializeDatabase = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};

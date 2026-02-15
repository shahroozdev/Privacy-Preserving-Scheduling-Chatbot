import "reflect-metadata";
import { DataSource } from "typeorm";
import { Room } from "./entity/Room";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "scheduling_chatbot",
  synchronize: true, // Auto-create tables for dev
  logging: false,
  entities: [Room],
  migrations: [],
  subscribers: [],
  ssl: true,
  extra: {
    max: 20, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000,
  },
});

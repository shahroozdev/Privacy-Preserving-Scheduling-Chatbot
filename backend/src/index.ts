import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import { NLPEngine } from "./nlp/processor";
import { MatchingEngine } from "./matching/engine";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const configPath = path.join(process.cwd(), "mockData.json");
const app = express();
app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is working!");
});
app.get("/rooms", async (req: Request, res: Response) => {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    res.json(config.rooms);
  } catch (error) {
    console.error("Rooms fetch error:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});
app.post("/parse", (req: Request, res: Response) => {
  try {
    const text = req.body.text;
    if (!text) {
      res.status(400).json({ error: "No text provided" });
      return;
    }
    const constraints = NLPEngine.extractConstraints(text);
    res.json(constraints);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/match", async (req: Request, res: Response) => {
  try {
    const text = req.body.text;
    if (!text) {
      res.status(400).json({ error: "No text provided" });
      return;
    }

    const constraints = NLPEngine.extractConstraints(text);
    console.log("Extracted Constraints:", constraints);

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const matchResult = MatchingEngine.findMatch(constraints, config.rooms);

    res.json(matchResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

import "reflect-metadata";
import express from "express";
import cors from "cors";
import { NLPEngine } from "./nlp/processor";
import { MatchingEngine } from "./matching/engine";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const getConfigPath = () => {
  const candidates = [
    path.join(process.cwd(), "mockData.json"),
    path.join(process.cwd(), "backend", "mockData.json"),
    path.join(__dirname, "..", "mockData.json"),
    path.join(__dirname, "..", "..", "mockData.json"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`mockData.json not found. Tried: ${candidates.join(", ")}`);
};

const getTestResultsPath = () => {
  const candidates = [
    path.join(process.cwd(), "test-results.json"),
    path.join(process.cwd(), "backend", "test-results.json"),
    path.join(__dirname, "..", "test-results.json"),
    path.join(__dirname, "..", "..", "test-results.json"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`test-results.json not found. Tried: ${candidates.join(", ")}`);
};
const app = express();
app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.get("/", (req: any, res: any) => {
  res.send("Server is working!");
});
app.get("/rooms", async (req: any, res: any) => {
  try {
    const configPath = getConfigPath();
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    res.json(config.rooms);
  } catch (error) {
    console.error("Rooms fetch error:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});
app.get("/test-results", (req: any, res: any) => {
  try {
    const resultPath = getTestResultsPath();
    const results = JSON.parse(fs.readFileSync(resultPath, "utf8"));
    res.json(results);
  } catch (error) {
    console.error("Test results fetch error:", error);
    res.status(404).json({ error: "Test results not found" });
  }
});
app.post("/parse", (req: any, res: any) => {
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

app.post("/match", async (req: any, res: any) => {
  try {
    const text = req.body.text;
    if (!text) {
      res.status(400).json({ error: "No text provided" });
      return;
    }

    const constraints = NLPEngine.extractConstraints(text);
    console.log("Extracted Constraints:", constraints);

    const configPath = getConfigPath();
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

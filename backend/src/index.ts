import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { NLPEngine } from "./nlp/processor";
import { MatchingEngine } from "./matching/engine";
import { Room } from "./entity/Room";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize DB
AppDataSource.initialize().then(async () => {
    console.log("Database connected.");
}).catch(error => console.log(error));

// Endpoint A: Parse (NLP Only) - useful for testing/eval
app.post("/parse", (req, res) => {
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

// Endpoint B: Match (Full Pipeline)
app.post("/match", async (req, res) => {
    try {
        const text = req.body.text;
        if (!text) {
             res.status(400).json({ error: "No text provided" });
             return;
        }

        // 1. Module A: NLP
        const constraints = NLPEngine.extractConstraints(text);
        console.log("Extracted Constraints:", constraints);

        // 2. Module B: Matching
        const roomRepo = AppDataSource.getRepository(Room);
        const rooms = await roomRepo.find();
        const matchResult = MatchingEngine.findMatch(constraints, rooms);

        // 3. Response
        res.json(matchResult);

        // Privacy: No logs of user text stored in DB. 
        // We only logged to console for debug (Module C note: in prod, remove console.log or anonymize)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

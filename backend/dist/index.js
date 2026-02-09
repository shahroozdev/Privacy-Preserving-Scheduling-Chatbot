"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const data_source_1 = require("./data-source");
const processor_1 = require("./nlp/processor");
const engine_1 = require("./matching/engine");
const Room_1 = require("./entity/Room");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize DB
data_source_1.AppDataSource.initialize().then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Database connected.");
})).catch(error => console.log(error));
// Endpoint A: Parse (NLP Only) - useful for testing/eval
app.post("/parse", (req, res) => {
    try {
        const text = req.body.text;
        if (!text) {
            res.status(400).json({ error: "No text provided" });
            return;
        }
        const constraints = processor_1.NLPEngine.extractConstraints(text);
        res.json(constraints);
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Endpoint B: Match (Full Pipeline)
app.post("/match", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const text = req.body.text;
        if (!text) {
            res.status(400).json({ error: "No text provided" });
            return;
        }
        // 1. Module A: NLP
        const constraints = processor_1.NLPEngine.extractConstraints(text);
        console.log("Extracted Constraints:", constraints);
        // 2. Module B: Matching
        const roomRepo = data_source_1.AppDataSource.getRepository(Room_1.Room);
        const rooms = yield roomRepo.find();
        const matchResult = engine_1.MatchingEngine.findMatch(constraints, rooms);
        // 3. Response
        res.json(matchResult);
        // Privacy: No logs of user text stored in DB. 
        // We only logged to console for debug (Module C note: in prod, remove console.log or anonymize)
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

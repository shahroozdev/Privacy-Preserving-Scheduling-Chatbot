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
// Database initialization flag (persists during warm starts)
let dbInitialized = false;
// Initialize database once per cold start
const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!dbInitialized && !data_source_1.AppDataSource.isInitialized) {
        try {
            yield data_source_1.AppDataSource.initialize();
            dbInitialized = true;
            console.log("✅ Database connected");
        }
        catch (error) {
            console.error("❌ Database initialization failed:", error);
            throw error;
        }
    }
});
// Health check
app.get("/", (req, res) => {
    res.json({
        status: "API is running",
        endpoints: ["/parse", "/match", "/rooms"]
    });
});
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
        console.error("Parse error:", error);
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
        // Ensure DB is connected
        yield initializeDatabase();
        // 1. Module A: NLP
        const constraints = processor_1.NLPEngine.extractConstraints(text);
        if (process.env.NODE_ENV === "development") {
            console.log("Extracted Constraints:", constraints);
        }
        // 2. Module B: Matching
        const roomRepo = data_source_1.AppDataSource.getRepository(Room_1.Room);
        const rooms = yield roomRepo.find();
        const matchResult = engine_1.MatchingEngine.findMatch(constraints, rooms);
        // 3. Response
        res.json(matchResult);
    }
    catch (error) {
        console.error("Match error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Get all rooms
app.get("/rooms", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield initializeDatabase();
        const roomRepo = data_source_1.AppDataSource.getRepository(Room_1.Room);
        const rooms = yield roomRepo.find();
        console.log(rooms, 'rooms');
        res.json(rooms);
    }
    catch (error) {
        console.error("Rooms fetch error:", error);
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
}));
// Export for Vercel serverless
exports.default = app;
// Local development only
if (require.main === module) {
    const PORT = process.env.PORT || 4000;
    initializeDatabase().then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on ${PORT}`);
        });
    }).catch((error) => {
        console.error("Failed to start server:", error);
        process.exit(1);
    });
}

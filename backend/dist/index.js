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
const processor_1 = require("./nlp/processor");
const engine_1 = require("./matching/engine");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const configPath = path_1.default.join(process.cwd(), "mockData.json");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Server is working!");
});
app.get("/rooms", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = JSON.parse(fs_1.default.readFileSync(configPath, "utf8"));
        res.json(config.rooms);
    }
    catch (error) {
        console.error("Rooms fetch error:", error);
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
}));
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
app.post("/match", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const text = req.body.text;
        if (!text) {
            res.status(400).json({ error: "No text provided" });
            return;
        }
        const constraints = processor_1.NLPEngine.extractConstraints(text);
        console.log("Extracted Constraints:", constraints);
        const config = JSON.parse(fs_1.default.readFileSync(configPath, "utf8"));
        const matchResult = engine_1.MatchingEngine.findMatch(constraints, config.rooms);
        res.json(matchResult);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

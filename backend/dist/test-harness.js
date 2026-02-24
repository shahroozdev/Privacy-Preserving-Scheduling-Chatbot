"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const processor_1 = require("./nlp/processor");
const engine_1 = require("./matching/engine");
dotenv_1.default.config();
const HARNESS_MODE = process.env.HARNESS_MODE || "local";
const BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
const DATA_PATH = path.join(__dirname, "../mockData.json");
const TEST_SENTENCES = [
    {
        text: "I need a room for 6 people with a projector at 14:00",
        expected: { capacity: 6, time: "14:00", features: ["projector"] },
        evaluateNlp: true,
    },
    {
        text: "Meeting for 10 pax with wifi",
        expected: { capacity: 10, features: ["wifi"] },
        evaluateNlp: true,
    },
    {
        text: "Small room for 2 at 9am",
        expected: { capacity: 2, time: "09:00" },
        evaluateNlp: true,
    },
    {
        text: "Conference room with tv and whiteboard",
        expected: { features: ["tv", "whiteboard"] },
        evaluateNlp: true,
    },
    {
        text: "Need a spot for 5 users",
        expected: { capacity: 5 },
        evaluateNlp: true,
    },
    {
        text: "I need a place for five peeps with projector pls",
        expected: { features: ["projector"] },
        evaluateNlp: true,
    },
];
function generateRandomTests(count) {
    const templates = [
        "I need a room for {N} people with {F} at {T}",
        "Book a space for {N} pax",
        "Meeting room with {F}",
        "Room for {N} at {T}",
        "Can I get a room with {F} and {F}?",
        "Schedule a meeting for {N} users",
    ];
    const features = [
        "projector",
        "whiteboard",
        "wifi",
        "tv",
        "screen",
        "monitor",
    ];
    const times = ["14:00", "2pm", "9am", "10:30", "15:00"];
    const tests = [];
    for (let i = 0; i < count; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const n = Math.floor(Math.random() * 20) + 1;
        const f1 = features[Math.floor(Math.random() * features.length)];
        const f2 = features[Math.floor(Math.random() * features.length)];
        const t = times[Math.floor(Math.random() * times.length)];
        const text = template
            .replace("{N}", n.toString())
            .replace("{F}", f1)
            .replace("{T}", t)
            .replace("{F}", f2);
        tests.push({ text, expected: {}, evaluateNlp: false });
    }
    return tests;
}
function nlpPass(expected, extracted) {
    if (expected.capacity !== undefined && extracted.capacity !== expected.capacity) {
        return false;
    }
    if (expected.time !== undefined && extracted.time !== expected.time) {
        return false;
    }
    if (expected.features && expected.features.length > 0) {
        const lowerFound = (extracted.requirements || []).map((f) => f.toLowerCase());
        for (const feature of expected.features) {
            if (!lowerFound.includes(feature.toLowerCase())) {
                return false;
            }
        }
    }
    return true;
}
function getRooms() {
    const config = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    return config.rooms;
}
function getMatch(text, rooms) {
    return __awaiter(this, void 0, void 0, function* () {
        if (HARNESS_MODE === "http") {
            const res = yield axios_1.default.post(`${BASE_URL}/match`, { text });
            return res.data;
        }
        const constraints = processor_1.NLPEngine.extractConstraints(text);
        return engine_1.MatchingEngine.findMatch(constraints, rooms);
    });
}
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Starting Test Harness... mode=${HARNESS_MODE}`);
        const rooms = getRooms();
        const generated = generateRandomTests(94);
        const allTests = [...TEST_SENTENCES, ...generated];
        const stats = {
            totalTests: allTests.length,
            exactMatches: 0,
            heuristicMatches: 0,
            noneMatches: 0,
            failures: 0,
            nlpFailures: 0,
            connectionFailures: 0,
        };
        for (const test of allTests) {
            try {
                const extracted = processor_1.NLPEngine.extractConstraints(test.text);
                if (test.evaluateNlp && !nlpPass(test.expected, extracted)) {
                    stats.nlpFailures++;
                }
                const result = yield getMatch(test.text, rooms);
                if (result.matchType === "EXACT") {
                    stats.exactMatches++;
                }
                else if (result.matchType === "HEURISTIC") {
                    stats.heuristicMatches++;
                }
                else if (result.matchType === "NONE") {
                    stats.noneMatches++;
                }
                else {
                    stats.failures++;
                }
            }
            catch (error) {
                console.error(`Error processing: ${test.text}`);
                if (axios_1.default.isAxiosError(error) && !error.response) {
                    stats.connectionFailures++;
                }
                stats.failures++;
            }
        }
        console.log("\n--- Evaluation Results ---");
        console.log(JSON.stringify(stats, null, 2));
        const outputPath = path.join(__dirname, "../test-results.json");
        fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));
        console.log(`\nResults saved to ${outputPath}`);
    });
}
runTests();

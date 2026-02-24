import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { NLPEngine } from "./nlp/processor";
import { MatchingEngine, Room } from "./matching/engine";

dotenv.config();

const HARNESS_MODE = process.env.HARNESS_MODE || "local";
const BASE_URL =
  process.env.TEST_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
const DATA_PATH = path.join(__dirname, "../mockData.json");

type Expected = {
  capacity?: number;
  time?: string;
  features?: string[];
};

type TestCase = {
  text: string;
  expected: Expected;
  evaluateNlp: boolean;
};

const TEST_SENTENCES: TestCase[] = [
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

function generateRandomTests(count: number): TestCase[] {
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

  const tests: TestCase[] = [];
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

function nlpPass(expected: Expected, extracted: any): boolean {
  if (expected.capacity !== undefined && extracted.capacity !== expected.capacity) {
    return false;
  }
  if (expected.time !== undefined && extracted.time !== expected.time) {
    return false;
  }
  if (expected.features && expected.features.length > 0) {
    const lowerFound = (extracted.requirements || []).map((f: string) =>
      f.toLowerCase(),
    );
    for (const feature of expected.features) {
      if (!lowerFound.includes(feature.toLowerCase())) {
        return false;
      }
    }
  }
  return true;
}

function getRooms(): Room[] {
  const config = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  return config.rooms as Room[];
}

async function getMatch(text: string, rooms: Room[]) {
  if (HARNESS_MODE === "http") {
    const res = await axios.post(`${BASE_URL}/match`, { text });
    return res.data;
  }

  const constraints = NLPEngine.extractConstraints(text);
  return MatchingEngine.findMatch(constraints, rooms);
}

async function runTests() {
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
      const extracted = NLPEngine.extractConstraints(test.text);
      if (test.evaluateNlp && !nlpPass(test.expected, extracted)) {
        stats.nlpFailures++;
      }

      const result = await getMatch(test.text, rooms);
      if (result.matchType === "EXACT") {
        stats.exactMatches++;
      } else if (result.matchType === "HEURISTIC") {
        stats.heuristicMatches++;
      } else if (result.matchType === "NONE") {
        stats.noneMatches++;
      } else {
        stats.failures++;
      }
    } catch (error) {
      console.error(`Error processing: ${test.text}`);
      if (axios.isAxiosError(error) && !error.response) {
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
}

runTests();

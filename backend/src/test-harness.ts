import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:4000';

const TEST_SENTENCES = [
    { text: "I need a room for 6 people with a projector at 14:00", expected: { capacity: 6, time: "14:00", features: ["projector"] } },
    { text: "Meeting for 10 pax with wifi", expected: { capacity: 10, features: ["wifi"] } },
    { text: "Small room for 2 at 9am", expected: { capacity: 2, time: "09:00" } },
    { text: "Conference room with tv and whiteboard", expected: { features: ["tv", "whiteboard"] } },
    { text: "Need a spot for 5 users", expected: { capacity: 5 } },
    // Generate more variations programmatically below
];

// Helper to generate random sentences
function generateRandomTests(count: number) {
    const templates = [
        "I need a room for {N} people with {F} at {T}",
        "Book a space for {N} pax",
        "Meeting room with {F}",
        "Room for {N} at {T}",
        "Can I get a room with {F} and {F}?",
        "Schedule a meeting for {N} users"
    ];
    const features = ["projector", "whiteboard", "wifi", "tv", "screen", "monitor"];
    const times = ["14:00", "2pm", "9am", "10:30", "15:00"];
    
    const tests = [];
    for(let i=0; i<count; i++) {
        let template = templates[Math.floor(Math.random() * templates.length)];
        const n = Math.floor(Math.random() * 20) + 1;
        const f = features[Math.floor(Math.random() * features.length)];
        const t = times[Math.floor(Math.random() * times.length)];
        
        const text = template
            .replace("{N}", n.toString())
            .replace("{F}", f)
            .replace("{T}", t)
            .replace("{F}", features[Math.floor(Math.random() * features.length)]); // replace second F if exists
            
        tests.push({ text, expected: { capacity: n } }); // Simplified expectation for generated ones
    }
    return tests;
}

async function runTests() {
    console.log("Starting Test Harness...");
    
    const generated = generateRandomTests(95);
    const allTests = [...TEST_SENTENCES, ...generated];
    
    const stats = {
        totalTests: allTests.length,
        exactMatches: 0,
        heuristicMatches: 0,
        failures: 0,
        nlpFailures: 0
    };

    for (const test of allTests) {
        try {
            // Test NLP via /parse first (optional, but good for debug)
            // But main goal is /match result
            const res = await axios.post(`${BASE_URL}/match`, { text: test.text });
            const result = res.data;

            if (result.matchType === 'EXACT') {
                stats.exactMatches++;
            } else if (result.matchType === 'HEURISTIC') {
                stats.heuristicMatches++;
            } else {
                stats.failures++;
            }

            // Simple console log for progress
            // console.log(`[${result.matchType}] ${test.text} -> ${result.room}`);

        } catch (error) {
            console.error(`Error processing: ${test.text}`);
            stats.failures++;
        }
    }

    console.log("\n--- Evaluation Results ---");
    console.log(JSON.stringify(stats, null, 2));

    const outputPath = path.join(__dirname, '../test-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));
    console.log(`\nResults saved to ${outputPath}`);
}

runTests();

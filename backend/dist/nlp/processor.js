"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NLPEngine = void 0;
const compromise_1 = __importDefault(require("compromise"));
class NLPEngine {
    // 1: version
    // public static extractConstraints(text: string): SchedulingConstraints {
    //     const doc = nlp(text);
    //     const constraints: SchedulingConstraints = {
    //         requirements: []
    //     };
    //     // 1. Extract Capacity
    //     // Look for patterns like "6 people", "for 5", "capacity of 10"
    //     const numbers = doc.numbers().json();
    //     // Simple heuristic: if a number is followed by "people", "pax", "users", "seats", it's likely capacity.
    //     // Or if it's the only number and small (< 50).
    //     for (const num of numbers) {
    //          const val = num.number;
    //          // Check context
    //          // "6 people" -> doc.match('6 people').found
    //          // compromise .after() is useful here, but json() gives limited context.
    //          // Let's use match syntax.
    //          if (doc.match(`${val} (people|pax|users|seats|attendees)`).found) {
    //              constraints.capacity = val;
    //              break;
    //          }
    //          // Fallback: "room for 6"
    //          if (doc.match(`for ${val}`).found) {
    //              constraints.capacity = val;
    //              break;
    //          }
    //     }
    //     // Fallback: if no capacity found, pick the first number that isn't a time?
    //     // Let's rely on explicit mentions first.
    //     // 2. Extract Time
    //     // We need HH:mm format.
    //     // We will look for time-like patterns using regex.
    //     // Regex logic below
    //     const timeMatch = text.match(/(\d{1,2})[:\.](\d{2})/);
    //     if (timeMatch) {
    //         let h = parseInt(timeMatch[1]);
    //         const m = timeMatch[2];
    //         if (text.toLowerCase().includes("pm") && h < 12) h += 12;
    //         if (text.toLowerCase().includes("am") && h === 12) h = 0;
    //         constraints.time = `${h.toString().padStart(2, '0')}:${m}`;
    //     } else {
    //         // Handle "2pm", "2 pm", "1400"
    //         const hourMatch = text.match(/(\d{1,2})\s*(am|pm)/i);
    //         if (hourMatch) {
    //             let h = parseInt(hourMatch[1]);
    //             const period = hourMatch[2].toLowerCase();
    //             if (period === 'pm' && h < 12) h += 12;
    //             if (period === 'am' && h === 12) h = 0;
    //             constraints.time = `${h.toString().padStart(2, '0')}:00`;
    //         }
    //     }
    //     // 3. Extract Requirements
    //     // Check for existence of known features
    //     const normalizedText = text.toLowerCase();
    //     for (const feature of this.KNOWN_FEATURES) {
    //         // singularize/pluralize check could be done by compromise,
    //         // but simple includes is robust for keywords.
    //         // "projectors" -> includes "projector"
    //         if (normalizedText.includes(feature)) {
    //             constraints.requirements.push(feature);
    //         }
    //     }
    //     return constraints;
    // }
    // 2: version
    static extractConstraints(text) {
        const doc = (0, compromise_1.default)(text);
        // Normalize "ten" -> "10" and "fifth" -> "5"
        doc.numbers().toNumber();
        const normalizedText = doc.text();
        const lowerText = normalizedText.toLowerCase();
        const constraints = {
            requirements: [],
        };
        // 1. Extract Capacity from normalized text ("five peeps" -> "5 peeps")
        const directCapacityMatch = lowerText.match(/\b(\d+)\s*(people|peeps|pax|users|seats|attendees|persons)\b/);
        const forCapacityMatch = lowerText.match(/\bfor\s+(\d+)\b/);
        if (directCapacityMatch) {
            constraints.capacity = parseInt(directCapacityMatch[1], 10);
        }
        else if (forCapacityMatch) {
            constraints.capacity = parseInt(forCapacityMatch[1], 10);
        }
        // 2. Extract Time
        const timeMatch = normalizedText.match(/(\d{1,2})[:\.](\d{2})/);
        if (timeMatch) {
            let h = parseInt(timeMatch[1]);
            const m = timeMatch[2];
            if (normalizedText.toLowerCase().includes("pm") && h < 12)
                h += 12;
            if (normalizedText.toLowerCase().includes("am") && h === 12)
                h = 0;
            constraints.time = `${h.toString().padStart(2, "0")}:${m}`;
        }
        else {
            const hourMatch = normalizedText.match(/(\d{1,2})\s*(am|pm)/i);
            if (hourMatch) {
                let h = parseInt(hourMatch[1]);
                const period = hourMatch[2].toLowerCase();
                if (period === "pm" && h < 12)
                    h += 12;
                if (period === "am" && h === 12)
                    h = 0;
                constraints.time = `${h.toString().padStart(2, "0")}:00`;
            }
        }
        // 3. Extract Requirements
        for (const feature of this.KNOWN_FEATURES) {
            if (lowerText.includes(feature)) {
                constraints.requirements.push(feature);
            }
        }
        return constraints;
    }
}
exports.NLPEngine = NLPEngine;
// Common meeting room features to look for
NLPEngine.KNOWN_FEATURES = [
    "projector",
    "whiteboard",
    "tv",
    "screen",
    "wifi",
    "conference phone",
    "sound system",
    "video",
    "camera",
    "monitor",
    "hdmi",
    "mac adapter",
    "pc",
];

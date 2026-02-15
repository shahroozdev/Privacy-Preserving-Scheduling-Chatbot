import { Room } from "../entity/Room";
import { SchedulingConstraints } from "../nlp/processor";
import { to12Hour } from "../utils";

export interface MatchResult {
    matchType: 'EXACT' | 'HEURISTIC' | 'NONE';
    room?: Room;
    explanation?: string;
    alternatives?: Room[];
}

export class MatchingEngine {
    static findMatch(request: SchedulingConstraints, rooms: Room[]): MatchResult {
        console.log(request, 'request')
        const exactMatches = rooms.filter(r => {
            if (request.capacity && r.capacity < request.capacity) return false;
            if (request.time && !r.availableSlots.includes(request.time)) return false;
            if (request.requirements) {
                const hasAll = request.requirements.every(req => r.features.includes(req));
                if (!hasAll) return false;
            }
            return true;
        });

        if (exactMatches.length > 0) {
            exactMatches.sort((a, b) => a.capacity - b.capacity);
            return {
                matchType: 'EXACT',
                room: exactMatches[0],
                explanation: `Perfect match! ${exactMatches[0].name} has capacity ${exactMatches[0].capacity}, includes all requested features, and is available at ${to12Hour(request?.time as string)}.`
            };
        }

        let bestRoom: Room | null = null;
        let bestScore = -Infinity;
        let bestExplanation = "";

        for (const r of rooms) {
            let score = 0;
            const reasons: string[] = [];

            if (request.capacity) {
                if (r.capacity >= request.capacity) {
                    score += 10;
                } else {
                    continue; 
                }
            }

            if (request.time) {
                if (r.availableSlots.includes(request.time)) {
                    score += 20;
                } else {
                    // Basic check for nearby times could go here
                    // For now, treat as missing constraint
                    score -= 5;
                    reasons.push(`Time ${request.time} not available`);
                }
            }

            if (request.requirements) {
                const missing = request.requirements.filter(req => !r.features.includes(req));
                if (missing.length === 0) {
                    score += 20;
                } else if (missing.length === 1) {
                    score += 10;
                    reasons.push(`Missing feature: ${missing[0]}`);
                } else {
                    continue;
                }
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestRoom = r;
                bestExplanation = `Heuristic match. ${reasons.join(", ")}.`;
            }
        }

        if (bestRoom) {
            return {
                matchType: 'HEURISTIC',
                room: bestRoom,
                explanation: bestExplanation || "Best available option."
            };
        }

        return { matchType: 'NONE', explanation: "No suitable room found." };
    }
}

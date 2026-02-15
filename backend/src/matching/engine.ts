import { Room } from "../entity/Room";
import { SchedulingConstraints } from "../nlp/processor";

export interface MatchResult {
  matchType: "EXACT" | "HEURISTIC" | "NONE";
  room?: Room;
  explanation?: string;
  alternatives?: Room[];
}
interface TimeAlternative {
  room: Room;
  slot: string;
  diff: number;
}
export class MatchingEngine {
  // 1:version
  // static findMatch(request: SchedulingConstraints, rooms: Room[]): MatchResult {
  //     console.log(request, 'request')
  //     const exactMatches = rooms.filter(r => {
  //         if (request.capacity.num && r.capacity < request.capacity.num) return false;
  //         if (request.time && !r.availableSlots.includes(request.time)) return false;
  //         if (request.requirements) {
  //             const hasAll = request.requirements.every(req => r.features.includes(req));
  //             if (!hasAll) return false;
  //         }
  //         return true;
  //     });

  //     if (exactMatches.length > 0) {
  //         exactMatches.sort((a, b) => a.capacity - b.capacity);
  //         return {
  //             matchType: 'EXACT',
  //             room: exactMatches[0],
  //             explanation: `Perfect match! ${exactMatches[0].name} has capacity ${exactMatches[0].capacity}, includes all requested features, and is available at ${request?.time}.`
  //         };
  //     }

  //     let bestRoom: Room | null = null;
  //     let bestScore = -Infinity;
  //     let bestExplanation = "";

  //     for (const r of rooms) {
  //         let score = 0;
  //         const reasons: string[] = [];

  //         if (request.capacity) {
  //             if (r.capacity >= request.capacity) {
  //                 score += 10;
  //             } else {
  //                 continue;
  //             }
  //         }

  //         if (request.time) {
  //             if (r.availableSlots.includes(request.time)) {
  //                 score += 20;
  //             } else {
  //                 // Basic check for nearby times could go here
  //                 // For now, treat as missing constraint
  //                 score -= 5;
  //                 reasons.push(`Time ${request.time} not available`);
  //             }
  //         }

  //         if (request.requirements) {
  //             const missing = request.requirements.filter(req => !r.features.includes(req));
  //             if (missing.length === 0) {
  //                 score += 20;
  //             } else if (missing.length === 1) {
  //                 score += 10;
  //                 reasons.push(`Missing feature: ${missing[0]}`);
  //             } else {
  //                 continue;
  //             }
  //         }

  //         if (score > bestScore) {
  //             bestScore = score;
  //             bestRoom = r;
  //             bestExplanation = `Heuristic match. ${reasons.join(", ")}.`;
  //         }
  //     }

  //     if (bestRoom) {
  //         return {
  //             matchType: 'HEURISTIC',
  //             room: bestRoom,
  //             explanation: bestExplanation || "Best available option."
  //         };
  //     }

  //     return { matchType: 'NONE', explanation: "No suitable room found." };
  // }
  // 2:version
  static findMatch(request: SchedulingConstraints, rooms: Room[]): MatchResult {
    const reqCap =
      typeof request.capacity === "object"
        ? request.capacity.num
        : request.capacity;
    const { time, requirements } = request;
    const reqMin = time ? this.timeToMinutes(time) : null;

    // Use the interface here to prevent the 'never' type error
    let bestTimeAlt: TimeAlternative | null = null;
    let bestSizeAlt: Room | null = null;
    // 2. STRICT EXACT MATCH FILTER
    const exactMatches = rooms.filter((r) => {
      // Check capacity: Room must be able to fit the request
      const hasCap = r.capacity >= reqCap;

      // Check time: Trim spaces to avoid "14:00" !== "14:00 "
      const hasTime = time
        ? r.availableSlots.map((s) => s.trim()).includes(time.trim())
        : true;

      // Check features: Lowercase both for a "fuzzy" match
      const hasFeats = requirements.every((req) =>
        r.features.map((f) => f.toLowerCase()).includes(req.toLowerCase()),
      );

      return hasCap && hasTime && hasFeats;
    });

    // 3. IF EXACT FOUND, STOP HERE
    if (exactMatches.length > 0) {
      // Get the smallest room that satisfies the requirement (most efficient)
      const best = exactMatches.sort((a, b) => a.capacity - b.capacity)[0];
      return {
        matchType: "EXACT",
        room: best,
        explanation: `I found an exact match! ${best.name} is available at ${this.to12Hour(time as string)}.`,
      };
    }
    for (const r of rooms) {
      const hasFeats = requirements.every((f) => r.features.includes(f));
      if (!hasFeats) continue;

      // Alternative A: Closest Time for requested capacity
      if (reqCap && r.capacity >= reqCap && reqMin !== null) {
        for (const slot of r.availableSlots) {
          const diff = Math.abs(this.timeToMinutes(slot) - reqMin);
          if (!bestTimeAlt || diff < bestTimeAlt.diff) {
            bestTimeAlt = { room: r, slot, diff };
          }
        }
      }

      // Alternative B: Best size for requested time
      if (time && r.availableSlots.includes(time)) {
        if (!bestSizeAlt || r.capacity > bestSizeAlt.capacity) {
          bestSizeAlt = r;
        }
      }
    }

    // 3. Final Synthesis
    if (bestTimeAlt || bestSizeAlt) {
      let options: string[] = [];

      // TypeScript now knows bestTimeAlt is either null or a TimeAlternative
      if (bestTimeAlt) {
        options.push(
          `${bestTimeAlt.room.name} is available at ${this.to12Hour(bestTimeAlt.slot as string)} fits ${bestTimeAlt.room.capacity} people`,
        );
      }

      if (
        bestSizeAlt &&
        (!bestTimeAlt || bestSizeAlt.name !== bestTimeAlt.room.name)
      ) {
        options.push(
          `${bestSizeAlt.name} fits ${bestSizeAlt.capacity} people at ${this.to12Hour(time as string)}`,
        );
      }

      return {
        matchType: "HEURISTIC",
        room: bestTimeAlt?.room || bestSizeAlt!,
        explanation: `I couldn't find an exact match. However, ${options.join("; or ")}.`,
      };
    }

    return {
      matchType: "NONE",
      explanation: "No rooms meet your requirements.",
    };
  }
  // Helper to convert "17:00" to 1020 minutes
  private static timeToMinutes(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }
  private static to12Hour(time24:string) {
  const [hours, minutes] = time24.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}
}

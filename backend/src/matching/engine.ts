import { SchedulingConstraints } from "../nlp/processor";

export interface Room {
  id: string | number;
  name: string;
  capacity: number;
  features: string[];
  availableSlots: string[];
}

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
  static findMatch(request: SchedulingConstraints, rooms: Room[]): MatchResult {
    const reqCap = this.normalizeCapacity(request.capacity);
    const reqTime = request.time?.trim() || null;
    const reqTimeMinutes = reqTime ? this.timeToMinutes(reqTime) : null;
    const reqFeatures = (request.requirements || []).map((feature) =>
      feature.toLowerCase(),
    );

    let bestExact: Room | null = null;
    let bestExactSpareCapacity = Number.POSITIVE_INFINITY;

    let bestHeuristicAboveCapacity: { room: Room; score: number; slot?: string } | null =
      null;
    let bestHeuristicBelowCapacity: { room: Room; score: number; slot?: string } | null =
      null;
    let bestTimeAlt: TimeAlternative | null = null;
    let bestSizeAlt: Room | null = null;

    for (const room of rooms) {
      const normalizedFeatures = new Set(
        room.features.map((feature) => feature.toLowerCase()),
      );
      const normalizedSlots = room.availableSlots.map((slot) => slot.trim());

      const matchedFeatureCount = reqFeatures.reduce(
        (count, feature) => count + (normalizedFeatures.has(feature) ? 1 : 0),
        0,
      );
      const allFeaturesMatch = matchedFeatureCount === reqFeatures.length;

      const hasCapacity = reqCap === null ? true : room.capacity >= reqCap;
      const exactTimeMatch = reqTime ? normalizedSlots.includes(reqTime) : true;

      if (hasCapacity && exactTimeMatch && allFeaturesMatch) {
        const spareCapacity = reqCap === null ? room.capacity : room.capacity - reqCap;
        if (spareCapacity < bestExactSpareCapacity) {
          bestExact = room;
          bestExactSpareCapacity = spareCapacity;
        }
      }

      const capacityScore =
        reqCap === null
          ? 20
          : room.capacity >= reqCap
            ? 40 - Math.min(room.capacity - reqCap, 30)
            : Math.max(0, 20 - Math.min(reqCap - room.capacity, 20));

      let timeScore = 10;
      let closestSlot: string | undefined;
      if (reqTimeMinutes !== null) {
        let minDiff = Number.POSITIVE_INFINITY;
        for (const slot of normalizedSlots) {
          const diff = Math.abs(this.timeToMinutes(slot) - reqTimeMinutes);
          if (diff < minDiff) {
            minDiff = diff;
            closestSlot = slot;
          }
        }
        timeScore = Math.max(0, 30 - Math.floor(minDiff / 15) * 5);

        if (hasCapacity && allFeaturesMatch && closestSlot) {
          if (!bestTimeAlt || minDiff < bestTimeAlt.diff) {
            bestTimeAlt = { room, slot: closestSlot, diff: minDiff };
          }
        }
      }

      const featureScore =
        reqFeatures.length === 0
          ? 20
          : Math.round((matchedFeatureCount / reqFeatures.length) * 30);

      const heuristicScore = capacityScore + timeScore + featureScore;
      if (reqCap !== null && room.capacity < reqCap) {
        if (
          !bestHeuristicBelowCapacity ||
          heuristicScore > bestHeuristicBelowCapacity.score
        ) {
          bestHeuristicBelowCapacity = {
            room,
            score: heuristicScore,
            slot: closestSlot,
          };
        }
      } else {
        if (
          !bestHeuristicAboveCapacity ||
          heuristicScore > bestHeuristicAboveCapacity.score
        ) {
          bestHeuristicAboveCapacity = {
            room,
            score: heuristicScore,
            slot: closestSlot,
          };
        }
      }

      if (
        reqTime &&
        normalizedSlots.includes(reqTime) &&
        allFeaturesMatch &&
        (!bestSizeAlt || room.capacity > bestSizeAlt.capacity)
      ) {
        bestSizeAlt = room;
      }
    }

    if (bestExact) {
      return {
        matchType: "EXACT",
        room: bestExact,
        explanation: reqTime
          ? `I found an exact match. ${bestExact.name} is available at ${this.to12Hour(reqTime)}.`
          : `I found an exact match. ${bestExact.name} fits your requirements with capcity ${bestExact.capacity} and features: ${bestExact.features}.`,
      };
    }

    const bestHeuristic = bestHeuristicAboveCapacity || bestHeuristicBelowCapacity;
    if (bestHeuristic) {
      const alternatives: Room[] = [];
      if (bestTimeAlt) alternatives.push(bestTimeAlt.room);
      if (bestSizeAlt && !alternatives.some((r) => r.id === bestSizeAlt.id)) {
        alternatives.push(bestSizeAlt);
      }

      const suggestedSlot =
        bestHeuristic.slot ||
        bestTimeAlt?.slot ||
        bestHeuristic.room.availableSlots[0];

      return {
        matchType: "HEURISTIC",
        room: bestHeuristic.room,
        explanation:
          reqCap !== null && bestHeuristic.room.capacity < reqCap
            ? `I couldn't find a room for ${reqCap} people, but the closest option is ${bestHeuristic.room.name} with capacity  ${bestHeuristic.room.capacity} and features: ${bestHeuristic.room.features}${suggestedSlot ? ` at ${this.to12Hour(suggestedSlot)}` : ""}.`
            : `I couldn't find an exact match. The best alternative is ${bestHeuristic.room.name}${suggestedSlot ? ` at ${this.to12Hour(suggestedSlot)}` : ""} with capacity ${bestHeuristic.room.capacity} and features: ${bestHeuristic.room.features}.`,
        alternatives: alternatives.length > 0 ? alternatives : undefined,
      };
    }

    return { matchType: "NONE", explanation: "No rooms meet your requirements." };
  }
  
  private static normalizeCapacity(capacity: SchedulingConstraints["capacity"]): number | null {
    if (typeof capacity === "number" && Number.isFinite(capacity)) {
      return capacity;
    }
    if (
      typeof capacity === "object" &&
      capacity !== null &&
      typeof capacity.num === "number" &&
      Number.isFinite(capacity.num)
    ) {
      return capacity.num;
    }
    return null;
  }

  private static timeToMinutes(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }
  
  private static to12Hour(time24: string) {
    const [hours, minutes] = time24.split(":").map(Number);

    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  }
}

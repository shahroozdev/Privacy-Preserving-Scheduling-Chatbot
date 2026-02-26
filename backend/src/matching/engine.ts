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
  matchScore?: number;
  suggestedSlot?: string;
  alternatives?: RankedRoom[];
}

export interface RankedRoom {
  room: Room;
  score: number;
  suggestedSlot?: string;
}

export class MatchingEngine {
  static findMatch(request: SchedulingConstraints, rooms: Room[]): MatchResult {
    const reqCap = this.normalizeCapacity(request.capacity);
    const reqTime = request.time?.trim() || null;
    const reqFeatures = (request.requirements || []).map((feature) =>
      feature.toLowerCase(),
    );

    // Strict feature filtering: if user asked for specific features, only keep rooms that have all.
    const featureFilteredRooms =
      reqFeatures.length === 0
        ? rooms
        : rooms.filter((room) => this.hasAllRequiredFeatures(room, reqFeatures));

    if (featureFilteredRooms.length === 0) {
      return {
        matchType: "NONE",
        explanation: `No rooms include all required features: ${reqFeatures.join(", ")}.`,
      };
    }

    const maxCapacityRoom = featureFilteredRooms.reduce((best, room) =>
      room.capacity > best.capacity ? room : best,
    );

    // Hard fallback for oversized requests.
    if (reqCap !== null && reqCap > maxCapacityRoom.capacity) {
      const nearestSlot = this.closestSlot(reqTime, maxCapacityRoom.availableSlots);
      return {
        matchType: "HEURISTIC",
        room: maxCapacityRoom,
        matchScore: this.computeScore(maxCapacityRoom, reqCap, reqTime, reqFeatures).score,
        suggestedSlot: nearestSlot,
        explanation: `Requested capacity ${reqCap} exceeds available capacity. Showing the largest available room: ${maxCapacityRoom.name} (${maxCapacityRoom.capacity} seats)${nearestSlot ? ` at ${this.to12Hour(nearestSlot)}` : ""}.`,
      };
    }

    const capacityFilteredRooms =
      reqCap === null
        ? featureFilteredRooms
        : featureFilteredRooms.filter((room) => room.capacity >= reqCap);

    if (capacityFilteredRooms.length === 0) {
      return {
        matchType: "NONE",
        explanation: "No rooms meet your requested capacity with the selected features.",
      };
    }

    const ranked = capacityFilteredRooms
      .map((room) => {
        const scoreResult = this.computeScore(room, reqCap, reqTime, reqFeatures);
        return {
          room,
          score: scoreResult.score,
          suggestedSlot: scoreResult.suggestedSlot,
        };
      })
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    const hasExact =
      (reqTime ? best.room.availableSlots.map((s) => s.trim()).includes(reqTime) : true) &&
      (reqCap === null ? true : best.room.capacity >= reqCap) &&
      this.hasAllRequiredFeatures(best.room, reqFeatures);

    return {
      matchType: hasExact ? "EXACT" : "HEURISTIC",
      room: best.room,
      matchScore: best.score,
      suggestedSlot: best.suggestedSlot,
      explanation: hasExact
        ? `Exact match found: ${best.room.name}${reqTime ? ` at ${this.to12Hour(reqTime)}` : ""}.`
        : `Best scored room is ${best.room.name} with ${best.score}% match${best.suggestedSlot ? ` at ${this.to12Hour(best.suggestedSlot)}` : ""}.`,
      alternatives: ranked.slice(1, 4),
    };
  }

  private static hasAllRequiredFeatures(room: Room, reqFeatures: string[]): boolean {
    if (reqFeatures.length === 0) return true;
    const roomFeatures = new Set(room.features.map((feature) => feature.toLowerCase()));
    return reqFeatures.every((feature) => roomFeatures.has(feature));
  }

  private static computeScore(
    room: Room,
    reqCap: number | null,
    reqTime: string | null,
    reqFeatures: string[],
  ): { score: number; suggestedSlot?: string } {
    const normalizedSlots = room.availableSlots.map((slot) => slot.trim());

    let capacityScore = 100;
    if (reqCap !== null) {
      const diff = room.capacity - reqCap;
      capacityScore = Math.max(0, 100 - Math.abs(diff) * 6);
    }

    let timeScore = 100;
    let suggestedSlot: string | undefined;
    if (reqTime) {
      const reqMins = this.timeToMinutes(reqTime);
      let bestDiff = Number.POSITIVE_INFINITY;
      for (const slot of normalizedSlots) {
        const diff = Math.abs(this.timeToMinutes(slot) - reqMins);
        if (diff < bestDiff) {
          bestDiff = diff;
          suggestedSlot = slot;
        }
      }
      timeScore = Math.max(0, 100 - Math.floor(bestDiff / 15) * 10);
    }

    const featureScore = reqFeatures.length === 0 ? 100 : 100;

    const total = Math.round(capacityScore * 0.5 + timeScore * 0.3 + featureScore * 0.2);
    return { score: total, suggestedSlot };
  }

  private static closestSlot(reqTime: string | null, slots: string[]): string | undefined {
    const normalizedSlots = slots.map((slot) => slot.trim());
    if (!reqTime) return normalizedSlots[0];
    const reqMins = this.timeToMinutes(reqTime);
    let bestSlot: string | undefined;
    let bestDiff = Number.POSITIVE_INFINITY;
    for (const slot of normalizedSlots) {
      const diff = Math.abs(this.timeToMinutes(slot) - reqMins);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestSlot = slot;
      }
    }
    return bestSlot;
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

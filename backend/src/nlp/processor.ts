import nlp from "compromise";

// Define our output interface
export interface SchedulingConstraints {
  capacity?: any;
  time?: string; // HH:mm
  requirements: string[];
}

export class NLPEngine {
  private static FEATURE_ALIASES: Record<string, string[]> = {
    projector: ["projector"],
    whiteboard: ["whiteboard"],
    tv: ["tv", "television"],
    screen: ["screen", "display"],
    wifi: ["wifi", "wi-fi", "internet"],
    "conference phone": ["conference phone", "speakerphone"],
    "sound system": ["sound system", "audio system"],
    video: ["video", "video conferencing", "video conference"],
    camera: ["camera", "webcam"],
    monitor: ["monitor"],
    hdmi: ["hdmi"],
    "mac adapter": ["mac adapter", "adapter"],
    pc: ["pc", "computer"],
    wheelchair_access: [
      "wheelchair",
      "wheel chair",
      "wheelchair access",
      "wheel chair access",
      "accessible",
    ],
    hearing_loop: ["hearing loop"],
    braille_signage: ["braille", "braille signage"],
    adjustable_desks: ["adjustable desk", "adjustable desks"],
  };

  public static extractConstraints(text: string): SchedulingConstraints {
    const doc = nlp(text);
    doc.numbers().toNumber();
    const normalizedText = doc.text();
    const lowerText = normalizedText.toLowerCase();
    const normalizedForLookup = lowerText.replace(/\s+/g, " ").trim();

    const constraints: SchedulingConstraints = {
      requirements: [],
    };

    // 1. Extract Capacity from normalized text ("five peeps" -> "5 peeps")
    const directCapacityMatch = lowerText.match(
      /\b(\d+)\s*(people|peeps|pax|users|seats|attendees|persons)\b/,
    );
    const forCapacityMatch = lowerText.match(/\bfor\s+(\d+)\b/);
    if (directCapacityMatch) {
      constraints.capacity = parseInt(directCapacityMatch[1], 10);
    } else if (forCapacityMatch) {
      constraints.capacity = parseInt(forCapacityMatch[1], 10);
    }

    // 2. Extract Time
    const timeMatch = normalizedText.match(/(\d{1,2})[:\.](\d{2})/);
    if (timeMatch) {
      let h = parseInt(timeMatch[1]);
      const m = timeMatch[2];
      if (normalizedText.toLowerCase().includes("pm") && h < 12) h += 12;
      if (normalizedText.toLowerCase().includes("am") && h === 12) h = 0;
      constraints.time = `${h.toString().padStart(2, "0")}:${m}`;
    } else {
      const hourMatch = normalizedText.match(/(\d{1,2})\s*(am|pm)/i);
      if (hourMatch) {
        let h = parseInt(hourMatch[1]);
        const period = hourMatch[2].toLowerCase();
        if (period === "pm" && h < 12) h += 12;
        if (period === "am" && h === 12) h = 0;
        constraints.time = `${h.toString().padStart(2, "0")}:00`;
      } else if (lowerText.includes("morning")) {
        constraints.time = "10:00";
      } else if (lowerText.includes("afternoon")) {
        constraints.time = "14:00";
      } else if (lowerText.includes("evening")) {
        constraints.time = "18:00";
      }
    }

    // 3. Extract Requirements as canonical feature ids
    for (const [canonical, aliases] of Object.entries(this.FEATURE_ALIASES)) {
      if (aliases.some((alias) => normalizedForLookup.includes(alias))) {
        constraints.requirements.push(canonical);
      }
    }

    return constraints;
  }
}

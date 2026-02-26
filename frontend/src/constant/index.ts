export const PROCESSING_STEPS = [
  "Parsing natural language...",
  "Evaluating 50+ rooms...",
  "Checking accessibility features...",
  "Calculating best match score...",
];

export const BASE_HARNESS_QUERIES = [
  "room for 6 at 5pm with wifi",
  "room for 6 at 5pm with wheel chair",
  "room for 150 with wifi",
  "need a room for 12 with projector at 2pm",
  "book for five peeps with whiteboard",
  "room for 8 with hearing loop",
  "room for 10 with braille signage",
  "room for 4 at 10:30 with monitor",
  "room for 20 at 11am with projector and wifi",
  "room for 3 in afternoon with monitor",
  "room for 16 at 4pm with wheelchair access",
  "meeting room for 7 with whiteboard at 3pm",
  "room for 12 with video conferencing and wifi",
  "room for 2 at 9am",
  "room for 9 with sound system",
  "room for 18 at 6pm with projector",
  "room for 5 with braille signage",
  "room for 14 with conference phone at 1pm",
  "room for 6 with wheelchair access and hearing loop",
  "room for 11 at 10am with tv",
];

export const templates = [
  "I need a room for {N} people with {F} at {T}",
  "Book a space for {N} pax",
  "Meeting room with {F}",
  "Room for {N} at {T}",
  "Can I get a room with {F} and {F2}?",
  "Schedule a meeting for {N} users",
];
export const features = [
  "projector",
  "whiteboard",
  "wifi",
  "tv",
  "screen",
  "monitor",
  "wheel chair",
  "hearing loop",
];
export const times = ["14:00", "2pm", "9am", "10:30", "15:00", "5pm", "6pm"];

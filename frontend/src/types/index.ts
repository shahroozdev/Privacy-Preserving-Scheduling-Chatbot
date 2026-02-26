export type Page = "home" | "privacy" | "accessibility" | "harness";

export interface Alternative {
  room: {
    name: string;
    capacity: number;
    features: string[];
  };
  score: number;
  suggestedSlot?: string;
}

export interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  details?: {
    room?: string;
    time?: string;
    reason?: string;
    score?: number;
    capacity?: number;
    features?: string[];
    alternatives?: Alternative[];
  };
}

export interface HarnessResult {
  id: string;
  query: string;
  status: "pending" | "running" | "done" | "error";
  response?: {
    matchType?: string;
    room?: {
      name: string;
      capacity: number;
      features: string[];
    };
    matchScore?: number;
    suggestedSlot?: string;
    explanation?: string;
    alternatives?: Alternative[];
  };
  error?: string;
}

export interface HarnessSummary {
  totalTests: number;
  exactMatches: number;
  heuristicMatches: number;
  noneMatches?: number;
  failures: number;
  nlpFailures?: number;
  connectionFailures?: number;
}
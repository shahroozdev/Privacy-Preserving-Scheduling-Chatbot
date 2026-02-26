import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChatBubble } from "./components/chatbubble";

type Page = "home" | "privacy" | "accessibility" | "harness";

interface Alternative {
  room: {
    name: string;
    capacity: number;
    features: string[];
  };
  score: number;
  suggestedSlot?: string;
}

interface Message {
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

interface HarnessResult {
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

interface HarnessSummary {
  totalTests: number;
  exactMatches: number;
  heuristicMatches: number;
  noneMatches?: number;
  failures: number;
  nlpFailures?: number;
  connectionFailures?: number;
}

const PROCESSING_STEPS = [
  "Parsing natural language...",
  "Evaluating 50+ rooms...",
  "Checking accessibility features...",
  "Calculating best match score...",
];

const BASE_HARNESS_QUERIES = [
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

function generateRandomHarnessQueries(count: number): string[] {
  const templates = [
    "I need a room for {N} people with {F} at {T}",
    "Book a space for {N} pax",
    "Meeting room with {F}",
    "Room for {N} at {T}",
    "Can I get a room with {F} and {F2}?",
    "Schedule a meeting for {N} users",
  ];
  const features = [
    "projector",
    "whiteboard",
    "wifi",
    "tv",
    "screen",
    "monitor",
    "wheel chair",
    "hearing loop",
  ];
  const times = ["14:00", "2pm", "9am", "10:30", "15:00", "5pm", "6pm"];
  const generated: string[] = [];

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const n = Math.floor(Math.random() * 20) + 1;
    const f1 = features[Math.floor(Math.random() * features.length)];
    const f2 = features[Math.floor(Math.random() * features.length)];
    const t = times[Math.floor(Math.random() * times.length)];

    generated.push(
      template
        .replace("{N}", String(n))
        .replace("{F}", f1)
        .replace("{F2}", f2)
        .replace("{T}", t),
    );
  }

  return generated;
}

const HARNESS_QUERIES = [
  ...BASE_HARNESS_QUERIES,
  ...generateRandomHarnessQueries(100 - BASE_HARNESS_QUERIES.length),
];

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [activePage, setActivePage] = useState<Page>("home");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(100);
  const [harnessRunning, setHarnessRunning] = useState(false);
  const [harnessResults, setHarnessResults] = useState<HarnessResult[]>([]);
  const [harnessSummary, setHarnessSummary] = useState<HarnessSummary | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const harnessFeedRef = useRef<HTMLDivElement>(null);

  const appStyle = useMemo(
    () => ({ fontSize: `${fontScale}%` }),
    [fontScale],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!harnessFeedRef.current) return;
    harnessFeedRef.current.scrollTo({
      top: harnessFeedRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [harnessResults, harnessSummary]);

  useEffect(() => {
    setMessages([
      {
        id: "init",
        role: "bot",
        content:
          "Private session is active. Share your room requirements and I will compute the best match without storing your data.",
      },
    ]);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % PROCESSING_STEPS.length);
    }, 700);
    return () => clearInterval(timer);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStepIndex(0);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
      const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      const res = await fetch(`${normalizedBase}match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMsg.content }),
      });

      const data = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.room
          ? "I found a room for you."
          : "No compliant room found for the provided constraints.",
        details: data.room
          ? {
              room: data.room.name,
              reason: data.explanation,
              time: data.suggestedSlot,
              score: data.matchScore,
              capacity: data.room.capacity,
              features: data.room.features,
              alternatives: data.alternatives,
            }
          : {
              reason:
                data.explanation ||
                "Try adjusting time, capacity, or required features.",
            },
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "bot",
          content: "Failed to connect to scheduler service.",
          details: { reason: "Please check backend deployment and retry." },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatch = async (text: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const res = await fetch(`${normalizedBase}match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return res.json();
  };

  const fetchHarnessSummary = async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const res = await fetch(`${normalizedBase}test-results`);
    if (!res.ok) return null;
    return (await res.json()) as HarnessSummary;
  };

  const runHarness = async () => {
    if (harnessRunning) return;
    setHarnessRunning(true);
    setHarnessSummary(null);
    setHarnessResults([]);

    for (let i = 0; i < HARNESS_QUERIES.length; i++) {
      const query = HARNESS_QUERIES[i];
      const id = `h-${Date.now()}-${i}`;
      setHarnessResults((prev) => [
        ...prev,
        {
          id,
          query,
          status: "running",
        },
      ]);
      try {
        const response = await fetchMatch(query);
        setHarnessResults((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: "done", response }
              : item,
          ),
        );
      } catch (error) {
        setHarnessResults((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "error",
                  error: error instanceof Error ? error.message : "Request failed",
                }
              : item,
          ),
        );
      }
    }
    const summary = await fetchHarnessSummary();
    setHarnessSummary(summary);
    setHarnessRunning(false);
  };

  if (!sessionStarted) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#0e7490,_#0f172a_45%,_#020617)] text-white px-4 md:px-6 py-8 md:py-12 overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 items-stretch">
          <section className="rounded-3xl border border-cyan-300/30 bg-slate-900/70 backdrop-blur p-6 md:p-10 shadow-2xl animate-[fadeIn_.7s_ease-out]">
            <span className="inline-block text-xs uppercase tracking-[0.2em] text-cyan-300">
              Zero-Persistence Architecture
            </span>
            <h1 className="mt-3 text-3xl md:text-5xl font-bold leading-tight">
              Privacy-Preserving Intelligent Scheduler
            </h1>
            <p className="mt-5 text-slate-200 max-w-2xl">
              Secure room discovery with in-memory NLP and heuristic ranking. No
              personal queries are stored in persistent databases.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/60">
                <p className="text-cyan-300 text-xs uppercase">Storage Engine</p>
                <p className="mt-1 font-semibold">Active Database: None</p>
              </div>
              <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/60">
                <p className="text-cyan-300 text-xs uppercase">Data Retention</p>
                <p className="mt-1 font-semibold">Stored Records: 0</p>
              </div>
              <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/60">
                <p className="text-cyan-300 text-xs uppercase">Security</p>
                <p className="mt-1 font-semibold">Encryption: Active</p>
              </div>
              <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/60">
                <p className="text-cyan-300 text-xs uppercase">Intelligence</p>
                <p className="mt-1 font-semibold">Score-based Room Ranking</p>
              </div>
            </div>

            <button
              onClick={() => setSessionStarted(true)}
              className="mt-8 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-400/30"
            >
              Start Private Session
            </button>
          </section>

          <section className="grid sm:grid-cols-2 gap-4 content-start">
            <article className="rounded-2xl border border-sky-300/30 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-[fadeIn_.9s_ease-out]">
              <h3 className="font-semibold text-sky-200">Natural Language Parsing</h3>
              <p className="mt-2 text-sm text-slate-300">
                Understands phrases like “six peeps”, “afternoon”, and feature-specific requests.
              </p>
            </article>
            <article className="rounded-2xl border border-emerald-300/30 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-[fadeIn_1.1s_ease-out]">
              <h3 className="font-semibold text-emerald-200">Strict Accessibility Match</h3>
              <p className="mt-2 text-sm text-slate-300">
                Required features such as wheelchair access are treated as high-priority constraints.
              </p>
            </article>
            <article className="rounded-2xl border border-indigo-300/30 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-[fadeIn_1.3s_ease-out]">
              <h3 className="font-semibold text-indigo-200">Heuristic Scoring</h3>
              <p className="mt-2 text-sm text-slate-300">
                Capacity, time proximity, and feature compliance are scored to surface best-fit rooms.
              </p>
            </article>
            <article className="rounded-2xl border border-amber-300/30 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-[fadeIn_1.5s_ease-out]">
              <h3 className="font-semibold text-amber-200">Transparent Recommendations</h3>
              <p className="mt-2 text-sm text-slate-300">
                Every suggestion includes score %, slot, and alternatives for clear decision support.
              </p>
            </article>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main
      style={appStyle}
      className={`min-h-screen ${
        highContrast
          ? "bg-black text-yellow-200"
          : "bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 text-slate-900"
      }`}
    >
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside
          className={`sticky top-0 z-20 md:h-screen md:w-64 p-3 md:p-5 border-b md:border-b-0 md:border-r ${
            highContrast
              ? "border-yellow-300 bg-black"
              : "border-slate-200 bg-white/90 backdrop-blur"
          }`}
        >
          <h2 className="font-bold text-base md:text-lg">Scheduler Dashboard</h2>
          <nav className="mt-3 md:mt-6 flex gap-2 overflow-x-auto md:block md:space-y-2">
            <button
              onClick={() => setActivePage("home")}
              className="shrink-0 md:w-full text-left px-3 py-2 rounded-lg bg-slate-200/70 hover:bg-slate-300/70 whitespace-nowrap"
            >
              Home (Chat)
            </button>
            <button
              onClick={() => setActivePage("privacy")}
              className="shrink-0 md:w-full text-left px-3 py-2 rounded-lg bg-slate-200/70 hover:bg-slate-300/70 whitespace-nowrap"
            >
              Privacy Dashboard
            </button>
            <button
              onClick={() => setActivePage("accessibility")}
              className="shrink-0 md:w-full text-left px-3 py-2 rounded-lg bg-slate-200/70 hover:bg-slate-300/70 whitespace-nowrap"
            >
              Accessibility Settings
            </button>
            <button
              onClick={() => setActivePage("harness")}
              className="shrink-0 md:w-full text-left px-3 py-2 rounded-lg bg-slate-200/70 hover:bg-slate-300/70 whitespace-nowrap"
            >
              Harness Test
            </button>
          </nav>
        </aside>

        <section className="flex-1 p-3 md:p-8">
          {activePage === "privacy" && (
            <div className="max-w-5xl space-y-5 mx-auto">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold">Privacy & Security Dashboard</h3>
                <p className="mt-2 text-sm md:text-base text-slate-600">
                  This panel shows the active privacy posture of your scheduling session.
                  Data is processed in-memory and discarded after response generation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Storage Engine</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-700">Active Database: None</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Requests are not persisted to SQL/NoSQL stores.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Data Retention</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-700">Stored Records: 0</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Session messages are not written to logs or user history.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Transport Security</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-700">Encryption: Active</p>
                  <p className="mt-2 text-sm text-slate-600">
                    API communication is expected over HTTPS during deployment.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 transition-all duration-300 hover:shadow-md">
                  <h4 className="font-semibold text-cyan-900">Zero-Persistence Policy</h4>
                  <p className="mt-2 text-sm text-cyan-900/90">
                    The scheduler only keeps request context in runtime memory while computing a match score.
                    After reply generation, the context is dropped.
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 transition-all duration-300 hover:shadow-md">
                  <h4 className="font-semibold text-indigo-900">Privacy-by-Design</h4>
                  <p className="mt-2 text-sm text-indigo-900/90">
                    Matching is done on synthetic room inventory with strict feature filtering for accessibility
                    requirements like wheelchair access and hearing loop.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activePage === "accessibility" && (
            <div className="max-w-5xl space-y-6 mx-auto">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold">Accessibility & Inclusivity Settings</h3>
                <p className="mt-2 text-sm md:text-base text-slate-600">
                  Tune reading comfort and visual accessibility. These controls are applied instantly for the active session.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <label className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500">Visual Contrast</p>
                      <h4 className="text-lg font-semibold mt-1">High Contrast Mode</h4>
                      <p className="mt-2 text-sm text-slate-600">
                        Increases foreground/background contrast for users with low vision sensitivity.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={(e) => setHighContrast(e.target.checked)}
                      className="mt-1"
                    />
                  </div>
                </label>

                <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <p className="text-sm uppercase tracking-wide text-slate-500">Readable Typography</p>
                  <h4 className="text-lg font-semibold mt-1">Font Size ({fontScale}%)</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Adjust global text scale for easier readability across chat and dashboard cards.
                  </p>
                  <input
                    type="range"
                    min={90}
                    max={125}
                    step={5}
                    value={fontScale}
                    onChange={(e) => setFontScale(Number(e.target.value))}
                    className="mt-4 w-full"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition-all duration-300 hover:shadow-md">
                <h4 className="font-semibold text-emerald-900">Inclusivity Reminder</h4>
                <p className="mt-2 text-sm text-emerald-900/90">
                  When users request accessibility requirements (for example: wheelchair access),
                  matching logic enforces strict feature filtering and excludes non-compliant rooms.
                </p>
              </div>
            </div>
          )}

          {activePage === "home" && (
            <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-9rem)] md:h-[82vh] border border-slate-200">
              <div className="border-b px-4 md:px-5 py-3 md:py-4 bg-slate-900 text-white">
                <h1 className="text-lg md:text-xl font-bold">Private Scheduling Chat</h1>
                <p className="text-xs text-slate-300">
                  Heuristic ranking + strict feature filtering enabled.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} {...msg} />
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                      <p className="text-xs font-medium text-slate-700">
                        {PROCESSING_STEPS[stepIndex]}
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-slate-200 bg-white p-3 md:p-6">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    placeholder="e.g. room for 12 with wheelchair access at 2pm"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 text-sm md:text-base"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="w-full sm:w-auto px-6 py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {activePage === "harness" && (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="rounded-2xl border border-slate-300 bg-white p-4 md:p-5 shadow-sm">
                <h3 className="text-xl md:text-2xl font-bold">Harness Test Runner</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Executes predefined queries and shows responses in chat-style cards with score details.
                </p>
                <button
                  onClick={runHarness}
                  disabled={harnessRunning}
                  className="mt-4 px-4 py-2 rounded-lg bg-cyan-700 text-white font-semibold disabled:opacity-60"
                >
                  {harnessRunning ? "Running..." : "Run Harness Tests"}
                </button>
              </div>

              {harnessResults.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                  No harness messages yet. Click <strong>Run Harness Tests</strong> to start chat-style test execution.
                </div>
              )}

              <div
                ref={harnessFeedRef}
                className="space-y-4 max-h-[65vh] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 md:p-4 scroll-smooth"
              >
                {harnessResults.map((item) => (
                  <div key={item.id} className="space-y-2 animate-[fadeIn_.35s_ease-out]">
                    <div className="flex justify-end">
                      <div className="max-w-2xl rounded-2xl rounded-br-none bg-cyan-700 text-white px-4 py-3 text-sm">
                        {item.query}
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-3xl rounded-2xl rounded-bl-none border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm">
                        {item.status === "running" && (
                          <p className="text-slate-700">Running query...</p>
                        )}
                        {item.status === "error" && (
                          <p className="text-red-600">Error: {item.error}</p>
                        )}
                        {item.status === "done" && item.response && (
                          <div className="space-y-2">
                            <p className="font-semibold text-slate-900">
                              Actual Response: {item.response.explanation || "No explanation provided"}
                            </p>
                            <p className="text-xs text-slate-600">
                              Room: {item.response.room?.name || "No room returned"}
                            </p>
                            {item.response.room && (
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-1 rounded-full bg-slate-200">
                                  Capacity: {item.response.room.capacity}
                                </span>
                                {item.response.matchScore !== undefined && (
                                  <span className="px-2 py-1 rounded-full bg-emerald-200 text-emerald-900 font-semibold">
                                    Match: {item.response.matchScore}%
                                  </span>
                                )}
                                {item.response.suggestedSlot && (
                                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-900">
                                    Slot: {item.response.suggestedSlot}
                                  </span>
                                )}
                                <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-900">
                                  Type: {item.response.matchType}
                                </span>
                              </div>
                            )}
                            {item.response.room?.features?.length ? (
                              <div className="flex flex-wrap gap-1.5">
                                {item.response.room.features.map((feature) => (
                                  <span
                                    key={`${item.id}-${feature}`}
                                    className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            {item.response.alternatives?.length ? (
                              <div className="pt-1">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Alternatives
                                </p>
                                <div className="mt-1 grid gap-2 sm:grid-cols-2">
                                  {item.response.alternatives.map((alt) => (
                                    <div
                                      key={`${item.id}-${alt.room.name}-${alt.score}`}
                                      className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-xs"
                                    >
                                      <p className="font-semibold">{alt.room.name}</p>
                                      <p>
                                        Capacity: {alt.room.capacity} | Score: {alt.score}%
                                      </p>
                                      {alt.suggestedSlot && <p>Slot: {alt.suggestedSlot}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                            <details className="pt-1">
                              <summary className="cursor-pointer text-xs text-slate-500">
                                View Raw JSON Response
                              </summary>
                              <pre className="mt-2 text-[11px] bg-slate-900 text-slate-100 rounded-lg p-2 overflow-x-auto">
                                {JSON.stringify(item.response, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {harnessSummary && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-emerald-900">
                    Final JSON Test Summary
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Loaded from <code>test-results.json</code>
                  </p>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="rounded-lg bg-white p-3 border border-emerald-200">
                      <p className="text-slate-500">Total</p>
                      <p className="font-bold text-slate-900">{harnessSummary.totalTests}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-emerald-200">
                      <p className="text-slate-500">Exact</p>
                      <p className="font-bold text-slate-900">{harnessSummary.exactMatches}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-emerald-200">
                      <p className="text-slate-500">Heuristic</p>
                      <p className="font-bold text-slate-900">{harnessSummary.heuristicMatches}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-emerald-200">
                      <p className="text-slate-500">Failures</p>
                      <p className="font-bold text-slate-900">{harnessSummary.failures}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;

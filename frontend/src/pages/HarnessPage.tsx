import { useEffect, useRef, useState } from "react";
import type { HarnessResult, HarnessSummary } from "../types";
import { BASE_HARNESS_QUERIES } from "../constant";
import { fetchMatch, generateRandomHarnessQueries } from "../utils";

const HARNESS_QUERIES = [
  ...BASE_HARNESS_QUERIES,
  ...generateRandomHarnessQueries(100 - BASE_HARNESS_QUERIES.length),
];
export function HarnessPage() {
  const [harnessRunning, setHarnessRunning] = useState(false);
  const [harnessResults, setHarnessResults] = useState<HarnessResult[]>([]);
  const [harnessSummary, setHarnessSummary] = useState<HarnessSummary | null>(
    null,
  );

  useEffect(() => {
    if (!harnessFeedRef.current) return;
    harnessFeedRef.current.scrollTo({
      top: harnessFeedRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [harnessResults, harnessSummary]);
  
  const fetchHarnessSummary = async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const res = await fetch(`${normalizedBase}test-results`);
    if (!res.ok) return null;
    return (await res.json()) as HarnessSummary;
  };

  const harnessFeedRef = useRef<HTMLDivElement>(null);
  const runHarness = async () => {
    if (harnessRunning) return;
    setHarnessRunning(true);
    setHarnessSummary(null);
    setHarnessResults([]);

    for (let i = 0; i < HARNESS_QUERIES.length; i++) {
      const query = HARNESS_QUERIES[i];
      const id = `h-${Date.now()}-${i}`;
      setHarnessResults((prev) => [...prev, { id, query, status: "running" }]);
      try {
        const response = await fetchMatch(query);
        setHarnessResults((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "done", response } : item,
          ),
        );
      } catch (error) {
        setHarnessResults((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Request failed",
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
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="rounded-2xl border border-slate-300 bg-white p-4 md:p-5 shadow-sm">
        <h3 className="text-xl md:text-2xl font-bold">Harness Test Runner</h3>
        <p className="mt-1 text-sm text-slate-600">
          Executes predefined queries and shows responses in chat-style cards
          with score details.
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
          No harness messages yet. Click <strong>Run Harness Tests</strong> to
          start chat-style test execution.
        </div>
      )}

      <div
        ref={harnessFeedRef}
        className="space-y-4 max-h-[65vh] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 md:p-4 scroll-smooth"
      >
        {harnessResults.map((item) => (
          <div
            key={item.id}
            className="space-y-2 animate-[fadeIn_.35s_ease-out]"
          >
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
                      Actual Response:{" "}
                      {item.response.explanation || "No explanation provided"}
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
                                Capacity: {alt.room.capacity} | Score:{" "}
                                {alt.score}%
                              </p>
                              {alt.suggestedSlot && (
                                <p>Slot: {alt.suggestedSlot}</p>
                              )}
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
              <p className="font-bold text-slate-900">
                {harnessSummary.totalTests}
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <p className="text-slate-500">Exact</p>
              <p className="font-bold text-slate-900">
                {harnessSummary.exactMatches}
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <p className="text-slate-500">Heuristic</p>
              <p className="font-bold text-slate-900">
                {harnessSummary.heuristicMatches}
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <p className="text-slate-500">Failures</p>
              <p className="font-bold text-slate-900">
                {harnessSummary.failures}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

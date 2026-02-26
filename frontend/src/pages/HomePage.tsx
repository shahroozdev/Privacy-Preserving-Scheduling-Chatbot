import React, { useEffect, useRef, useState } from "react";
import { ChatBubble } from "../components/chatbubble";
import type { Message } from "../types";
import { PROCESSING_STEPS } from "../constant";
import { fetchMatch } from "../utils";

export function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      const data = await fetchMatch(userMsg.content);
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
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-9rem)] md:h-[82vh] border border-slate-200">
      <div className="border-b px-4 md:px-5 py-3 md:py-4 bg-slate-900 text-white">
        <h1 className="text-lg md:text-xl font-bold">
          Private Scheduling Chat
        </h1>
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
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2 sm:gap-3"
        >
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
  );
}

import React, { useState, useEffect, useRef } from "react";
import { ChatBubble } from "./components/chatbubble";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  details?: {
    room?: string;
    time?: string;
    reason?: string;
  };
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Privacy: Clear session on refresh (handled by browser naturally for React state)
  // No local storage used.

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        id: "init",
        role: "bot",
        content:
          "Hello! I'm your Privacy-Preserving Scheduling Assistant. I don't store your data. Tell me what kind of room you need.",
      },
    ]);
  }, []);

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

    try {
      const res = await fetch("http://localhost:4000/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMsg.content }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.room
          ? `I found a room for you!`
          : `I couldn't find a perfect match.`,
        details: data.room
          ? {
              room: data.room.name,
              reason: data.explanation,
            }
          : {
              reason:
                data.explanation || "Please try again with different criteria.",
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
          content: "Sorry, I encountered an error connecting to the scheduler.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
              🔒
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Privacy Preserving Scheduling Chatbot
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Zero Persistence. Pure Privacy.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px] md:h-[700px] border border-slate-200">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} {...msg} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white p-4 md:p-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="e.g. 'Room for 6 with projector at 2pm'"
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Notice */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center">
        <p className="text-xs text-slate-500 max-w-3xl mx-auto">
          ⚠️ Data Privacy Notice: Your messages are processed in-memory and
          discarded immediately after the session. We do not store your queries
          or personal identifiers.
        </p>
      </footer>
    </main>
  );
}

export default App;

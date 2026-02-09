import React, { useState, useEffect, useRef } from 'react';
import { ChatBubble } from './components/chatbubble';

interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    details?: {
        room?: string;
        time?: string;
        reason?: string;
    };
}

function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
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
        setMessages([{
            id: 'init',
            role: 'bot',
            content: "Hello! I'm your Privacy-Preserving Scheduling Assistant. I don't store your data. Tell me what kind of room you need."
        }]);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:4000/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: userMsg.content })
            });

            const data = await res.json();
            
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: data.room ? `I found a room for you!` : `I couldn't find a perfect match.`,
                details: data.room ? {
                    room: data.room.name,
                    reason: data.explanation
                } : {
                    reason: data.explanation || "Please try again with different criteria."
                }
            };

            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'bot',
                content: "Sorry, I encountered an error connecting to the scheduler."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-white">
            <div className="z-10 w-full max-w-2xl items-center justify-between font-mono text-sm flex flex-col">
                <header className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">🔒 Secure Scheduler</h1>
                    <p className="text-gray-500">Zero Persistence. Pure Privacy.</p>
                </header>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-[600px] flex flex-col w-full">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map(msg => (
                            <ChatBubble key={msg.id} {...msg} />
                        ))}
                        {loading && <div className="text-gray-400 text-center text-xs animate-pulse">Thinking...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2 rounded-b-xl">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g. 'Room for 6 with projector at 2pm'"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            Send
                        </button>
                    </form>
                </div>
                
                <div className="mt-8 text-xs text-gray-400 text-center max-w-lg mx-auto">
                    <p>⚠️ Data Privacy Notice: Your messages are processed in-memory and discarded immediately after the session. We do not store your queries or personal identifiers.</p>
                </div>
            </div>
        </div>
    );
}

export default App;

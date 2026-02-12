"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { Users, Loader2, Target, ArrowLeft, Play, Pause } from "lucide-react";
import { personaConfigs } from "@/lib/personas";

interface ChatMessage {
    speaker: string;
    text: string;
    id: string;
}

function CouncilContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [idea, setIdea] = useState<string>("");

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ideaParam = searchParams.get("idea");
        if (ideaParam) {
            setIdea(ideaParam);
        }
    }, [searchParams]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, currentSpeaker]);

    const startCouncil = async () => {
        if (isStreaming || !idea) return;

        setIsStreaming(true);
        setMessages([]); // Clear previous chat if restarting

        try {
            const response = await fetch("/api/council", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idea }),
            });

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            // data = { speaker, text, threadId }

                            // Check if this is a "status" update (Chairman logic) or actual message
                            // In our API, we only stream messages for now

                            setMessages(prev => [
                                ...prev,
                                {
                                    speaker: data.speaker,
                                    text: data.text,
                                    id: Date.now().toString() + Math.random()
                                }
                            ]);
                            setCurrentSpeaker(data.speaker);

                        } catch (e) {
                            console.error("Error parsing stream chunk", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Stream failed", error);
        } finally {
            setIsStreaming(false);
            setCurrentSpeaker(null);
        }
    };

    const getPersona = (id: string) => personaConfigs.find(p => p.id === id);

    return (
        <div className="flex h-screen bg-brutal-cream">
            <Sidebar />
            <main className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] opacity-5 pointer-events-none" />

                {/* Header */}
                <header className="flex items-center justify-between mb-6 relative z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 bg-white border-2 border-black shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-2">
                                <Users className="w-6 h-6" />
                                The Council Chamber
                            </h1>
                            <p className="text-sm font-bold text-gray-600 truncate max-w-md">
                                Topic: "{idea}"
                            </p>
                        </div>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto bg-white border-4 border-black shadow-brutal relative z-10 mb-4 p-6">
                    {messages.length === 0 && !isStreaming ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                            <Users className="w-16 h-16 mb-4 text-gray-400" />
                            <h3 className="text-xl font-black uppercase mb-2">Ready to Start</h3>
                            <p className="font-bold text-gray-500 max-w-sm">
                                Initialize the multi-agent debate. The Chairman (Qwen) will moderate the discussion between 5 expert personas.
                            </p>
                            <button
                                onClick={startCouncil}
                                className="mt-6 bg-black text-white font-bold uppercase px-8 py-4 border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
                            >
                                <Play className="w-5 h-5" />
                                Start Session
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((msg, idx) => {
                                const persona = getPersona(msg.speaker);
                                const isUser = msg.speaker === "user"; // if we add user input later
                                const isChairman = msg.speaker === "chairman"; // unlikely in current stream logic but possible

                                return (
                                    <div key={idx} className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
                                        {/* Avatar */}
                                        <div className={`
                                            w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center
                                            ${persona ? persona.color : "bg-gray-200"}
                                            shadow-brutal-sm
                                        `}>
                                            {persona ? (
                                                <span className="font-black text-lg">{persona.name[0]}</span>
                                            ) : (
                                                <Users className="w-6 h-6" />
                                            )}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className="max-w-2xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-black uppercase text-sm">
                                                    {persona?.name || msg.speaker}
                                                </span>
                                                <span className="text-xs font-bold text-gray-500 uppercase">
                                                    {persona?.role || "Moderator"}
                                                </span>
                                            </div>
                                            <div className="bg-gray-50 border-2 border-black p-4 shadow-sm text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Loading Indicator for current speaker */}
                            {isStreaming && (
                                <div className="flex gap-4 opacity-50">
                                    <div className="w-12 h-12 border-2 border-black bg-gray-100 flex items-center justify-center animate-pulse">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-bold text-gray-500 uppercase text-sm">
                                            Next speaker is preparing...
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Controls (Hidden during stream for now) */}
                {isStreaming && (
                    <div className="absolute bottom-8 right-8 z-20">
                        <div className="bg-black text-white px-4 py-2 font-bold uppercase text-xs border-2 border-black animate-pulse flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            Live Session
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function CouncilPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-brutal-cream">
                <Loader2 className="w-12 h-12 animate-spin" />
            </div>
        }>
            <CouncilContent />
        </Suspense>
    );
}

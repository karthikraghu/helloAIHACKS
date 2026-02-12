"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Users, Loader2, Target, ArrowLeft } from "lucide-react";

function CouncilContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [idea, setIdea] = useState<string>("");

    useEffect(() => {
        const ideaParam = searchParams.get("idea");
        if (ideaParam) {
            setIdea(ideaParam);
        }
    }, [searchParams]);

    return (
        <div className="flex h-screen bg-brutal-cream">
            <Sidebar />
            <main className="flex-1 flex flex-col p-8 overflow-y-auto relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] opacity-5 pointer-events-none" />

                {/* Header */}
                <header className="flex items-center gap-4 mb-8 relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="p-2 bg-white border-2 border-black shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-3">
                            <Users className="w-8 h-8" />
                            The Council
                        </h1>
                        {idea && (
                            <p className="text-lg font-bold text-gray-600 mt-1 max-w-2xl truncate">
                                Discussing: "{idea}"
                            </p>
                        )}
                    </div>
                </header>

                {/* Placeholder Content */}
                <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="max-w-2xl w-full text-center bg-white border-4 border-black shadow-brutal-xl p-12">
                        <div className="w-24 h-24 bg-brutal-yellow border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-brutal">
                            <Users className="w-12 h-12" />
                        </div>

                        <h2 className="text-3xl font-black uppercase mb-4">
                            Council Session Pending
                        </h2>

                        <p className="text-xl font-bold text-gray-800 mb-8 leading-relaxed">
                            The personas are gathering to discuss your idea in a multi-agent debate.
                        </p>

                        <div className="bg-gray-100 border-2 border-black p-6 text-left mb-8">
                            <h3 className="font-black uppercase mb-2 flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Coming Soon
                            </h3>
                            <ul className="list-disc list-inside space-y-2 font-bold text-gray-600">
                                <li>Real-time debate between personas</li>
                                <li>Consensus building & conflict resolution</li>
                                <li>Final joint recommendation</li>
                                <li>LangChain & LangGraph integration</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => router.push("/dashboard")}
                            className="bg-black text-white font-bold uppercase px-8 py-4 border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
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

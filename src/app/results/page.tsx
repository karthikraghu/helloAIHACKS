"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
    ArrowLeft,
    Coins,
    Users,
    TrendingUp,
    ShieldAlert,
    Target,
    Loader2,
    AlertCircle,
    Sparkles,
    RefreshCw,
    ThumbsUp,
    ThumbsDown
} from "lucide-react";
import { personaConfigs, PersonaConfig } from "@/lib/personas";

interface Score {
    label: string;
    value: number;
}

interface PersonaResponse {
    personaId: string;
    success: boolean;
    error: string | null;
    response: string | null;
    scores: Score[];
    verdict: string | null;
    goVerdict?: string;
    noGoVerdict?: string;
    loading: boolean;
}

const iconMap: Record<string, React.ElementType> = {
    Coins,
    Users,
    TrendingUp,
    ShieldAlert,
    Target,
};

// Score bar component
function ScoreBar({ label, value }: { label: string; value: number }) {
    const percentage = (value / 10) * 100;
    const getColor = (val: number) => {
        if (val >= 8) return "bg-brutal-green";
        if (val >= 5) return "bg-brutal-yellow";
        return "bg-brutal-pink";
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm uppercase truncate">{label}</span>
                <span className="font-black text-lg ml-2">{value}/10</span>
            </div>
            <div className="h-4 bg-gray-200 border-2 border-black">
                <div
                    className={`h-full ${getColor(value)} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function ResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [idea, setIdea] = useState<string>("");
    const [personaIds, setPersonaIds] = useState<string[]>([]);
    const [responses, setResponses] = useState<Record<string, PersonaResponse>>({});
    const [activeTab, setActiveTab] = useState<string>("");

    useEffect(() => {
        const ideaParam = searchParams.get("idea");
        const personasParam = searchParams.get("personas");

        if (!ideaParam || !personasParam) {
            return;
        }

        const ids = personasParam.split(",");
        setIdea(ideaParam);
        setPersonaIds(ids);
        setActiveTab(ids[0]);

        // Initialize all responses as loading
        const initialResponses: Record<string, PersonaResponse> = {};
        ids.forEach(id => {
            initialResponses[id] = {
                personaId: id,
                success: false,
                error: null,
                response: null,
                scores: [],
                verdict: null,
                loading: true,
            };
        });
        setResponses(initialResponses);

        // Fetch each persona individually (each uses its own API key)
        ids.forEach(personaId => {
            fetchPersonaResponse(ideaParam, personaId);
        });
    }, [searchParams]);

    async function fetchPersonaResponse(ideaText: string, personaId: string) {
        try {
            const response = await fetch("/api/validate/persona", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idea: ideaText, personaId }),
            });

            const data = await response.json();

            setResponses(prev => ({
                ...prev,
                [personaId]: {
                    personaId,
                    success: data.success ?? false,
                    error: data.error || null,
                    response: data.response || null,
                    scores: data.scores || [],
                    verdict: data.verdict || null,
                    goVerdict: data.goVerdict,
                    noGoVerdict: data.noGoVerdict,
                    loading: false,
                }
            }));
        } catch {
            setResponses(prev => ({
                ...prev,
                [personaId]: {
                    personaId,
                    success: false,
                    error: "Failed to connect to server",
                    response: null,
                    scores: [],
                    verdict: null,
                    loading: false,
                }
            }));
        }
    }

    function retryPersona(personaId: string) {
        setResponses(prev => ({
            ...prev,
            [personaId]: {
                ...prev[personaId],
                loading: true,
                error: null,
            }
        }));
        fetchPersonaResponse(idea, personaId);
    }

    function retryAll() {
        personaIds.forEach(id => {
            setResponses(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    loading: true,
                    error: null,
                }
            }));
            fetchPersonaResponse(idea, id);
        });
    }

    function getPersonaConfig(personaId: string): PersonaConfig | undefined {
        return personaConfigs.find(p => p.id === personaId);
    }

    function formatMarkdown(text: string): string {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-black">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-black uppercase mt-4 mb-2 border-b-2 border-black pb-1">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-black uppercase mt-6 mb-3 border-b-2 border-black pb-1">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black uppercase mt-6 mb-4">$1</h1>')
            .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
            .replace(/\n\n/g, '</p><p class="mb-4">')
            .replace(/\n/g, '<br/>');
    }

    const completedCount = Object.values(responses).filter(r => !r.loading).length;
    const totalCount = personaIds.length;
    const goCount = Object.values(responses).filter(r => r.verdict === "GO").length;
    const noGoCount = Object.values(responses).filter(r => r.verdict === "NO GO").length;

    if (!idea || personaIds.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="bg-brutal-pink border-4 border-black shadow-brutal-xl p-8 text-center max-w-md">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-black uppercase mb-2">Missing Data</h2>
                    <p className="font-bold text-gray-800 mb-6">No idea or personas specified.</p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="bg-black text-white font-bold uppercase px-6 py-3 border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const activeResponse = responses[activeTab];
    const persona = activeResponse ? getPersonaConfig(activeResponse.personaId) : null;

    return (
        <>
            {/* Header */}
            <header className="p-6 border-b-4 border-black bg-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="p-2 bg-brutal-yellow border-2 border-black shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase flex items-center gap-2">
                            <Sparkles className="w-6 h-6" />
                            Boardroom Results
                        </h1>
                        <p className="text-sm font-bold text-gray-600 mt-1 max-w-xl truncate">
                            &quot;{idea}&quot;
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="font-bold text-sm bg-white border-2 border-black px-3 py-1">
                        {completedCount}/{totalCount}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 px-3 py-1 bg-brutal-green border-2 border-black font-bold">
                            <ThumbsUp className="w-4 h-4" /> {goCount}
                        </span>
                        <span className="flex items-center gap-1 px-3 py-1 bg-brutal-pink border-2 border-black font-bold">
                            <ThumbsDown className="w-4 h-4" /> {noGoCount}
                        </span>
                    </div>
                    <button
                        onClick={retryAll}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black shadow-brutal-sm font-bold uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry All
                    </button>
                </div>
            </header>

            {/* Persona Tabs */}
            <div className="flex border-b-4 border-black bg-white overflow-x-auto">
                {personaIds.map((personaId) => {
                    const personaConfig = getPersonaConfig(personaId);
                    if (!personaConfig) return null;

                    const IconComponent = iconMap[personaConfig.icon] || Target;
                    const isActive = activeTab === personaId;
                    const response = responses[personaId];

                    return (
                        <button
                            key={personaId}
                            onClick={() => setActiveTab(personaId)}
                            className={`
                                flex items-center gap-2 px-6 py-4 font-bold uppercase text-sm
                                border-r-2 border-black transition-all shrink-0
                                ${isActive
                                    ? `${personaConfig.color} border-b-4 border-b-transparent -mb-1`
                                    : "bg-gray-100 hover:bg-gray-200"
                                }
                            `}
                        >
                            <IconComponent className="w-5 h-5" />
                            <span className="hidden md:inline">{personaConfig.name}</span>
                            <span className="md:hidden">{personaConfig.name.charAt(0)}</span>
                            {response?.loading && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            {!response?.loading && response?.success && (
                                response.verdict === "GO" ? (
                                    <ThumbsUp className="w-4 h-4 text-green-600" />
                                ) : (
                                    <ThumbsDown className="w-4 h-4 text-red-600" />
                                )
                            )}
                            {!response?.loading && response?.error && (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Response Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-brutal-cream">
                {persona && activeResponse && (
                    <div className="max-w-4xl mx-auto">
                        {/* Persona Header with Verdict */}
                        <div className={`${persona.color} border-4 border-black shadow-brutal p-6 mb-6`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white border-2 border-black shadow-brutal-sm flex items-center justify-center">
                                        {(() => {
                                            const IconComponent = iconMap[persona.icon] || Target;
                                            return <IconComponent className="w-8 h-8" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase">{persona.name}</h2>
                                        <p className="font-bold text-gray-800">{persona.role}</p>
                                        <p className="text-sm text-gray-700">{persona.description}</p>
                                    </div>
                                </div>

                                {!activeResponse.loading && activeResponse.success && activeResponse.verdict && (
                                    <div className={`
                                        flex flex-col items-center p-4 border-2 border-black
                                        ${activeResponse.verdict === "GO" ? "bg-brutal-green" : "bg-brutal-pink"}
                                    `}>
                                        {activeResponse.verdict === "GO" ? (
                                            <ThumbsUp className="w-8 h-8 mb-1" />
                                        ) : (
                                            <ThumbsDown className="w-8 h-8 mb-1" />
                                        )}
                                        <span className="font-black text-lg uppercase">
                                            {activeResponse.verdict}
                                        </span>
                                    </div>
                                )}

                                {activeResponse.loading && (
                                    <div className="flex flex-col items-center p-4 border-2 border-black bg-white">
                                        <Loader2 className="w-8 h-8 animate-spin mb-1" />
                                        <span className="font-bold text-sm uppercase">
                                            Thinking...
                                        </span>
                                    </div>
                                )}
                            </div>

                            {!activeResponse.loading && activeResponse.success && activeResponse.verdict && (
                                <div className="mt-4 pt-4 border-t-2 border-black/20">
                                    <p className="text-lg font-bold italic">
                                        &quot;{activeResponse.verdict === "GO"
                                            ? activeResponse.goVerdict
                                            : activeResponse.noGoVerdict}&quot;
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Scores Section - Above Text */}
                        {!activeResponse.loading && activeResponse.success && activeResponse.scores.length > 0 && (
                            <div className="bg-white border-4 border-black shadow-brutal p-6 mb-6">
                                <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                                    📊 {persona.name}&apos;s Scores
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {activeResponse.scores.map((score, index) => (
                                        <ScoreBar key={index} label={score.label} value={score.value} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Response Body */}
                        <div className="bg-white border-4 border-black shadow-brutal p-8">
                            {activeResponse.loading ? (
                                <div className="text-center py-12">
                                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                                    <h3 className="text-xl font-black uppercase mb-2">Analyzing...</h3>
                                    <p className="font-bold text-gray-600">{persona.name} is reviewing your idea</p>
                                </div>
                            ) : activeResponse.success ? (
                                <div
                                    className="prose prose-lg max-w-none font-medium leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: `<p class="mb-4">${formatMarkdown(activeResponse.response || "")}</p>`
                                    }}
                                />
                            ) : (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-brutal-red" />
                                    <h3 className="text-xl font-black uppercase mb-2">Failed to Get Response</h3>
                                    <p className="font-bold text-gray-600 mb-4">{activeResponse.error}</p>
                                    <button
                                        onClick={() => retryPersona(activeTab)}
                                        className="bg-black text-white font-bold uppercase px-6 py-3 border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                                    >
                                        Retry {persona.name}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function ResultsPage() {
    return (
        <div className="flex h-screen bg-brutal-cream">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Suspense fallback={
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin" />
                    </div>
                }>
                    <ResultsContent />
                </Suspense>
            </main>
        </div>
    );
}

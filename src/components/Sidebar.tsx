"use client";

import { useRouter } from "next/navigation";
import {
    Plus,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Users,
    History,
    Lightbulb
} from "lucide-react";
import { useState } from "react";

interface HistoryItem {
    id: string;
    idea: string;
    verdict: "GO" | "NO GO" | "MIXED";
    date: string;
}

const mockHistory: HistoryItem[] = [
    { id: "1", idea: "AI-powered meal planning app", verdict: "GO", date: "Today" },
    { id: "2", idea: "Crypto wallet for teens", verdict: "NO GO", date: "Today" },
    { id: "3", idea: "Remote team coffee chat platform", verdict: "MIXED", date: "Yesterday" },
    { id: "4", idea: "Smart plant watering system", verdict: "GO", date: "Yesterday" },
    { id: "5", idea: "NFT ticketing for events", verdict: "NO GO", date: "2 days ago" },
];

export default function Sidebar() {
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleNewValidation = () => {
        router.push("/dashboard");
    };

    const handleLogout = () => {
        router.push("/");
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case "GO": return "bg-brutal-green";
            case "NO GO": return "bg-brutal-pink";
            default: return "bg-brutal-yellow";
        }
    };

    return (
        <aside
            className={`
                h-screen bg-brutal-yellow border-r-4 border-black
                flex flex-col transition-all duration-200 ease-in-out
                ${isCollapsed ? "w-20" : "w-72"}
            `}
        >
            {/* Header */}
            <div className="p-4 border-b-4 border-black flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        <span className="font-black text-xl uppercase tracking-tight">
                            Boardroom
                        </span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 bg-white border-2 border-black shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* New Validation Button */}
            <div className="p-4">
                <button
                    onClick={handleNewValidation}
                    className={`
                        w-full bg-black text-white font-bold uppercase
                        flex items-center justify-center gap-2 p-3
                        border-2 border-black shadow-brutal
                        hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all
                        ${isCollapsed ? "px-2" : ""}
                    `}
                >
                    <Plus className="w-5 h-5" />
                    {!isCollapsed && <span>New Idea</span>}
                </button>
            </div>

            {/* History Section */}
            <div className="flex-1 overflow-y-auto p-4">
                {!isCollapsed && (
                    <div className="flex items-center gap-2 mb-3 text-sm font-bold uppercase text-gray-700">
                        <History className="w-4 h-4" />
                        <span>Recent Ideas</span>
                    </div>
                )}

                <div className="space-y-2">
                    {mockHistory.map((item) => (
                        <div
                            key={item.id}
                            className={`
                                bg-white border-2 border-black p-3 cursor-pointer
                                shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all
                                ${isCollapsed ? "flex items-center justify-center" : ""}
                            `}
                        >
                            {isCollapsed ? (
                                <Lightbulb className="w-4 h-4" />
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-bold text-sm truncate flex-1">
                                            {item.idea}
                                        </p>
                                        <span className={`
                                            text-xs font-black px-2 py-0.5 border border-black shrink-0
                                            ${getVerdictColor(item.verdict)}
                                        `}>
                                            {item.verdict}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1 block">
                                        {item.date}
                                    </span>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t-4 border-black">
                <button
                    onClick={handleLogout}
                    className={`
                        w-full bg-brutal-pink font-bold uppercase
                        flex items-center justify-center gap-3 p-3
                        border-2 border-black shadow-brutal-sm
                        hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all
                    `}
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}

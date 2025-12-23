"use client";

import { useState, useEffect } from "react";
import { Book, History, X, Sparkles, Clock } from "lucide-react";
import { clsx } from "clsx";

interface PromptLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (text: string) => void;
}

const RECOMMENDED_PHRASES = [
    { label: "Basic", text: "I would like to have a cup of coffee.", icon: "☕" },
    { label: "Positive", text: "The best way to predict the future is to create it.", icon: "✨" },
    { label: "Nature", text: "The sun rises every morning to give us a fresh start.", icon: "🌅" },
    { label: "Mindset", text: "Happiness comes from your own actions. Enjoy every moment.", icon: "🧘" },
];

export default function PromptLibraryModal({ isOpen, onClose, onSelect }: PromptLibraryModalProps) {
    const [activeTab, setActiveTab] = useState<"recommended" | "history">("recommended");
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            const stored = localStorage.getItem("echo_history");
            if (stored) {
                try {
                    setHistory(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse history", e);
                }
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-[#1e1e2e]/90 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Book className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl font-bold text-white tracking-tight">Phrase Library</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-black/20 rounded-xl mb-6">
                    <button
                        onClick={() => setActiveTab("recommended")}
                        className={clsx(
                            "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                            activeTab === "recommended"
                                ? "bg-indigo-500/20 text-indigo-300 shadow-sm ring-1 ring-indigo-500/50"
                                : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        <Sparkles className="w-4 h-4" />
                        Recommended
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={clsx(
                            "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                            activeTab === "history"
                                ? "bg-indigo-500/20 text-indigo-300 shadow-sm ring-1 ring-indigo-500/50"
                                : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        <History className="w-4 h-4" />
                        History
                    </button>
                </div>

                {/* List Area */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {activeTab === "recommended" ? (
                        RECOMMENDED_PHRASES.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSelect(item.text)}
                                className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all group"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                                            {item.label}
                                        </div>
                                        <div className="text-gray-200 text-sm font-medium leading-relaxed group-hover:text-white transition-colors">
                                            {item.text}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        history.length > 0 ? (
                            history.map((text, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelect(text)}
                                    className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all group flex items-start gap-3"
                                >
                                    <Clock className="w-4 h-4 text-gray-500 mt-0.5 group-hover:text-indigo-400 transition-colors" />
                                    <span className="text-gray-300 text-sm font-medium leading-relaxed group-hover:text-white transition-colors line-clamp-2">
                                        {text}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500 text-sm">
                                No history yet. Generate some audio!
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

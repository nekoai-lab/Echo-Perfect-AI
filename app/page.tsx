"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Mic, Play, RefreshCw, Volume2, Sparkles, Book } from "lucide-react";
import Recorder from "./components/Recorder";
import AnalysisResult from "./components/AnalysisResult";
import CustomAudioPlayer from "./components/CustomAudioPlayer";
import PromptLibraryModal from "./components/PromptLibraryModal";

export default function Home() {
    const [analysisData, setAnalysisData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Dynamic State
    const [targetText, setTargetText] = useState("I would like to have a cup of coffee.");
    const [refAudioBlob, setRefAudioBlob] = useState<Blob | null>(null);
    const [refAudioUrl, setRefAudioUrl] = useState<string | null>(null);
    const [isGeneratingRef, setIsGeneratingRef] = useState(false);

    // Library State
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    const generateReference = async (textOverride?: string) => {
        const textToUse = textOverride || targetText;
        if (!textToUse.trim()) return;

        if (textOverride) setTargetText(textOverride);

        setIsGeneratingRef(true);
        setErrorMsg(null);
        setAnalysisData(null);

        // Save to History
        try {
            const stored = localStorage.getItem("echo_history");
            let history: string[] = stored ? JSON.parse(stored) : [];
            // Remove duplicates and add to front
            history = history.filter(t => t !== textToUse);
            history.unshift(textToUse);
            // Limit to 10
            if (history.length > 10) history = history.slice(0, 10);
            localStorage.setItem("echo_history", JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history", e);
        }

        try {
            const res = await fetch("/api/generate_reference", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: textToUse }),
            });

            if (!res.ok) throw new Error("Failed to generate reference audio");

            const blob = await res.blob();
            setRefAudioBlob(blob);
            const url = URL.createObjectURL(blob);
            setRefAudioUrl(url);

        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message);
        } finally {
            setIsGeneratingRef(false);
        }
    };

    useEffect(() => {
        generateReference();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLibrarySelect = (text: string) => {
        setTargetText(text);
        setIsLibraryOpen(false);
        generateReference(text);
    };

    const handleRecordingComplete = async (userBlob: Blob) => {
        if (!refAudioBlob) {
            setErrorMsg("Please generate a reference audio first.");
            return;
        }

        setIsProcessing(true);
        setErrorMsg(null);
        setAnalysisData(null);

        const formData = new FormData();
        formData.append("user_audio", userBlob, "user.webm");
        formData.append("ref_audio", refAudioBlob, "ref.mp3");
        formData.append("target_text", targetText);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                if (res.status === 504) {
                    throw new Error("Timeout: The AI took too long. Please try a shorter phrase (max 5s).");
                }
                throw new Error(`Analysis failed: ${res.statusText} `);
            }

            const json = await res.json();
            setAnalysisData(json);

        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "Something went wrong.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#1a1b26] to-[#0f1016] text-white flex flex-col items-center p-6 selection:bg-indigo-500/30 font-sans">

            {/* Background Lights */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]"></div>
            </div>

            <header className="w-full max-w-lg flex flex-col items-center mt-12 mb-10 space-y-2 text-center">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200 drop-shadow-lg">
                        EchoPerfect
                    </h1>
                </div>
                <p className="text-indigo-300/60 text-xs font-semibold uppercase tracking-[0.2em]">
                    AI Phonetic Coach
                </p>
            </header>

            <section className="w-full max-w-lg flex flex-col gap-10 mb-24 relative">

                {/* Character & Speech Bubble */}
                <div className="relative w-full flex justify-center -mb-8 z-0 pointer-events-none">
                    {/* Character Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/30 blur-3xl rounded-full -z-10"></div>
                    <div className="relative w-28 h-28 md:w-40 md:h-40 mr-8">
                        {/* Character Image */}
                        <div className="absolute inset-0 z-10">
                            <Image
                                src="/coach_character.png"
                                alt="AI Coach"
                                fill
                                className="object-contain object-bottom drop-shadow-[0_0_10px_rgba(167,139,250,0.2)]"
                                style={{
                                    maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
                                }}
                            />
                        </div>

                        {/* Speech Bubble */}
                        <div className="absolute -top-2 -right-24 md:-right-28 z-20 animate-bounce-slow">
                            <div className="bg-slate-900/90 backdrop-blur-sm text-white text-[10px] md:text-xs font-medium py-2 px-3 rounded-2xl rounded-bl-none shadow-lg shadow-purple-500/20 border border-purple-500/30 relative max-w-[120px] md:max-w-[140px] leading-tight flex items-center justify-center text-center">
                                準備はいい？<br />好きな言葉を<br />入力してね！
                                <div className="absolute -bottom-1 -left-1 w-2 h-2 md:w-3 md:h-3 bg-slate-900/90 border-r border-b border-purple-500/30 transform rotate-45"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Card */}
                <div className="bg-[#1e1e2e]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-white/20 transition-colors duration-500 z-10 w-full">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between pl-1">
                            <label className="text-gray-300 text-sm font-bold uppercase tracking-wider">Target Phrase</label>
                            <button
                                onClick={() => setIsLibraryOpen(true)}
                                className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20"
                            >
                                <Book className="w-3.5 h-3.5" />
                                <span>Library</span>
                            </button>
                        </div>

                        <textarea
                            value={targetText}
                            onChange={(e) => setTargetText(e.target.value)}
                            className="w-full bg-[#13131f] border border-gray-700/50 rounded-2xl p-5 text-gray-100 text-xl leading-relaxed focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none shadow-inner"
                            rows={3}
                            placeholder="Type something to practice..."
                        />
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <button
                            onClick={() => generateReference()}
                            disabled={isGeneratingRef || !targetText}
                            className="flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-bold px-6 py-3 rounded-full shadow-lg shadow-indigo-900/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                        >
                            {isGeneratingRef ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Volume2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            )}
                            <span>Generate</span>
                        </button>

                        <div className="flex-1 min-w-0">
                            <CustomAudioPlayer src={refAudioUrl} className="w-full shadow-md" />
                        </div>
                    </div>
                </div>

                {/* Recorder Area */}
                <div className="flex flex-col items-center justify-center py-2">
                    <Recorder onRecordingComplete={handleRecordingComplete} isProcessing={isProcessing} />
                </div>

                {/* Error Message */}
                {errorMsg && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center animate-in fade-in slide-in-from-top-2">
                        {errorMsg}
                    </div>
                )}

                {/* Results */}
                <AnalysisResult data={analysisData} isLoading={isProcessing} />
            </section>

            <footer className="fixed bottom-6 text-gray-700 text-[10px] tracking-widest uppercase">
                Powered by Gemini 3 Flash Preview
            </footer>

            {/* Library Modal */}
            <PromptLibraryModal
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                onSelect={handleLibrarySelect}
            />
        </main>
    );
}


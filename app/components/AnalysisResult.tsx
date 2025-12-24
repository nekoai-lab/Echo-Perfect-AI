"use client";

import { CheckCircle, AlertTriangle, Activity } from "lucide-react";

interface AnalysisIssue {
    target_word: string;
    error_detail: string;
    fix_advice: string;
}

interface AnalysisData {
    score: number;
    issues: AnalysisIssue[];
}

interface AnalysisResultProps {
    data: AnalysisData | null;
    isLoading: boolean;
}

export default function AnalysisResult({ data, isLoading }: AnalysisResultProps) {
    if (isLoading) {
        return (
            <div className="w-full max-w-md mx-auto p-6 bg-gray-900/50 rounded-xl border border-indigo-500/30 flex flex-col items-center gap-3 animate-pulse">
                <Activity className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-gray-300 text-sm">Analyzing via Gemini 3 Flash...</p>
                <p className="text-indigo-400/50 text-xs">Comparing waveforms & phonemes</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="w-full max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            {/* Overall Score Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-center shadow-xl border border-indigo-500/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

                <h3 className="text-indigo-200 text-sm uppercase tracking-wider mb-1">Overall Score</h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-white tracking-tighter shadow-black drop-shadow-lg">
                        {data.score}
                    </span>
                    <span className="text-gray-400 text-lg">/100</span>
                </div>
            </div>

            {/* Issues List */}
            <div className="space-y-3">
                {data.issues.length === 0 ? (
                    <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-xl flex items-center gap-3 text-green-200">
                        <CheckCircle className="w-5 h-5" />
                        <span>Perfect! Native-like pronunciation.</span>
                    </div>
                ) : (
                    data.issues.map((issue, idx) => (
                        <div key={idx} className="bg-gray-800/80 border-l-4 border-amber-500 rounded-r-xl p-4 shadow-sm backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                <span className="text-amber-100 font-bold font-mono">"{issue.target_word}"</span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{issue.error_detail}</p>
                            <div className="bg-black/30 p-2 rounded text-xs text-indigo-200">
                                💡 {issue.fix_advice}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

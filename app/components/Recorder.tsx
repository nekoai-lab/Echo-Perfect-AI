"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, StopCircle, RefreshCw, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

interface RecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
    isProcessing: boolean;
}

export default function Recorder({ onRecordingComplete, isProcessing }: RecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Prefer standard codecs for Vercel
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : "audio/webm";

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: mimeType });
                onRecordingComplete(audioBlob);
                stream.getTracks().forEach(track => track.stop()); // Stop mic
            };

            mediaRecorder.start();
            setIsRecording(true);
            setError(null);
            setTimeLeft(10);

            // Countdown Timer
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err) {
            console.error("Mic access denied:", err);
            setError("Microphone access denied. Please allow microphone usage.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                {/* Glow Effect (Pulse when Idle) */}
                {!isRecording && !isProcessing && (
                    <div className="absolute -inset-1 rounded-full bg-indigo-500/30 blur-md group-hover:bg-indigo-500/50 transition-all duration-500 animate-pulse"></div>
                )}

                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={clsx(
                        "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative z-10",
                        isRecording
                            ? "bg-red-500 hover:bg-red-600 scale-105"
                            : "bg-gradient-to-br from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 hover:scale-105",
                        isProcessing && "opacity-50 cursor-not-allowed grayscale"
                    )}
                >
                    {isRecording ? (
                        <StopCircle className="w-10 h-10 text-white drop-shadow-md" />
                    ) : (
                        <Mic className="w-10 h-10 text-white drop-shadow-md" />
                    )}
                </button>

                {/* Recording Ripple */}
                {isRecording && (
                    <>
                        <div className="absolute -inset-4 rounded-full border border-red-500/30 opacity-75 animate-ping pointer-events-none"></div>
                        <div className="absolute -inset-8 rounded-full border border-red-500/10 opacity-50 animate-pulse delay-75 pointer-events-none"></div>
                    </>
                )}
            </div>

            <div className="h-8 flex flex-col items-center justify-center gap-1">
                {isRecording ? (
                    <span className="text-red-400 font-mono font-bold text-2xl tracking-widest drop-shadow-sm">
                        00:{timeLeft.toString().padStart(2, '0')}
                    </span>
                ) : (
                    <span className="text-white text-lg font-medium drop-shadow-md tracking-wide mt-2">Tap to Record</span>
                )}
                {!isRecording && <span className="text-gray-500 text-xs">Max 10 seconds</span>}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 px-3 py-1 rounded border border-red-500/20">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
}

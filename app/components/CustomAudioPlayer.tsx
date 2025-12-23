"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { clsx } from "clsx";

interface CustomAudioPlayerProps {
    src: string | null;
    className?: string;
}

export default function CustomAudioPlayer({ src, className }: CustomAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            setProgress(0);
        }
    }, [src]);

    const togglePlay = () => {
        if (!audioRef.current || !src) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setProgress((current / total) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const seekTime = (Number(e.target.value) / 100) * audioRef.current.duration;
            audioRef.current.currentTime = seekTime;
            setProgress(Number(e.target.value));
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className={clsx("bg-indigo-950/40 border border-indigo-500/30 rounded-full px-4 py-2 flex items-center gap-3 backdrop-blur-sm", className)}>
            <audio
                ref={audioRef}
                src={src || undefined}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

            <button
                onClick={togglePlay}
                disabled={!src}
                className="w-8 h-8 flex items-center justify-center bg-indigo-500 hover:bg-indigo-400 text-white rounded-full transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
            </button>

            <div className="flex-1 flex flex-col justify-center gap-1">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    disabled={!src}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-400 hover:accent-indigo-300"
                />
            </div>

            <span className="text-[10px] font-mono text-indigo-200 w-8 text-right">
                {formatTime(duration)}
            </span>
        </div>
    );
}

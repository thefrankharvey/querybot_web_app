"use client";

import { Progress } from "@/app/ui-primitives/progress";
import { useEffect, useState, useRef } from "react";

const STATUS_MESSAGES = [
    "Scouting agents",
    "Calibrating comp titles",
    "Aligning stars and genres",
    "Curating your agent list",
    "Querying the query gods",
    "Finding your dream agent",
    "Paging literary destiny",
    "Building your agent list",
    "Agents with your themes found",
];

interface ProgressBarProps {
    isSuccess: boolean;
    onComplete: () => void;
}

export default function ProgressBar({ isSuccess, onComplete }: ProgressBarProps) {
    const [progress, setProgress] = useState(0);
    const hasCompletedRef = useRef(false);
    const [messageIndex, setMessageIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Prevent multiple completions
        if (hasCompletedRef.current) return;

        // Determine interval timing and increment based on success state
        const intervalMs = isSuccess ? 50 : 100;
        const increment = isSuccess ? 5 : 1;
        const maxBeforeSuccess = 90;

        const interval = setInterval(() => {
            setProgress((prev) => {
                // If we've reached 100, trigger completion
                if (prev >= 100) {
                    clearInterval(interval);
                    if (!hasCompletedRef.current) {
                        hasCompletedRef.current = true;
                        // Use setTimeout to ensure state update completes before callback
                        setTimeout(() => onComplete(), 100);
                    }
                    return 100;
                }

                // If not successful yet, pause at 90%
                if (!isSuccess && prev >= maxBeforeSuccess) {
                    return maxBeforeSuccess;
                }

                // Calculate next value
                const next = prev + increment;

                // Cap at 100
                return Math.min(next, 100);
            });
        }, intervalMs);

        return () => clearInterval(interval);
    }, [isSuccess, onComplete]);

    // Cycle through status messages
    useEffect(() => {
        const cycleInterval = setInterval(() => {
            setIsVisible(false); // Start fade out

            setTimeout(() => {
                // Move to next message sequentially
                setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
                setIsVisible(true); // Start fade in
            }, 500); // Wait for fade out to complete
        }, 2000);

        return () => clearInterval(cycleInterval);
    }, []);

    return (
        <div className="w-full max-w-md md:ml-[-100px]">
            <p className="text-center text-2xl font-semibold mb-4 text-accent">
                {Math.round(progress)}%
            </p>
            <Progress value={progress} className="h-2" />
            <p
                className={`text-center text-lg font-medium mt-4 text-accent transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"
                    }`}
            >
                {STATUS_MESSAGES[messageIndex]}
            </p>
        </div>
    );
}

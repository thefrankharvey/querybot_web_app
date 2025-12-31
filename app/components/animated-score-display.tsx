"use client";

import React, { useEffect, useRef, useState } from "react";
import StarRating from "./star-rating";

interface AnimatedScoreDisplayProps {
  score: number;
  size?: "lg" | "xl";
  isHovered?: boolean;
}

export const AnimatedScoreDisplay = ({
  score,
  size = "lg",
  isHovered,
}: AnimatedScoreDisplayProps) => {
  const [displayScore, setDisplayScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const targetScore = score ?? 0;

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const animateScore = () => {
    stopAnimation();
    setIsAnimating(true);
    const duration = 300;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const nextValue =
        progress === 1
          ? targetScore
          : Math.round(targetScore * progress * 10) / 10;
      setDisplayScore(nextValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
      }
    };

    animationRef.current = requestAnimationFrame(step);
  };

  // Trigger animation based on isHovered prop from parent
  useEffect(() => {
    if (isHovered) {
      setDisplayScore(0);
      animateScore();
    } else if (isHovered === false) {
      stopAnimation();
      setDisplayScore(targetScore);
      setIsAnimating(false);
    }
  }, [isHovered, targetScore, animateScore, stopAnimation]);

  // Sync displayScore when targetScore changes
  useEffect(() => {
    setDisplayScore(targetScore);
    setIsAnimating(false);
    return () => stopAnimation();
  }, [targetScore]);

  const renderedScore = isAnimating
    ? Math.round(displayScore)
    : Number.isInteger(targetScore)
    ? targetScore
    : targetScore.toFixed(1);

  const textSizeClass = size === "xl" ? "text-xl" : "text-lg";

  return (
    <div className={`${textSizeClass} font-semibold flex items-center gap-1`}>
      <StarRating rateNum={displayScore} />
      {renderedScore}
    </div>
  );
};

export default AnimatedScoreDisplay;

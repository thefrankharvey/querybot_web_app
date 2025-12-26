"use client";

import React, { useEffect, useRef, useState } from "react";
import { formatDisplayString, formatGenres } from "@/app/utils";
import { AgentMatch } from "@/app/context/agent-matches-context";
import StarRating from "@/app/components/star-rating";

export const DisplayAgentCards = ({
  agent,
  id,
}: {
  agent: AgentMatch;
  id: string;
}) => {
  const [displayScore, setDisplayScore] = useState(agent.normalized_score);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const targetScore = agent.normalized_score ?? 0;

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

  const handleMouseEnter = () => {
    setDisplayScore(0);
    animateScore();
  };

  const handleMouseLeave = () => {
    stopAnimation();
    setDisplayScore(targetScore);
    setIsAnimating(false);
  };

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

  return (
    <div
      id={id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md hover:shadow-2xl transition-all duration-300 z-999"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
        </div>
        <div className="flex flex-col items-start gap-1 w-fit">
          <label className="text-sm font-semibold">Match Score:</label>
          <div className="text-xl font-semibold flex items-center gap-1">
            <StarRating rateNum={displayScore} />
            {renderedScore}
          </div>
        </div>
        <span className="bg-accent text-white text-xs p-1 px-3 rounded-xl font-semibold w-fit">
          Open to Submissions
        </span>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Agency:</label>
          <p className="text-sm">{agent.agency}</p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Favorites:</label>
          <p className="text-sm line-clamp-3">
            {formatDisplayString(agent.favorites)}
          </p>
        </div>
        {/* <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Interests:</label>
          <p className="text-sm line-clamp-3">
            {formatDisplayString(agent.extra_interest)}
          </p>
        </div> */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Top Genres:</label>
          <div className="flex flex-wrap gap-1">
            {formatGenres(agent.genres)
              .slice(0, 6)
              .map((genre: string) => (
                <div
                  key={genre}
                  className="bg-gray-100 px-2 py-1 text-sm rounded-md"
                >
                  {genre}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayAgentCards;

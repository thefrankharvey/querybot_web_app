"use client";

import { Star } from "lucide-react";
import React from "react";

type StarRatingProps = {
  rateNum: number; // e.g. 4.5
  maxStars?: number; // defaults to 5
};

export const StarRating: React.FC<StarRatingProps> = ({
  rateNum,
  maxStars = 5,
}) => {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxStars }).map((_, i) => {
        const fillPercent = Math.min(Math.max(rateNum - i, 0), 1) * 100;

        return (
          <div key={i} className="relative w-5 h-5">
            {/* Background (empty star) */}
            <Star className="w-5 h-5 text-gray-300" fill="transparent" />

            {/* Foreground (filled portion) */}
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;

"use client";

import Lottie from "lottie-react";
import bookAnimation from "@/public/book-animation.json";

interface BookLoaderProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

// NOTE uses lottie-react to load the animation
// NOTE uses the book-animation.json file from the public folder

export default function BookLoader({
  className,
  width = 100,
  height = 100,
}: BookLoaderProps) {
  return (
    <div className={className}>
      <Lottie
        animationData={bookAnimation}
        loop={true}
        style={{ width, height }}
      />
    </div>
  );
}

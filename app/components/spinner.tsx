"use client";
import { motion } from "framer-motion";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 200, className = "" }: SpinnerProps) {
  const numSegments = 8;
  const offset = 0.3;
  const duration = numSegments * offset;

  const segments = Array.from({ length: numSegments }, (_, i) => i * 45);

  return (
    <div className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 200 200"
      >
        <defs>
          <path
            id="loading-path-navy"
            d="M 94 25 C 94 21.686 96.686 19 100 19 L 100 19 C 103.314 19 106 21.686 106 25 L 106 50 C 106 53.314 103.314 56 100 56 L 100 56 C 96.686 56 94 53.314 94 50 Z"
            fill="#1C1B53"
            style={{ transformOrigin: "100px 100px" }}
          />
          <path
            id="loading-path-gray"
            d="M 94 25 C 94 21.686 96.686 19 100 19 L 100 19 C 103.314 19 106 21.686 106 25 L 106 50 C 106 53.314 103.314 56 100 56 L 100 56 C 96.686 56 94 53.314 94 50 Z"
            fill="#767697"
            style={{ transformOrigin: "100px 100px" }}
          />
        </defs>

        {segments.map((rotation, index) => (
          <motion.g
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration,
              delay: index * offset - duration,
              repeat: Infinity,
              times: [0, 0.1, 1],
              ease: "linear",
            }}
          >
            <use
              href={
                index % 2 === 0 ? "#loading-path-navy" : "#loading-path-gray"
              }
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "100px 100px",
              }}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

export default Spinner;

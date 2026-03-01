"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type LeafStyle = {
  "--leaf-left": string;
  "--leaf-width": string;
  "--leaf-height": string;
  "--leaf-duration": string;
  "--leaf-delay": string;
  "--leaf-opacity": string;
  "--leaf-drift-a": string;
  "--leaf-drift-b": string;
  "--leaf-drift-c": string;
  "--leaf-drift-d": string;
} & CSSProperties;

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const createLeafStyles = (): LeafStyle[] =>
  Array.from({ length: 32 }).map(() => {
    const width = randomBetween(14, 24);
    const height = width * randomBetween(0.6, 0.82);
    const left = randomBetween(0, 100);
    const duration = randomBetween(12, 26);
    const delay = -randomBetween(0, 22);
    const opacity = randomBetween(0.5, 0.85);
    return {
      "--leaf-left": `${left.toFixed(2)}%`,
      "--leaf-width": `${width.toFixed(2)}px`,
      "--leaf-height": `${height.toFixed(2)}px`,
      "--leaf-duration": `${duration.toFixed(2)}s`,
      "--leaf-delay": `${delay.toFixed(2)}s`,
      "--leaf-opacity": opacity.toFixed(2),
      "--leaf-drift-a": `${randomBetween(-34, 34).toFixed(2)}px`,
      "--leaf-drift-b": `${randomBetween(-38, 38).toFixed(2)}px`,
      "--leaf-drift-c": `${randomBetween(-34, 34).toFixed(2)}px`,
      "--leaf-drift-d": `${randomBetween(-30, 30).toFixed(2)}px`,
    };
  });

export default function AutumnLeavesBackground() {
  const [leafStyles, setLeafStyles] = useState<LeafStyle[]>([]);

  useEffect(() => {
    setLeafStyles(createLeafStyles());
  }, []);

  return (
    <div className="app-leaves" aria-hidden="true">
      {leafStyles.map((leafStyle, index) => (
        <span key={`leaf-${index}`} className="app-leaf" style={leafStyle} />
      ))}
    </div>
  );
}

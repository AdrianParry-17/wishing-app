"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

import { WishPlayground } from "@/components/wish-playground";

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((module) => module.ThemeToggle),
  { ssr: false },
);

const SKY_STARS = [
  { left: 4, top: 12, size: 3, delay: 0.2, duration: 8.1, depth: 60, driftX: -7, driftY: 5, driftDuration: 28 },
  { left: 8, top: 41, size: 4, delay: 1.6, duration: 9.5, depth: 42, driftX: 6, driftY: -4, driftDuration: 31 },
  { left: 15, top: 68, size: 2, delay: 0.8, duration: 10.2, depth: 34, driftX: -5, driftY: 3, driftDuration: 34 },
  { left: 22, top: 16, size: 4, delay: 2.1, duration: 11.1, depth: 66, driftX: 8, driftY: 6, driftDuration: 27 },
  { left: 29, top: 48, size: 3, delay: 1.4, duration: 9.3, depth: 38, driftX: -6, driftY: -4, driftDuration: 32 },
  { left: 36, top: 75, size: 2, delay: 2.7, duration: 10.8, depth: 28, driftX: 5, driftY: -3, driftDuration: 36 },
  { left: 43, top: 23, size: 3, delay: 0.4, duration: 8.7, depth: 54, driftX: -7, driftY: 4, driftDuration: 29 },
  { left: 49, top: 58, size: 4, delay: 1.9, duration: 9.6, depth: 46, driftX: 7, driftY: -5, driftDuration: 33 },
  { left: 56, top: 13, size: 3, delay: 2.8, duration: 11.4, depth: 62, driftX: -8, driftY: -4, driftDuration: 30 },
  { left: 63, top: 39, size: 2, delay: 0.9, duration: 8.4, depth: 36, driftX: 6, driftY: 4, driftDuration: 35 },
  { left: 70, top: 71, size: 4, delay: 2.2, duration: 9.8, depth: 30, driftX: -5, driftY: -6, driftDuration: 34 },
  { left: 76, top: 21, size: 3, delay: 1.2, duration: 10.6, depth: 58, driftX: 7, driftY: 3, driftDuration: 29 },
  { left: 82, top: 52, size: 2, delay: 0.6, duration: 8.9, depth: 40, driftX: -6, driftY: 5, driftDuration: 32 },
  { left: 88, top: 30, size: 4, delay: 2.4, duration: 10.1, depth: 52, driftX: 8, driftY: -4, driftDuration: 28 },
  { left: 95, top: 62, size: 3, delay: 1.7, duration: 9.2, depth: 32, driftX: -5, driftY: 4, driftDuration: 37 },
  { left: 12, top: 24, size: 2, delay: 1.2, duration: 8.6, depth: 44, driftX: 4, driftY: -3, driftDuration: 35 },
  { left: 18, top: 56, size: 3, delay: 2.2, duration: 10.4, depth: 39, driftX: -4, driftY: 4, driftDuration: 33 },
  { left: 26, top: 36, size: 2, delay: 0.5, duration: 9.1, depth: 47, driftX: 6, driftY: -2, driftDuration: 31 },
  { left: 39, top: 14, size: 3, delay: 1.8, duration: 8.8, depth: 53, driftX: -5, driftY: 3, driftDuration: 29 },
  { left: 52, top: 45, size: 2, delay: 2.6, duration: 10.7, depth: 37, driftX: 4, driftY: 5, driftDuration: 36 },
  { left: 61, top: 27, size: 3, delay: 0.9, duration: 9.9, depth: 55, driftX: -6, driftY: -4, driftDuration: 30 },
  { left: 74, top: 64, size: 2, delay: 1.4, duration: 9.4, depth: 33, driftX: 5, driftY: -3, driftDuration: 34 },
  { left: 86, top: 42, size: 3, delay: 2.9, duration: 10.1, depth: 49, driftX: -4, driftY: 4, driftDuration: 32 },
  { left: 93, top: 18, size: 2, delay: 0.7, duration: 8.5, depth: 58, driftX: 6, driftY: 3, driftDuration: 28 },
  { left: 9, top: 60, size: 2, delay: 1.5, duration: 9.2, depth: 41, driftX: 4, driftY: -2, driftDuration: 33 },
  { left: 24, top: 10, size: 3, delay: 2.3, duration: 10.1, depth: 57, driftX: -5, driftY: 4, driftDuration: 29 },
  { left: 41, top: 62, size: 2, delay: 0.6, duration: 8.7, depth: 35, driftX: 5, driftY: -4, driftDuration: 34 },
  { left: 54, top: 34, size: 3, delay: 1.9, duration: 9.8, depth: 51, driftX: -6, driftY: 3, driftDuration: 30 },
  { left: 69, top: 16, size: 2, delay: 2.7, duration: 10.5, depth: 59, driftX: 6, driftY: -3, driftDuration: 31 },
  { left: 81, top: 60, size: 3, delay: 1.1, duration: 9.1, depth: 37, driftX: -4, driftY: 5, driftDuration: 35 },
  { left: 97, top: 38, size: 2, delay: 2.1, duration: 8.9, depth: 46, driftX: 5, driftY: -2, driftDuration: 32 },
] as const;

const METEOR_STREAKS = [
  { left: 6, top: 19, length: 132, angle: 30, delay: 1.2, duration: 8.6, depth: 58 },
  { left: 19, top: 31, length: 170, angle: 22, delay: 5.4, duration: 9.4, depth: 64 },
  { left: 35, top: 12, length: 148, angle: 36, delay: 2.8, duration: 10.2, depth: 52 },
  { left: 48, top: 26, length: 158, angle: 28, delay: 7.1, duration: 9.8, depth: 60 },
  { left: 64, top: 9, length: 142, angle: 34, delay: 4.4, duration: 8.9, depth: 56 },
  { left: 78, top: 24, length: 164, angle: 25, delay: 8.2, duration: 10.4, depth: 62 },
  { left: 90, top: 14, length: 146, angle: 31, delay: 3.6, duration: 9.1, depth: 54 },
] as const;

const CONSTELLATION_CHAINS = [
  {
    depth: 42,
    points: [
      { x: 8, y: 18 },
      { x: 13, y: 21 },
      { x: 19, y: 19 },
      { x: 25, y: 23 },
      { x: 31, y: 21 },
    ],
  },
  {
    depth: 40,
    points: [
      { x: 16, y: 33 },
      { x: 22, y: 30 },
      { x: 28, y: 35 },
      { x: 34, y: 32 },
      { x: 39, y: 37 },
      { x: 45, y: 34 },
    ],
  },
  {
    depth: 46,
    points: [
      { x: 44, y: 16 },
      { x: 50, y: 20 },
      { x: 56, y: 18 },
      { x: 62, y: 23 },
      { x: 68, y: 20 },
    ],
  },
  {
    depth: 38,
    points: [
      { x: 58, y: 42 },
      { x: 64, y: 39 },
      { x: 70, y: 44 },
      { x: 76, y: 41 },
      { x: 82, y: 46 },
      { x: 88, y: 43 },
    ],
  },
  {
    depth: 36,
    points: [
      { x: 20, y: 58 },
      { x: 27, y: 55 },
      { x: 34, y: 60 },
      { x: 41, y: 57 },
      { x: 47, y: 62 },
    ],
  },
  {
    depth: 34,
    points: [
      { x: 63, y: 61 },
      { x: 69, y: 58 },
      { x: 75, y: 63 },
      { x: 81, y: 60 },
      { x: 87, y: 65 },
    ],
  },
] as const;

function getSegmentStyle(
  start: { x: number; y: number },
  end: { x: number; y: number },
): CSSProperties {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    left: `${start.x}%`,
    top: `${start.y}%`,
    width: `${length}%`,
    transform: `rotate(${angle}deg)`,
  };
}

export function WishingStage() {
  const stageRef = useRef<HTMLElement | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let rafId = 0;

    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.08;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.08;

      if (stageRef.current) {
        stageRef.current.style.setProperty("--parallax-x", currentRef.current.x.toFixed(4));
        stageRef.current.style.setProperty("--parallax-y", currentRef.current.y.toFixed(4));
      }

      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  function setParallaxTarget(clientX: number, clientY: number): void {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const bounds = stage.getBoundingClientRect();
    const x = ((clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((clientY - bounds.top) / bounds.height - 0.5) * -2;

    targetRef.current.x = Math.max(-1, Math.min(1, x));
    targetRef.current.y = Math.max(-1, Math.min(1, y));
  }

  return (
    <main
      ref={stageRef}
      onPointerMove={(event) => setParallaxTarget(event.clientX, event.clientY)}
      onPointerLeave={() => {
        targetRef.current.x = 0;
        targetRef.current.y = 0;
      }}
      className="stage-root relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-8 sm:py-12"
    >
      <div aria-hidden className="stage-bg pointer-events-none absolute inset-0 -z-10">
        <span
          className="scene-shader scene-shader--one parallax-node"
          style={{ ["--depth" as string]: "70px" } as CSSProperties}
        />
        <span
          className="scene-shader scene-shader--two parallax-node"
          style={{ ["--depth" as string]: "52px" } as CSSProperties}
        />

        <span
          className="color-wave color-wave--one parallax-node"
          style={{ ["--depth" as string]: "72px" } as CSSProperties}
        />
        <span
          className="color-wave color-wave--two parallax-node"
          style={{ ["--depth" as string]: "58px" } as CSSProperties}
        />
        <span
          className="color-wave color-wave--three parallax-node"
          style={{ ["--depth" as string]: "44px" } as CSSProperties}
        />

        <span
          className="cosmos-river cosmos-river--one parallax-node"
          style={{ ["--depth" as string]: "66px" } as CSSProperties}
        />
        <span
          className="cosmos-river cosmos-river--two parallax-node"
          style={{ ["--depth" as string]: "46px" } as CSSProperties}
        />

        <span
          className="sky-ring sky-ring--one parallax-node"
          style={{ ["--depth" as string]: "52px" } as CSSProperties}
        />
        <span
          className="sky-ring sky-ring--two parallax-node"
          style={{ ["--depth" as string]: "38px" } as CSSProperties}
        />

        {METEOR_STREAKS.map((meteor, index) => (
          <span
            key={`${meteor.left}-${meteor.top}-${index}`}
            className="meteor-streak"
            style={
              {
                left: `${meteor.left}%`,
                top: `${meteor.top}%`,
                ["--meteor-length" as string]: `${meteor.length}px`,
                ["--meteor-angle" as string]: `${meteor.angle}deg`,
                ["--meteor-depth" as string]: `${meteor.depth}px`,
                animationDelay: `${meteor.delay}s`,
                animationDuration: `${meteor.duration}s`,
              } as CSSProperties
            }
          />
        ))}

        {CONSTELLATION_CHAINS.map((chain, chainIndex) => (
          <div
            key={`chain-${chainIndex}`}
            className="constellation-chain"
            style={{ ["--constellation-depth" as string]: `${chain.depth}px` } as CSSProperties}
          >
            {chain.points.slice(0, -1).map((point, pointIndex) => {
              const nextPoint = chain.points[pointIndex + 1];

              return (
                <span
                  key={`chain-${chainIndex}-segment-${pointIndex}`}
                  className="constellation-segment"
                  style={getSegmentStyle(point, nextPoint)}
                />
              );
            })}

            {chain.points.map((point, pointIndex) => (
              <span
                key={`chain-${chainIndex}-node-${pointIndex}`}
                className="constellation-node"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              />
            ))}
          </div>
        ))}

        {SKY_STARS.map((star, index) => (
          <span
            key={`${star.left}-${star.top}-${index}`}
            className="sky-star parallax-node"
            style={
              {
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                ["--depth" as string]: `${star.depth}px`,
                ["--star-twinkle-delay" as string]: `${star.delay}s`,
                ["--star-twinkle-duration" as string]: `${star.duration}s`,
                ["--star-drift-x" as string]: `${star.driftX}px`,
                ["--star-drift-y" as string]: `${star.driftY}px`,
                ["--star-drift-duration" as string]: `${star.driftDuration}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="stage-toolbar parallax-node" style={{ ["--depth" as string]: "22px" } as CSSProperties}>
        <ThemeToggle />
      </div>

      <section className="stage-center mx-auto w-full max-w-4xl parallax-node" style={{ ["--depth" as string]: "20px" } as CSSProperties}>
        <WishPlayground />
      </section>

      <footer
        className="stage-consent parallax-node"
        style={{ ["--depth" as string]: "12px" } as CSSProperties}
      >
        <p>
          When you send a wish, you agree it may be stored anonymously in our database.
          This app is built to avoid storing identity details, but your own text can still
          reveal personal information, so do not include private or identifying content.
        </p>
      </footer>
    </main>
  );
}

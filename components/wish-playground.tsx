"use client";

import type { CSSProperties, FormEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const MAX_WISH_LENGTH = 512;
const JOURNEY_DURATION_MS = 10_000;
const LINE_INTERVAL_MS = 1_700;

type Phase = "idle" | "sending" | "launching" | "complete" | "error";

const AMBIENT_MOTES = [
  { left: 7, top: 14, size: 8, delay: 0.2, duration: 8.6 },
  { left: 18, top: 71, size: 10, delay: 1.8, duration: 10.2 },
  { left: 31, top: 28, size: 7, delay: 1.1, duration: 9.4 },
  { left: 46, top: 8, size: 12, delay: 2.6, duration: 11.4 },
  { left: 58, top: 73, size: 8, delay: 0.4, duration: 9.1 },
  { left: 69, top: 43, size: 9, delay: 3.1, duration: 10.7 },
  { left: 84, top: 21, size: 11, delay: 0.8, duration: 11.6 },
  { left: 92, top: 63, size: 7, delay: 2.2, duration: 8.8 },
] as const;

const JOURNEY_SPARKS = [
  { angle: -82, distance: 146, size: 5, delay: 40 },
  { angle: -60, distance: 174, size: 7, delay: 90 },
  { angle: -34, distance: 168, size: 4, delay: 130 },
  { angle: -14, distance: 152, size: 6, delay: 60 },
  { angle: 8, distance: 148, size: 5, delay: 70 },
  { angle: 28, distance: 164, size: 7, delay: 120 },
  { angle: 54, distance: 158, size: 4, delay: 145 },
  { angle: 80, distance: 140, size: 6, delay: 50 },
  { angle: -98, distance: 132, size: 3, delay: 30 },
  { angle: 96, distance: 134, size: 3, delay: 42 },
] as const;

const JOURNEY_WAVES = [
  { size: 180, delay: 0, duration: 2300 },
  { size: 250, delay: 420, duration: 2600 },
  { size: 320, delay: 860, duration: 2900 },
  { size: 380, delay: 1220, duration: 3100 },
] as const;

const COMET_SHARDS = [
  { angle: -118, distance: 122, size: 3, delay: 60 },
  { angle: -92, distance: 160, size: 4, delay: 130 },
  { angle: -70, distance: 148, size: 3, delay: 170 },
  { angle: -44, distance: 182, size: 4, delay: 220 },
  { angle: -20, distance: 174, size: 3, delay: 260 },
  { angle: 4, distance: 150, size: 3, delay: 110 },
  { angle: 26, distance: 168, size: 4, delay: 190 },
  { angle: 48, distance: 158, size: 3, delay: 230 },
  { angle: 74, distance: 138, size: 3, delay: 150 },
] as const;

const JOURNEY_LINES = [
  "Listening to your wish...",
  "Aligning stars...",
  "Folding a paper comet...",
  "Giving your wish a gentle push...",
  "Tracing a brighter path...",
  "Almost there...",
] as const;

function countUnicodeCharacters(value: string): number {
  return Array.from(value).length;
}

function truncateUnicodeCharacters(value: string, maxChars: number): string {
  return Array.from(value).slice(0, maxChars).join("");
}

function normalizeWishContent(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

type ApiResponse = {
  ok: boolean;
  message?: string;
};

export function WishPlayground() {
  const [content, setContent] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [displayWish, setDisplayWish] = useState("");
  const [journeyLine, setJourneyLine] = useState<string>(JOURNEY_LINES[0]);
  const [journeyKey, setJourneyKey] = useState(0);

  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lineTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPromptVisible = phase === "idle";
  const isSendingPhase = phase === "sending" || phase === "launching";
  const isTerminalPhase = phase === "complete" || phase === "error";

  useEffect(() => {
    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
      if (lineTimerRef.current) {
        clearInterval(lineTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "sending" && phase !== "launching") {
      if (lineTimerRef.current) {
        clearInterval(lineTimerRef.current);
        lineTimerRef.current = null;
      }
      return;
    }

    setJourneyLine(JOURNEY_LINES[Math.floor(Math.random() * JOURNEY_LINES.length)]);
    lineTimerRef.current = setInterval(() => {
      setJourneyLine(JOURNEY_LINES[Math.floor(Math.random() * JOURNEY_LINES.length)]);
    }, LINE_INTERVAL_MS);

    return () => {
      if (lineTimerRef.current) {
        clearInterval(lineTimerRef.current);
        lineTimerRef.current = null;
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "idle") {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => {
      window.clearTimeout(focusTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (!isTerminalPhase) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      setPhase("idle");
      setFeedback(null);
      setDisplayWish("");
      setJourneyLine(JOURNEY_LINES[0]);
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [isTerminalPhase]);

  const remainingChars = useMemo(
    () => MAX_WISH_LENGTH - countUnicodeCharacters(content),
    [content],
  );

  const lowRemaining = remainingChars <= 60;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (phase !== "idle") {
      return;
    }

    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }

    const normalizedContent = normalizeWishContent(content);
    if (countUnicodeCharacters(normalizedContent) === 0) {
      setFeedback({ type: "error", message: "Please type a wish first." });
      return;
    }

    setDisplayWish(normalizedContent);
    setFeedback(null);
    setPhase("sending");

    const requestStart = performance.now();

    try {
      const response = await fetch("/api/wish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: normalizedContent,
          honeypot,
          captchaToken: "",
        }),
      });

      const body = (await response.json()) as ApiResponse;
      if (!response.ok || !body.ok) {
        throw new Error("submission_failed");
      }

      const elapsed = performance.now() - requestStart;
      if (elapsed < 750) {
        await wait(750 - elapsed);
      }

      setPhase("launching");
      setJourneyKey((current) => current + 1);
      setContent("");

      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }

      phaseTimerRef.current = setTimeout(() => {
        setPhase("complete");
        setJourneyLine("Wish delivered. Press Enter to make another.");
        phaseTimerRef.current = null;
      }, JOURNEY_DURATION_MS);
    } catch {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }

      setPhase("error");
      setFeedback({
        type: "error",
        message: "Unable to send your wish right now. Press Enter to return.",
      });
    }
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    formRef.current?.requestSubmit();
  }

  return (
    <section className="playground-root relative mx-auto flex w-full max-w-3xl flex-col items-center justify-center overflow-hidden px-3 py-4 sm:px-5 sm:py-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {AMBIENT_MOTES.map((mote, index) => (
          <span
            key={`${mote.left}-${mote.top}-${index}`}
            className="ambient-mote"
            style={{
              left: `${mote.left}%`,
              top: `${mote.top}%`,
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              animationDelay: `${mote.delay}s`,
              animationDuration: `${mote.duration}s`,
            }}
          />
        ))}
      </div>

      <div className={isPromptVisible ? "prompt-stack is-visible" : "prompt-stack is-hidden"}>
        <h1 className="playground-title">Make a wish.</h1>
        <p className="playground-subtitle">A short line can fly the farthest.</p>

        <form ref={formRef} className="wish-form mt-8 w-full" onSubmit={onSubmit}>
          <div className="wish-input-wrap">
            <textarea
              ref={inputRef}
              id="wish-content"
              name="wish-content"
              value={content}
              onChange={(event) => {
                setContent(truncateUnicodeCharacters(event.target.value, MAX_WISH_LENGTH));
              }}
              onKeyDown={onInputKeyDown}
              rows={2}
              required
              placeholder="Write it here, then press Enter"
              className="wish-textarea"
            />

            <button
              type="submit"
              className="wish-send-icon"
              aria-label="Submit wish"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M13 7L18 12L13 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="absolute -left-[100vw] -top-[100vh]" aria-hidden>
            <label htmlFor="hp-field">Do not fill this field</label>
            <input
              id="hp-field"
              type="text"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <p
            className={
              lowRemaining
                ? "wish-remaining wish-remaining--low"
                : "wish-remaining"
            }
          >
            {remainingChars} characters left
          </p>
        </form>

        {feedback && feedback.type === "error" ? (
          <p className="wish-inline-error">{feedback.message}</p>
        ) : null}
      </div>

      {isSendingPhase ? (
        <div className="journey-layer is-active" aria-live="polite">
          <div className="journey-prep">
            <p className="journey-wish">{displayWish}</p>
            <p className="journey-line">{journeyLine}</p>
            <div className="journey-progress" aria-hidden>
              <span className="journey-progress__bar" />
            </div>
          </div>

          {phase === "launching" ? (
            <div key={journeyKey} className="launch-sequence is-launching" aria-hidden>
              <span className="launch-nebula launch-nebula--one" />
              <span className="launch-nebula launch-nebula--two" />
              <span className="launch-nebula launch-nebula--three" />

              {JOURNEY_WAVES.map((wave, index) => (
                <span
                  key={`${wave.size}-${index}`}
                  className="launch-wave"
                  style={
                    {
                      ["--wave-size" as string]: `${wave.size}px`,
                      animationDelay: `${wave.delay}ms`,
                      animationDuration: `${wave.duration}ms`,
                    } as CSSProperties
                  }
                />
              ))}

              <span className="launch-path" />
              <span className="launch-path launch-path--alt" />
              <span className="launch-comet">
                <span className="launch-comet__trail" />
                <span className="launch-comet__core" />
              </span>
              <span className="launch-comet launch-comet--echo">
                <span className="launch-comet__trail" />
                <span className="launch-comet__core" />
              </span>

              {JOURNEY_SPARKS.map((spark, index) => (
                <span
                  key={`${spark.angle}-${index}`}
                  className="launch-spark"
                  style={
                    {
                      ["--spark-angle" as string]: `${spark.angle}deg`,
                      ["--spark-distance" as string]: `${spark.distance}px`,
                      ["--spark-size" as string]: `${spark.size}px`,
                      animationDelay: `${spark.delay}ms`,
                    } as CSSProperties
                  }
                />
              ))}

              {COMET_SHARDS.map((shard, index) => (
                <span
                  key={`${shard.angle}-${index}`}
                  className="launch-shard"
                  style={
                    {
                      ["--shard-angle" as string]: `${shard.angle}deg`,
                      ["--shard-distance" as string]: `${shard.distance}px`,
                      ["--shard-size" as string]: `${shard.size}px`,
                      animationDelay: `${shard.delay}ms`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {phase === "complete" ? (
        <div className="journey-layer is-active" aria-live="polite">
          <p className="journey-wish journey-wish--done">{displayWish}</p>
          <p className="journey-line">Wish delivered. Press Enter to make another.</p>
        </div>
      ) : null}

      {phase === "error" ? (
        <div className="journey-layer is-active" aria-live="polite">
          <p className="journey-line journey-line--error">Unable to submit right now.</p>
          <p className="journey-hint">Press Enter to return and try again.</p>
        </div>
      ) : null}
    </section>
  );
}
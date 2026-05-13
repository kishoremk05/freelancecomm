import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MotionValue } from "framer-motion";
import "@google/model-viewer";
import djUrl from "@/assets/dj_music_man.glb?url";

type ModelViewerElement = HTMLElement & {
  play?: (options?: { repetitions?: number; pingpong?: boolean }) => Promise<void>;
  pause?: () => void;
  updateFraming?: () => void;
  availableAnimations?: string[];
  duration?: number;
  currentTime?: number;
  timeScale?: number;
  paused?: boolean;
  loop?: boolean;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        autoplay?: boolean;
        "animation-name"?: string;
        "animation-crossfade-duration"?: string;
        exposure?: string;
        "shadow-intensity"?: string;
        "camera-orbit"?: string;
        "camera-target"?: string;
        "field-of-view"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
        "interaction-prompt"?: string;
        "disable-zoom"?: boolean;
        loading?: "auto" | "lazy" | "eager";
        reveal?: "auto" | "interaction" | "manual";
      };
    }
  }
}

/**
 * Hero character story:
 *   runIn   → sprints in from far left to center
 *   breathe → stops, hands-on-knees breathing — clearly visible chest rise/fall
 *   sprintOut → takes off and sprints clean off the right edge
 *   reset   → invisible re-arm off-screen left, then loop
 *
 * Facing always matches direction of travel (right).
 */
type Phase = "runIn" | "breathe" | "sprintOut" | "reset";

const FALLBACK_CLIP_DURATIONS: Record<string, number> = {
  Run: 1.0,
  Idle: 1.0,
  PickUp: 1.0,
};

// Negative azimuth = facing right (direction of travel).
const ORBIT_FACING_RIGHT = "-32deg 82deg 110%";

const DjModel = ({ scrollMV: _scrollMV }: { scrollMV?: MotionValue<number> }) => {
  const viewerRef = useRef<ModelViewerElement>(null);
  const [phase, setPhase] = useState<Phase>("reset");
  const [clipDurations, setClipDurations] = useState<Record<string, number>>(
    FALLBACK_CLIP_DURATIONS
  );
  const [hasIdle, setHasIdle] = useState(false);

  const phaseDurations = useMemo<Record<Phase, number>>(() => {
    const run = (clipDurations.Run ?? 1.0) * 1000;
    return {
      runIn: Math.max(1700, run * 2.0),
      breathe: 2400, // clear, visible breathing pause
      sprintOut: Math.max(1400, run * 1.6),
      reset: 80,
    };
  }, [clipDurations]);

  // Kick the loop off after first paint
  useEffect(() => {
    const t = setTimeout(() => setPhase("runIn"), 80);
    return () => clearTimeout(t);
  }, []);

  // Measure real clip durations
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    let cancelled = false;

    const measure = async () => {
      for (let i = 0; i < 60; i++) {
        if (viewer.availableAnimations && viewer.availableAnimations.length) break;
        await new Promise((r) => setTimeout(r, 50));
      }
      if (cancelled) return;
      const names = viewer.availableAnimations ?? [];
      setHasIdle(names.includes("Idle"));
      const out: Record<string, number> = { ...FALLBACK_CLIP_DURATIONS };
      const wanted = ["Run", "Idle", "PickUp"];
      const previousName = viewer.getAttribute("animation-name");
      const wasPaused = !!viewer.paused;
      viewer.pause?.();
      for (const clip of wanted) {
        if (!names.includes(clip)) continue;
        viewer.setAttribute("animation-name", clip);
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        const d = viewer.duration;
        if (typeof d === "number" && d > 0 && Number.isFinite(d)) {
          out[clip] = d;
        }
      }
      if (previousName) viewer.setAttribute("animation-name", previousName);
      if (!wasPaused) void viewer.play?.();
      if (!cancelled) setClipDurations(out);
    };

    const onLoad = () => {
      viewer.updateFraming?.();
      void measure();
      void viewer.play?.();
    };
    viewer.addEventListener("load", onLoad);
    return () => {
      cancelled = true;
      viewer.removeEventListener("load", onLoad);
    };
  }, []);

  // Phase scheduler
  useEffect(() => {
    const next: Record<Phase, Phase> = {
      reset: "runIn",
      runIn: "breathe",
      breathe: "sprintOut",
      sprintOut: "reset",
    };
    const t = setTimeout(() => setPhase(next[phase]), phaseDurations[phase]);
    return () => clearTimeout(t);
  }, [phase, phaseDurations]);

  // Pre-arm Run during reset
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (phase === "reset") {
      viewer.setAttribute("animation-name", "Run");
      try {
        viewer.currentTime = 0;
      } catch {
        /* noop */
      }
      void viewer.play?.();
    }
  }, [phase]);

  const animationName = (() => {
    switch (phase) {
      case "runIn":
      case "sprintOut":
        return "Run";
      case "breathe":
        return hasIdle ? "Idle" : "PickUp";
      case "reset":
      default:
        return "Run";
    }
  })();

  const cameraOrbit = ORBIT_FACING_RIGHT;

  // Horizontal slide: enter from far left, stop just left-of-center, then exit far right.
  const slideVariants = {
    reset: { x: "-130%", opacity: 0, transition: { duration: 0 } },
    runIn: {
      x: "-8%",
      opacity: 1,
      transition: {
        duration: phaseDurations.runIn / 1000,
        ease: "linear" as const,
        opacity: { duration: 0.3, ease: "easeOut" as const },
      },
    },
    breathe: {
      x: "-8%",
      opacity: 1,
      transition: { duration: 0.2 },
    },
    sprintOut: {
      x: "135%",
      opacity: 1,
      transition: {
        duration: phaseDurations.sprintOut / 1000,
        ease: [0.55, 0, 0.85, 0.4] as const, // accelerate as he takes off
      },
    },
  } as const;

  // Clear breathing — bigger chest rise/fall + slight scale to read at small sizes.
  const breatheVariants = {
    reset: { y: "0%", scale: 1 },
    runIn: { y: "0%", scale: 1 },
    breathe: {
      y: ["0%", "-3.5%", "0%", "-3.5%", "0%"],
      scale: [1, 1.025, 1, 1.025, 1],
      transition: {
        duration: phaseDurations.breathe / 1000,
        ease: "easeInOut" as const,
        times: [0, 0.25, 0.5, 0.75, 1],
      },
    },
    sprintOut: { y: "0%", scale: 1 },
  };

  return (
    <motion.div
      className="h-full w-full will-change-transform"
      initial={{ x: "-130%", opacity: 0 }}
      animate={phase}
      variants={slideVariants}
    >
      <motion.div
        className="h-full w-full will-change-transform"
        animate={phase}
        variants={breatheVariants}
        style={{ transformOrigin: "50% 80%" }}
      >
        <model-viewer
          ref={viewerRef}
          src={djUrl}
          autoplay
          animation-name={animationName}
          animation-crossfade-duration="280"
          exposure="1.15"
          shadow-intensity="0.75"
          camera-orbit={cameraOrbit}
          camera-target="0m 0.9m 0m"
          field-of-view="26deg"
          min-camera-orbit={cameraOrbit}
          max-camera-orbit={cameraOrbit}
          interaction-prompt="none"
          disable-zoom
          loading="eager"
          reveal="auto"
          className="block h-full w-full"
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      </motion.div>
    </motion.div>
  );
};

void AnimatePresence;

export default DjModel;

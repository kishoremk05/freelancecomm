import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import "@google/model-viewer";
import djUrl from "@/assets/dj_music_man.glb?url";

type ModelViewerElement = HTMLElement & {
  play?: () => Promise<void>;
  pause?: () => void;
  updateFraming?: () => void;
  availableAnimations?: string[];
  duration?: number;
  currentTime?: number;
  paused?: boolean;
};

/**
 * Smaller "explorer" version of the DJ model, designed to live alongside a
 * vertical list (e.g. the What We Do / Services section). It walks down the
 * left rail, pauses at each row to "look" at it, then continues — looping.
 *
 * Props let the parent specify how many stops to make so the timing aligns
 * with the row count it lives next to.
 */
type Phase =
  | "enter"   // walk in from above (offscreen top)
  | "stop"    // pause at a row, look at it
  | "walk"    // walk down to the next row
  | "exit"    // walk off the bottom
  | "reset";  // invisible reset above

type Props = {
  /** Number of rows to stop at. Defaults to 6. */
  stops?: number;
  /** Direction the character faces toward the content (right = content on its right). */
  facing?: "right" | "left";
};

const ExplorerModel = ({ stops = 6, facing = "right" }: Props) => {
  const viewerRef = useRef<ModelViewerElement>(null);
  const [phase, setPhase] = useState<Phase>("reset");
  const [stopIndex, setStopIndex] = useState(0);
  const [runDur, setRunDur] = useState(1.0);
  const [idleDur, setIdleDur] = useState(1.0);

  // Read clip durations once so timing matches the GLB
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    let cancelled = false;
    const onLoad = async () => {
      viewer.updateFraming?.();
      void viewer.play?.();
      for (let i = 0; i < 60; i++) {
        if (viewer.availableAnimations?.length) break;
        await new Promise((r) => setTimeout(r, 50));
      }
      if (cancelled) return;
      const names = viewer.availableAnimations ?? [];
      const measure = async (clip: string) => {
        if (!names.includes(clip)) return 1.0;
        viewer.setAttribute("animation-name", clip);
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        const d = viewer.duration;
        return typeof d === "number" && d > 0 ? d : 1.0;
      };
      viewer.pause?.();
      const r = await measure("Run");
      const i = await measure(names.includes("Idle") ? "Idle" : "PickUp");
      if (!cancelled) {
        setRunDur(r);
        setIdleDur(i);
      }
      void viewer.play?.();
    };
    viewer.addEventListener("load", onLoad);
    return () => {
      cancelled = true;
      viewer.removeEventListener("load", onLoad);
    };
  }, []);

  // Kick off
  useEffect(() => {
    const t = setTimeout(() => setPhase("enter"), 80);
    return () => clearTimeout(t);
  }, []);

  // Phase scheduler — orchestrates: enter → (stop → walk) × stops → exit → reset
  useEffect(() => {
    let dur = 600;
    let nextPhase: Phase = phase;
    let advanceStop = false;

    switch (phase) {
      case "enter":
        dur = Math.max(900, runDur * 1000);
        nextPhase = "stop";
        break;
      case "stop":
        dur = Math.max(900, idleDur * 1200);
        nextPhase = "walk";
        break;
      case "walk":
        dur = Math.max(700, runDur * 900);
        // After walking, either stop at next row or exit
        if (stopIndex + 1 >= stops) {
          nextPhase = "exit";
        } else {
          nextPhase = "stop";
          advanceStop = true;
        }
        break;
      case "exit":
        dur = Math.max(900, runDur * 1100);
        nextPhase = "reset";
        break;
      case "reset":
        dur = 80;
        nextPhase = "enter";
        break;
    }

    const t = setTimeout(() => {
      if (phase === "reset") setStopIndex(0);
      else if (advanceStop) setStopIndex((s) => s + 1);
      setPhase(nextPhase);
    }, dur);
    return () => clearTimeout(t);
  }, [phase, runDur, idleDur, stops, stopIndex]);

  // Pick clip for current phase
  const animationName = useMemo(() => {
    switch (phase) {
      case "enter":
      case "walk":
      case "exit":
        return "Run";
      case "stop":
        return "Idle";
      case "reset":
      default:
        return "Run";
    }
  }, [phase]);

  // Vertical position keyed to current stop. Stops are evenly distributed
  // between 8% and 92% of the rail height.
  const stopY = (idx: number) => {
    if (stops <= 1) return 50;
    const top = 8;
    const bottom = 92;
    return top + ((bottom - top) * idx) / (stops - 1);
  };

  // Compute target Y%
  const targetY = useMemo(() => {
    switch (phase) {
      case "enter":
        return `${stopY(0)}%`;
      case "stop":
        return `${stopY(stopIndex)}%`;
      case "walk":
        return `${stopY(Math.min(stopIndex + 1, stops - 1))}%`;
      case "exit":
        return `110%`;
      case "reset":
      default:
        return `-20%`;
    }
  }, [phase, stopIndex, stops]);

  const startY = phase === "reset" ? "-20%" : undefined;

  // Camera azimuth: when "stopped" we turn the model slightly toward the
  // content so it reads as "looking at" the row. When walking we face down
  // the rail (toward travel direction).
  const facingSign = facing === "right" ? -1 : 1;
  const cameraOrbit = useMemo(() => {
    // Walking down → face down. Stopped → face toward content.
    if (phase === "stop") {
      // ~110deg azimuth turns the character to look sideways (toward content)
      return `${facingSign * 90}deg 82deg 130%`;
    }
    // walking — face the travel direction (down the rail)
    return `${facingSign * 35}deg 82deg 130%`;
  }, [phase, facingSign]);

  return (
    <motion.div
      className="absolute left-0 top-0 h-full w-full will-change-transform"
      style={{ pointerEvents: "none" }}
    >
      <motion.div
        className="absolute left-1/2 h-[18%] w-[120%] -translate-x-1/2 will-change-transform"
        initial={{ top: startY ?? "-20%", opacity: 0 }}
        animate={{
          top: targetY,
          opacity: phase === "reset" ? 0 : 1,
        }}
        transition={{
          top: {
            duration:
              phase === "stop"
                ? 0.01
                : phase === "enter"
                ? Math.max(0.9, runDur * 1.0)
                : phase === "walk"
                ? Math.max(0.7, runDur * 0.9)
                : phase === "exit"
                ? Math.max(0.9, runDur * 1.1)
                : 0,
            ease: "linear",
          },
          opacity: { duration: 0.25, ease: "easeOut" },
        }}
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <model-viewer
          ref={viewerRef}
          src={djUrl}
          autoplay
          animation-name={animationName}
          animation-crossfade-duration="200"
          exposure="1.1"
          shadow-intensity="0.6"
          camera-orbit={cameraOrbit}
          camera-target="0m 0.95m 0m"
          field-of-view="22deg"
          min-camera-orbit={cameraOrbit}
          max-camera-orbit={cameraOrbit}
          interaction-prompt="none"
          disable-zoom
          loading="lazy"
          reveal="auto"
          className="block h-full w-full"
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      </motion.div>
    </motion.div>
  );
};

export default ExplorerModel;

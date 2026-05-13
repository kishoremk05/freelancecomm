import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  onDone?: () => void;
}

const STEPS = [10, 30, 50, 70, 100];

const Preloader = ({ onDone }: Props) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let imagesDone = false;

    const waitForImages = async () => {
      await new Promise((r) => setTimeout(r, 50));
      const imgs = Array.from(document.images);
      if (imgs.length === 0) return;
      await Promise.all(
        imgs.map((img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>((res) => {
                img.addEventListener("load", () => res(), { once: true });
                img.addEventListener("error", () => res(), { once: true });
              })
        )
      );
    };

    // Stepped progress (10 → 30 → 50 → 70 → 100)
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      if (i < STEPS.length - 1) {
        setProgress(STEPS[i]);
        i++;
        setTimeout(tick, 280);
      } else if (imagesDone) {
        setProgress(100);
        setTimeout(() => {
          if (cancelled) return;
          setLoading(false);
          onDone?.();
        }, 380);
      } else {
        // Hold at 70 until images ready
        setTimeout(tick, 200);
      }
    };

    const start = async () => {
      tick();
      await waitForImages();
      imagesDone = true;
    };

    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }

    return () => {
      cancelled = true;
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-cream"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display-bold text-3xl text-dark md:text-4xl"
          >
            freelanccomm<span className="text-gold">.in</span>
          </motion.div>

          <div className="mt-8 h-[2px] w-56 overflow-hidden bg-dark/10">
            <motion.div
              className="h-full"
              style={{
                background:
                  "linear-gradient(90deg, hsl(var(--gold-light)), hsl(var(--gold)), hsl(var(--gold-deep)))",
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="mt-3 font-mono-tag text-[10px] tracking-[0.3em] text-dark/55">
            Loading · {progress}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;

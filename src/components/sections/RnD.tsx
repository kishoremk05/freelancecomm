import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Plus, Clock, FileCheck, Rocket } from "lucide-react";
import { revealContainer, revealItem, easePremium } from "@/lib/motion";

const faqs = [
  {
    q: "How do you scope a new project?",
    a: "We start with a free 30-min discovery call, follow up with a written brief, and lock scope, timeline and a fixed price before any work begins.",
  },
  {
    q: "What tech stacks do you work with?",
    a: "React, Next.js, Node, Python, Flutter and React Native on the software side; ESP32, Raspberry Pi, STM32 and custom PCBs on the hardware side. We pick the stack that fits your product, not the other way around.",
  },
  {
    q: "Do you sign NDAs and contracts?",
    a: "Yes — we sign mutual NDAs before deep discussions and a clear SOW with milestones, payment terms and IP transfer for every engagement.",
  },
  {
    q: "Who actually does the work?",
    a: "Our 4-person core collective. No subcontracting to anonymous teams. You meet the people building your product on day one.",
  },
  {
    q: "Do you offer post-launch support?",
    a: "Yes — every project includes 30 days of free bug-fix support, with optional monthly retainers for updates, monitoring and feature work.",
  },
  {
    q: "Can you work with our in-house team?",
    a: "Absolutely. We collaborate over Slack/Linear, do code reviews, and can hand off cleanly with documentation when the engagement ends.",
  },
];

const stages = [
  { icon: FileCheck, label: "Discovery", time: "3 days", desc: "Brief, scope, fixed quote." },
  { icon: Clock, label: "Design", time: "5 days", desc: "Wireframes → high-fidelity UI." },
  { icon: Rocket, label: "Build & Launch", time: "15 days", desc: "Sprints, demos, go-live." },
];

const RnD = () => {
  const [open, setOpen] = useState<number | null>(0);
  
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  
  const wordmarkY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const wordmarkRotate = useTransform(scrollYProgress, [0, 1], [0, 5]);

  return (
    <section
      ref={sectionRef}
      id="rnd"
      className="bg-premium-canvas relative overflow-hidden bg-cream py-28 lg:py-36"
    >
      <motion.div 
        className="bg-canvas-wordmark"
        style={{ y: wordmarkY, rotate: wordmarkRotate }}
      >
        <span>ANSWERS</span>
      </motion.div>

      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative mx-auto max-w-7xl px-6 lg:px-10"
      >
        <motion.div variants={revealItem}>
          <p className="font-mono-tag text-sm text-gold-deep">// FAQ & Delivery</p>
          <h2 className="mt-4 font-display text-5xl leading-[1.02] text-dark sm:text-6xl lg:text-7xl xl:text-8xl">
            Questions, answered.
            <br />
            <span className="text-gold-gradient">Delivery, mapped.</span>
          </h2>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            Everything you need to know before you say go — pricing, process,
            timelines and what happens after launch.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* FAQ */}
          <motion.div variants={revealItem} className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-dark/10 bg-cream shadow-[0_30px_80px_-30px_rgba(20,20,20,0.18)]">
              {faqs.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div key={f.q} className="border-b border-dark/10 last:border-b-0">
                    <button
                      data-cursor-hover
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-cement/40 sm:px-7 sm:py-6"
                    >
                      <span className="font-display-bold text-base text-dark sm:text-lg">
                        {f.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.4, ease: easePremium }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold-deep"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: easePremium }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 font-body text-base leading-relaxed text-muted-foreground sm:px-7">
                            {f.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Delivery details */}
          <motion.div variants={revealItem} className="lg:col-span-5">
            <div className="rounded-2xl border border-dark/10 bg-dark p-7 text-cream shadow-[0_30px_80px_-30px_rgba(20,20,20,0.35)] sm:p-8">
              <p className="font-mono-tag text-xs text-gold">// Delivery Details</p>
              <h3 className="mt-3 font-display-bold text-2xl leading-snug sm:text-3xl">
                A predictable, four-stage timeline.
              </h3>
              <ol className="relative mt-8 space-y-6 border-l border-cream/15 pl-6">
                {stages.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.label} className="relative">
                      <span className="absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full bg-gold text-dark">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="font-display-bold text-base text-cream sm:text-lg">
                          0{i + 1}. {s.label}
                        </div>
                        <div className="font-mono-tag text-[10px] text-gold">
                          {s.time}
                        </div>
                      </div>
                      <p className="mt-1 font-body text-sm text-cream/70">
                        {s.desc}
                      </p>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-cream/10 pt-6">
                <div>
                  <div className="font-mono-tag text-[10px] text-cream/50">
                    Avg. timeline
                  </div>
                  <div className="mt-1 font-display-bold text-lg text-cream">
                    ~23 days
                  </div>
                </div>
                <div>
                  <div className="font-mono-tag text-[10px] text-cream/50">
                    Free support
                  </div>
                  <div className="mt-1 font-display-bold text-lg text-cream">
                    30 days
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default RnD;

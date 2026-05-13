import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { revealContainer, revealItem } from "@/lib/motion";
import ExplorerModel from "@/components/ExplorerModel";
import { ArrowLeft, ArrowRight } from "lucide-react";

const services = [
  {
    num: "01",
    title: "Web Design & Dev",
    desc: "Pixel-perfect, performant websites built for conversion and delight.",
    deliverables: ["Design System", "Next-gen Stack", "Edge Performance", "CMS Integration"],
  },
  {
    num: "02",
    title: "Mobile Apps",
    desc: "Cross-platform apps that feel native and work beautifully.",
    deliverables: ["iOS & Android", "Offline-first", "Push & Realtime", "App Store Launch"],
  },
  {
    num: "03",
    title: "Graphic Designer",
    desc: "Stunning visuals for digital and print — from concept to final artwork.",
    deliverables: ["Logo Design", "UI/UX Assets", "Social Media Graphics", "Print Materials"],
  },
  {
    num: "04",
    title: "Poster Designing",
    desc: "Eye-catching posters and banners that communicate your message instantly.",
    deliverables: ["Event Posters", "Marketing Banners", "Digital Illustrations", "Brand Collateral"],
  },
  {
    num: "05",
    title: "AI Integration",
    desc: "Embedding intelligence into products — chatbots, automations, workflows.",
    deliverables: ["LLM Pipelines", "RAG Systems", "Agent Workflows", "Voice Interfaces"],
  },
  {
    num: "06",
    title: "SEO & Growth",
    desc: "Organic strategies that bring the right eyes to your product.",
    deliverables: ["Tech SEO Audit", "Content Engine", "Schema & Speed", "Analytics Stack"],
  },
  {
    num: "07",
    title: "IoT Development",
    desc: "End-to-end IoT — from sensor firmware to cloud dashboards.",
    deliverables: ["Sensor Firmware", "MQTT/LoRa Stack", "Cloud Dashboards", "OTA Updates"],
  },
  {
    num: "08",
    title: "Hardware Prototyping",
    desc: "PCB design and embedded prototypes ready for pilot production.",
    deliverables: ["PCB Design", "Embedded C/Rust", "3D Enclosures", "Pilot Builds"],
  },
  {
    num: "09",
    title: "Developer Consulting",
    desc: "Architecture reviews, tech stack audits, and team mentoring.",
    deliverables: ["Stack Audits", "Code Reviews", "Hiring Support", "Team Mentoring"],
  },
  {
    num: "10",
    title: "Cloud & DevOps",
    desc: "Infrastructure that scales — CI/CD pipelines and observability built in.",
    deliverables: ["AWS / GCP", "CI/CD Pipelines", "Monitoring", "Cost Optimization"],
  },
  {
    num: "11",
    title: "E-commerce Solutions",
    desc: "High-converting storefronts with payments, inventory, and analytics.",
    deliverables: ["Shopify / Custom", "Payments Setup", "Inventory Sync", "Conversion Tuning"],
  },
  {
    num: "12",
    title: "Maintenance & Support",
    desc: "Long-term partnerships — updates, monitoring, and rapid bug fixes.",
    deliverables: ["24/7 Monitoring", "Security Patches", "Feature Updates", "SLA Support"],
  },
];

const PAGE_SIZE = 6;

const easePremium = [0.16, 1, 0.3, 1] as const;

const Services = () => {
  const [active, setActive] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(services.length / PAGE_SIZE);
  const visible = services.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  
  // Parallax setup
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  
  const wordmarkY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const wordmarkOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  return (
    <section ref={sectionRef} id="services" className="bg-premium-canvas relative overflow-hidden bg-cream py-28 lg:py-36">
      <div className="bg-canvas-wordmark"><span>BUILD</span></div>
      {/* Vertical wordmark accent with parallax */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-6 top-1/2 hidden -translate-y-1/2 select-none lg:block"
        style={{ 
          writingMode: "vertical-rl",
          y: wordmarkY,
          opacity: wordmarkOpacity
        }}
      >
        <span
          className="bg-wordmark"
          style={{ fontSize: "clamp(80px, 9vw, 140px)" }}
        >
          SERVICES
        </span>
      </motion.div>

      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-7xl px-6 lg:px-10"
      >
        <motion.div
          variants={revealItem}
          className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <p className="font-mono-tag text-sm text-gold">// What We Do</p>
            <h2 className="mt-4 font-display text-5xl leading-[1] text-dark sm:text-6xl lg:text-7xl xl:text-8xl">
              Twelve disciplines.
              <br />
              <span className="text-gold-gradient">One studio.</span>
            </h2>
          </div>
          <p className="max-w-[320px] font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            End-to-end hardware and software. Hover any row to expand — six per page.
          </p>
        </motion.div>

        {/* Stacked expanding rows + roaming explorer model */}
        <motion.div
          variants={revealItem}
          className="relative mt-16 border-t border-dark/15"
          onMouseLeave={() => setActive(null)}
        >
          {/* Explorer 3D model — strolls down the left rail and "looks at" each row */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-4 top-0 z-0 hidden h-full w-[180px] md:block"
          >
            <ExplorerModel stops={visible.length} facing="right" />
          </div>
          {visible.map((s, i) => {
            const isActive = active === i;
            return (
              <motion.div
                key={s.num}
                data-cursor-hover
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(isActive ? null : i)}
                className="group relative cursor-none border-b border-dark/15"
                initial={false}
              >
                {/* Animated dark fill */}
                <motion.div
                  aria-hidden
                  className="absolute inset-0 origin-left bg-dark"
                  initial={false}
                  animate={{ scaleX: isActive ? 1 : 0 }}
                  transition={{ duration: 0.7, ease: easePremium }}
                  style={{ transformOrigin: "left" }}
                />

                <div className="relative grid grid-cols-12 items-center gap-4 px-2 py-8 sm:py-11">
                  {/* Number */}
                  <motion.div
                    className="col-span-2 font-mono-tag text-sm"
                    animate={{ color: isActive ? "hsl(var(--gold))" : "hsl(var(--gold))" }}
                  >
                    {s.num}
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    className="col-span-7 font-display-bold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl"
                    animate={{
                      color: isActive ? "hsl(var(--cream))" : "hsl(var(--dark))",
                      x: isActive ? 16 : 0,
                    }}
                    transition={{ duration: 0.6, ease: easePremium }}
                  >
                    {s.title}
                  </motion.h3>

                  {/* Plus / arrow */}
                  <motion.div
                    className="col-span-3 flex items-center justify-end font-mono-tag text-sm"
                    animate={{
                      color: isActive ? "hsl(var(--cream))" : "hsl(var(--dark))",
                    }}
                  >
                    <motion.span
                      animate={{ rotate: isActive ? 45 : 0 }}
                      transition={{ duration: 0.5, ease: easePremium }}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg"
                      style={{ borderColor: "currentColor" }}
                    >
                      +
                    </motion.span>
                  </motion.div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      key="detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: easePremium }}
                      className="relative overflow-hidden"
                    >
                      <div className="grid grid-cols-12 gap-4 px-2 pb-12 pt-2">
                        <div className="col-span-2" />
                        <p className="col-span-12 max-w-xl font-body text-lg leading-relaxed text-cream/80 md:col-span-5">
                          {s.desc}
                        </p>
                        <ul className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-3 md:col-span-5">
                          {s.deliverables.map((d, di) => (
                            <motion.li
                              key={d}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: 0.15 + di * 0.06,
                                duration: 0.5,
                                ease: easePremium,
                              }}
                              className="flex items-center gap-2 font-mono-tag text-xs text-gold"
                            >
                              <span className="h-px w-4 bg-gold" />
                              {d}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Pagination */}
        <motion.div
          variants={revealItem}
          className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <div className="font-mono-tag text-xs text-muted-foreground">
            Page {page + 1} / {totalPages} — showing {visible.length} of {services.length} services
          </div>
          <div className="flex items-center gap-3">
            <button
              data-cursor-hover
              onClick={() => { setActive(null); setPage((p) => (p - 1 + totalPages) % totalPages); }}
              aria-label="Previous services"
              className="flex h-10 w-10 items-center justify-center rounded-full text-dark ring-1 ring-dark/20 transition-colors hover:bg-dark/5"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  data-cursor-hover
                  onClick={() => { setActive(null); setPage(i); }}
                  aria-label={`Page ${i + 1}`}
                  className={`h-[2px] transition-all ${i === page ? "w-8 bg-gold" : "w-4 bg-dark/25 hover:bg-dark/50"}`}
                />
              ))}
            </div>
            <button
              data-cursor-hover
              onClick={() => { setActive(null); setPage((p) => (p + 1) % totalPages); }}
              aria-label="Next services"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-dark transition-colors hover:bg-gold-deep"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Services;

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { revealContainer, revealItem, easePremium } from "@/lib/motion";

const projects = [
  { name: "NestIQ", category: "SaaS Platform", year: "2024", gradient: "from-[#1a2a1a] to-[#2a3d1a]", accent: "#6BA83A", h: "h-72", span: true },
  { name: "Velora UI", category: "Design System", year: "2024", gradient: "from-[#1a1a2e] to-[#2e2e4a]", accent: "#7777DD", h: "h-56" },
  { name: "SpiceRoute", category: "E-commerce", year: "2024", gradient: "from-[#2e1a0e] to-[#4a2e1a]", accent: "#C9A84C", h: "h-56" },
  { name: "PulseHR", category: "Mobile App", year: "2023", gradient: "from-[#0e1a2e] to-[#1a2e4a]", accent: "#3A8AC9", h: "h-56" },
  { name: "SnapMed", category: "Health Tech", year: "2023", gradient: "from-[#2e0e1a] to-[#4a1a2e]", accent: "#C93A5A", h: "h-56" },
];

const Projects = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  
  return (
    <section ref={sectionRef} id="projects" className="bg-dark py-28 lg:py-36">
    <motion.div
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto max-w-7xl px-6 lg:px-10"
    >
      <motion.div variants={revealItem} className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="font-mono-tag text-sm text-gold">// Selected Work</p>
          <h2 className="mt-4 font-display text-5xl leading-[1] text-cream sm:text-6xl lg:text-7xl xl:text-8xl">
            Selected
            <br />
            Projects
          </h2>
        </div>
        <a href="#" data-cursor-hover className="btn-premium">
          View All →
        </a>
      </motion.div>

      <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => {
          // Individual parallax for each card
          const cardY = useTransform(
            scrollYProgress, 
            [0, 0.5, 1], 
            [50 + i * 10, 0, -50 - i * 10]
          );
          
          return (
            <motion.a
              key={p.name}
              href="#"
              variants={revealItem}
              style={{ y: cardY }}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.35, ease: easePremium }}
              data-cursor-hover
              className={`group relative overflow-hidden rounded-2xl ${p.h} ${p.span ? "md:col-span-2" : ""} bg-gradient-to-br ${p.gradient}`}
            >
            {/* Abstract circle */}
            <div
              className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-sm"
              style={{ backgroundColor: p.accent }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-30"
              style={{ borderColor: p.accent }}
            />

            {/* Bottom-left info */}
            <div className="absolute inset-x-6 bottom-6">
              <p className="font-mono-tag text-sm" style={{ color: p.accent }}>
                {p.category} · {p.year}
              </p>
              <h3 className="mt-2 font-display-bold text-3xl text-cream sm:text-4xl">{p.name}</h3>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-dark/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span
                className="border-2 border-cream px-6 py-3 font-display-bold text-base text-cream"
              >
                View Project →
              </span>
            </div>
          </motion.a>
        );
        })}
      </div>
    </motion.div>
  </section>
  );
};

export default Projects;

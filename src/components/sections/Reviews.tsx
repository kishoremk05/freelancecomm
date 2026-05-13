import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { revealContainer, revealItem } from "@/lib/motion";

const reviews = [
  { quote: "FreelancComm turned our rough idea into a product we're genuinely proud of. Shipped in 3 weeks.", name: "Rahul Mehta", co: "Founder, NestIQ" },
  { quote: "The design quality is beyond what we expected. They understood our brand better than we did.", name: "Sneha Iyer", co: "CMO, Velora" },
  { quote: "Incredibly communicative team. No surprises, no delays. Just great work.", name: "Arjun Patel", co: "CTO, SpiceRoute" },
  { quote: "Their AI integration work saved us 30+ hours a week. Absolute game-changer.", name: "Meera Krishnan", co: "CEO, PulseHR" },
  { quote: "Best investment we made in 2024. The site literally doubled our inbound leads.", name: "Karthik R.", co: "Director, SnapMed" },
];

const Star = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-gold">
    <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.1-1.1z" />
  </svg>
);

const Card = ({ r }: { r: typeof reviews[number] }) => (
  <div className="w-[380px] flex-shrink-0 rounded-2xl border border-white/5 bg-darkcard p-8 sm:w-[420px]">
    <div className="mb-5 flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} />
      ))}
    </div>
    <p className="mb-6 font-body text-base leading-relaxed text-cream/80 sm:text-lg">"{r.quote}"</p>
    <div className="font-display-bold text-lg text-cream">{r.name}</div>
    <div className="mt-1 font-mono-tag text-xs text-gold">{r.co}</div>
  </div>
);

const Reviews = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  
  const marqueeX = useTransform(scrollYProgress, [0, 1], [0, -200]);
  
  return (
    <section ref={sectionRef} id="reviews" className="overflow-hidden bg-dark py-28 lg:py-36">
    <motion.div
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto max-w-7xl px-6 lg:px-10"
    >
      <motion.div variants={revealItem}>
        <p className="font-mono-tag text-sm text-gold">// Testimonials</p>
        <h2 className="mt-4 font-display text-5xl leading-[1.02] text-cream sm:text-6xl lg:text-7xl xl:text-8xl">
          What clients
          <br />
          <span className="text-gold-gradient">say about us</span>
        </h2>
      </motion.div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.75, delay: 0.2 }}
      className="mt-16 overflow-hidden"
    >
      <motion.div 
        className="marquee-track flex w-max gap-4"
        style={{ x: marqueeX }}
      >
        {[...reviews, ...reviews].map((r, i) => (
          <Card key={i} r={r} />
        ))}
      </motion.div>
    </motion.div>
  </section>
  );
};

export default Reviews;

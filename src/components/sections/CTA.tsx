import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, Instagram } from "lucide-react";
import { revealContainer, revealItem } from "@/lib/motion";

const EMAIL = "freelancecomm9@gmail.com";

const channels = [
  {
    label: "Email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    icon: <Mail className="h-5 w-5" />,
  },
  {
    label: "WhatsApp",
    value: "Chat on WhatsApp",
    href: "https://wa.me/919999999999",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .15 5.34.15 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.9 11.9 0 0 0 5.76 1.47h.01c6.55 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.44ZM12.07 21.6h-.01a9.7 9.7 0 0 1-4.95-1.36l-.36-.21-3.74.98 1-3.65-.23-.37a9.7 9.7 0 0 1-1.49-5.18c0-5.36 4.36-9.72 9.72-9.72 2.6 0 5.04 1.01 6.88 2.85a9.66 9.66 0 0 1 2.85 6.88c0 5.36-4.36 9.72-9.72 9.72Zm5.34-7.28c-.29-.15-1.73-.86-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.45-.86-.77-1.45-1.71-1.62-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.6-.91-2.18-.24-.57-.49-.5-.66-.51l-.57-.01a1.1 1.1 0 0 0-.8.37c-.27.29-1.05 1.03-1.05 2.51s1.07 2.91 1.22 3.11c.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.73-.71 1.98-1.39.24-.68.24-1.27.17-1.39-.07-.12-.27-.2-.56-.34Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    value: "@freelancecomm",
    href: "https://instagram.com/freelancecomm",
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    label: "X (Twitter)",
    value: "@freelancecomm",
    href: "https://x.com/freelancecomm",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.79l-5.32-6.96L4.8 22H1.54l8.04-9.18L1 2h6.96l4.81 6.36L18.244 2Zm-1.19 18h1.88L7.04 4H5.05l12 16Z" />
      </svg>
    ),
  },
];

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  
  const wordmarkY = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const wordmarkScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.8]);
  
  return (
    <section ref={sectionRef} id="contact" className="relative overflow-hidden bg-cream py-20 sm:py-28 lg:py-40">
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "min(600px, 90vw)",
          height: "min(600px, 90vw)",
          background: "radial-gradient(circle, hsl(var(--gold) / 0.10) 0%, transparent 70%)",
          scale: glowScale,
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center overflow-hidden sm:top-8">
        <motion.div 
          className="bg-wordmark" 
          style={{ 
            fontSize: "clamp(60px, 14vw, 180px)",
            y: wordmarkY,
            scale: wordmarkScale,
          }}
        >
          CONTACT
        </motion.div>
      </div>

    <motion.div
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="relative z-10 mx-auto max-w-5xl px-6 text-center lg:px-10"
    >
      <motion.p variants={revealItem} className="font-mono-tag text-sm text-gold">
        // Contact Us
      </motion.p>
      <motion.h2
        variants={revealItem}
        className="mt-6 font-display leading-[1.05] text-dark"
        style={{ fontSize: "clamp(2rem, 6vw, 4.75rem)" }}
      >
        Let's talk —
        <br />
        on your <span className="text-gold-gradient">channel.</span>
      </motion.h2>
      <motion.p variants={revealItem} className="mx-auto mt-8 max-w-xl font-body text-lg text-muted-foreground lg:text-xl">
        Pick whatever feels easiest. We reply within 24 hours.
      </motion.p>

      <motion.a
        variants={revealItem}
        href={`mailto:${EMAIL}`}
        data-cursor-hover
        className="mt-8 inline-flex items-center gap-3 font-mono text-sm text-dark hover:text-gold-deep sm:text-base"
      >
        <Mail className="h-4 w-4 text-gold" />
        {EMAIL}
      </motion.a>

      <motion.div
        variants={revealItem}
        className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {channels.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            data-cursor-hover
            className="group flex flex-col items-start gap-3 bg-cream p-6 text-left transition-all duration-300 hover:-translate-y-1"
            style={{
              borderLeft: "2px solid hsl(var(--dark) / 0.55)",
              borderBottom: "2px solid hsl(var(--dark) / 0.55)",
              boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.6), 0 6px 14px -8px hsl(var(--dark) / 0.18)",
            }}
          >
            <span
              className="flex h-11 w-11 items-center justify-center bg-gold/15 text-gold-deep transition-colors group-hover:bg-gold/25"
              style={{
                borderLeft: "2px solid hsl(var(--gold))",
                borderBottom: "2px solid hsl(var(--gold))",
              }}
            >
              {c.icon}
            </span>
            <div>
              <div className="font-mono-tag text-[10px] tracking-[0.25em] text-dark/55">
                {c.label}
              </div>
              <div className="mt-1 font-display-bold text-base text-dark transition-colors group-hover:text-gold-deep">
                {c.value}
              </div>
            </div>
          </a>
        ))}
      </motion.div>
    </motion.div>
  </section>
  );
};

export default Contact;

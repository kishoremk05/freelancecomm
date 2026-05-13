import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePreload } from "@/lib/preload-context";

const links = [
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "FAQ", href: "#rnd" },
  { label: "Reviews", href: "#reviews" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const { ready } = usePreload();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1));
    const onScrollSpy = () => {
      const y = window.scrollY + 120;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) current = `#${id}`;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScrollSpy, { passive: true });
    onScrollSpy();
    return () => window.removeEventListener("scroll", onScrollSpy);
  }, []);

  return (
    <motion.header 
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4"
      initial={{ y: -100, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
    >
      <nav
        className="relative flex w-full items-center justify-between border-b border-x-0 border-t-0 border-dark/80 py-4 px-6 lg:px-10 transition-[max-width,background-color,box-shadow,margin,padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          maxWidth: scrolled ? "1280px" : "100%",
          marginTop: scrolled ? "12px" : "0px",
          backgroundColor: scrolled
            ? "hsl(var(--cream) / 0.88)"
            : "hsl(var(--cream) / 0.6)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: scrolled
            ? "0 8px 24px -12px hsl(var(--dark) / 0.2)"
            : "none",
          backgroundImage:
            "radial-gradient(80% 120% at 50% 0%, hsl(var(--gold) / 0.12), transparent 70%)",
        }}
      >
        <a href="#" className="flex items-center gap-2" aria-label="freelanccomm.in">
          <svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M30 25 C30 20, 35 15, 40 15 L85 15 C90 15, 95 20, 95 25 L95 35 C95 40, 90 45, 85 45 L50 45 L50 55 L80 55 C85 55, 90 60, 90 65 L90 75 C90 80, 85 85, 80 85 L50 85 L50 105 L30 105 Z" fill="currentColor" className="text-gold"/>
            <circle cx="65" cy="95" r="8" fill="currentColor" className="text-gold"/>
            <circle cx="90" cy="95" r="6" fill="currentColor" className="text-gold"/>
          </svg>
          <span className="hidden font-display-bold text-lg text-dark sm:inline md:text-xl">
            freelanccomm<span className="text-gold">.in</span>
          </span>
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {links.map((l) => {
            const isActive = active === l.href;
            return (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setActive(l.href)}
                  className={`relative font-body text-[15px] transition-colors duration-300 ${
                    isActive ? "text-dark" : "text-dark/75 hover:text-dark"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1 left-1/2 h-[2px] -translate-x-1/2 bg-gold transition-all duration-300 ${
                      isActive ? "w-5" : "w-0"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <a href="#contact" className="btn-premium !py-2.5 !px-5 !text-sm">
          Contact Us →
        </a>
      </nav>
    </motion.header>
  );
};

export default Navbar;

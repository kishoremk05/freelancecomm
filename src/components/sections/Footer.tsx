const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "R&D", href: "#rnd" },
  { label: "Reviews", href: "#reviews" },
];

const socials = ["TW", "LN", "DR", "GH"];

const Footer = () => (
  <footer className="border-t border-white/5 bg-dark py-14">
    <div className="mx-auto max-w-7xl px-6 lg:px-10">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        <div>
          <a href="#" className="font-display-bold text-2xl text-cream">
            freelanccomm<span className="text-gold">.in</span>
          </a>
          <p className="mt-4 max-w-[280px] font-body text-base text-muted-foreground">
            A premium freelance collective crafting digital experiences from Salem, India.
          </p>
        </div>

        <div>
          <p className="mb-5 font-mono-tag text-sm text-gold">Navigation</p>
          <ul className="space-y-3">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="font-body text-base text-muted-foreground transition-colors duration-200 hover:text-cream"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-5 font-mono-tag text-sm text-gold">Get In Touch</p>
          <ul className="space-y-3">
            <li>
              <a
                href="mailto:freelancecomm9@gmail.com"
                className="font-body text-base text-cream transition-colors duration-200 hover:text-gold"
              >
                freelancecomm9@gmail.com
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-body text-base text-muted-foreground transition-colors duration-200 hover:text-cream"
              >
                freelanccomm.in
              </a>
            </li>
          </ul>
          <div className="mt-6 flex gap-4">
            {socials.map((s) => (
              <a
                key={s}
                href="#"
                className="font-mono-tag text-sm text-muted-foreground transition-colors duration-200 hover:text-gold"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-8 md:flex-row md:items-center">
        <p className="font-mono-tag text-xs text-muted-foreground">
          © 2025 FreelancComm.in — All Rights Reserved
        </p>
        <p className="font-mono-tag text-xs text-muted-foreground">
          Designed with intent. Built with obsession.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;

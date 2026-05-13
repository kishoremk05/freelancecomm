import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import Preloader from "@/components/Preloader";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Projects from "@/components/sections/Projects";
import RnD from "@/components/sections/RnD";
import Reviews from "@/components/sections/Reviews";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";
import AppointmentBot from "@/components/AppointmentBot";
import { PreloadContext } from "@/lib/preload-context";

const Index = () => {
  const [ready, setReady] = useState(false);
  return (
    <PreloadContext.Provider value={{ ready }}>
      <main className="bg-cream">
        <Preloader onDone={() => setReady(true)} />
        <CustomCursor />
        
        {/* Page content with staggered fade-in after preloader */}
        <AnimatePresence>
          {ready && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <Navbar />
              <Hero />
              <About />
              <Services />
              <Projects />
              <RnD />
              <Reviews />
              <CTA />
              <Footer />
              <AppointmentBot />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </PreloadContext.Provider>
  );
};

export default Index;

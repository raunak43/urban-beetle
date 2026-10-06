import Cursor from "@/components/Cursor";
import FocusBlur from "@/components/FocusBlur";
import HeroSequence from "@/components/HeroSequence";
import Marquee from "@/components/Marquee";
import MotionEffects from "@/components/MotionEffects";
import Nav from "@/components/Nav";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";
import Process from "@/components/sections/Process";
import Services from "@/components/sections/Services";
import Statement from "@/components/sections/Statement";
import Testimonials from "@/components/sections/Testimonials";
import Why from "@/components/sections/Why";

const pillarsTicker = ["Strategy", "Creativity", "Technology", "We make brands move"];

export default function Home() {
  return (
    <>
      {/* Order matters: the preloader must subscribe before the hero starts loading frames. */}
      <Preloader />
      <SmoothScroll />
      <Cursor />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <Nav />

      <main id="main">
        <HeroSequence />
        <Statement />
        <Marquee items={pillarsTicker} />
        <Services />
        <Why />
        <About />
        <Process />
        <Testimonials />
        <CTA />
        <Contact />
      </main>

      <Marquee items={pillarsTicker} reverse className="marquee--outline" />
      <Footer />
      <FocusBlur />
      <MotionEffects />
    </>
  );
}

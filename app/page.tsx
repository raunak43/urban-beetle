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
import Faq from "@/components/sections/Faq";
import Footer from "@/components/sections/Footer";
import Process from "@/components/sections/Process";
import Services from "@/components/sections/Services";
import Statement from "@/components/sections/Statement";
import Testimonials from "@/components/sections/Testimonials";
import Why from "@/components/sections/Why";
import { testimonials } from "@/lib/content";

const pillarsTicker = ["Strategy", "Creativity", "Technology", "We make brands move"];

// Section numbers in the eyebrows run on from 05 (Process); Client Voices only appears once there are real
// testimonials, so the sections after it count on from whatever is shown.
const pad = (n: number) => String(n).padStart(2, "0");

export default function Home() {
  const voices = testimonials.length > 0;
  let next = 6;
  const voicesIndex = pad(voices ? next++ : 0);
  const faqIndex = pad(next++);
  const contactIndex = pad(next++);

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
        <Testimonials index={voicesIndex} />
        <Faq index={faqIndex} />
        <CTA />
        <Contact index={contactIndex} />
      </main>

      <Marquee items={pillarsTicker} reverse className="marquee--outline" />
      <Footer />
      <FocusBlur />
      <MotionEffects />
    </>
  );
}

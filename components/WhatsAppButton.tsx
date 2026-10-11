import { external, whatsappHref } from "@/lib/content";
import { glyphs } from "./IconLink";

// Floating "Chat on WhatsApp" button on every page: opens a chat with the studio with a message already
// typed. On phones it shrinks to the icon (the name stays in aria-label).
export default function WhatsAppButton() {
  return (
    <a href={whatsappHref} {...external} className="wa-float" aria-label="Chat on WhatsApp" data-magnetic="0.25">
      <svg className="wa-float__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d={glyphs.WhatsApp} />
      </svg>
      <span className="wa-float__label">Chat on WhatsApp</span>
    </a>
  );
}

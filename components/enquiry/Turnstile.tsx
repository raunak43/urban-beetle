"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { TURNSTILE_ACTION } from "@/lib/enquiry";

// Cloudflare's script must be loaded from this exact address (no copies or proxies).
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | null = null;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing")));
    script.onerror = () => {
      script.remove();
      loading = null; // let a later visit try again
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export type TurnstileHandle = { reset: () => void };

type Props = {
  siteKey: string;
  /** The current token, or null while there isn't a valid one (not done yet, expired or failed). */
  onToken: (token: string | null) => void;
  /** Shown under the widget, e.g. when the visitor submits before the check is done. */
  error?: string | null;
  ref?: Ref<TurnstileHandle>;
};

/**
 * The security check under the enquiry form. Cloudflare usually passes real visitors by itself and asks
 * for a click only when something looks automated. Tokens last five minutes and Cloudflare renews them
 * on its own, so the widget is only loaded as the visitor nears the end of the form.
 */
export default function Turnstile({ siteKey, onToken, error, ref }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useImperativeHandle(ref, () => ({
    // A token works once: after any refused submission, ask Cloudflare for a fresh one.
    reset: () => {
      onTokenRef.current(null);
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    const box = boxRef.current!;
    let cancelled = false;

    const render = () =>
      loadTurnstile().then(
        (turnstile) => {
          if (cancelled || widgetId.current) return;
          widgetId.current = turnstile.render(box, {
            sitekey: siteKey,
            action: TURNSTILE_ACTION,
            theme: "dark",
            size: "flexible",
            "refresh-expired": "auto",
            "response-field": false,
            callback: (token: string) => {
              setFailed(false);
              onTokenRef.current(token);
            },
            "expired-callback": () => onTokenRef.current(null),
            "error-callback": () => {
              onTokenRef.current(null);
              // Returning nothing lets Cloudflare retry; it shows its own message in the widget.
            },
          });
        },
        () => !cancelled && setFailed(true),
      );

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        render();
      },
      { rootMargin: "1000px 0px" },
    );
    observer.observe(box);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  return (
    <div className="eq-turnstile" id="eq-turnstile">
      <p className="eq-label">Security check</p>
      <div ref={boxRef} className="eq-turnstile__box" />
      {failed && (
        <p className="eq-error" role="alert">
          The security check couldn&apos;t load. Please check your internet connection, turn off any content blocker
          for this site, and reload the page.
        </p>
      )}
      {error && !failed && (
        <p className="eq-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

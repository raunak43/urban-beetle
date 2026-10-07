"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BUDGETS,
  DURATIONS,
  EMPTY_ENQUIRY,
  MAX_LENGTH,
  REFERRALS,
  SECTIONS,
  SERVICES,
  START_TIMELINES,
  validateEnquiry,
  type EnquiryInput,
  type Field,
  type FieldErrors,
  type Option,
} from "@/lib/enquiry";
import { phoneHref, site } from "@/lib/content";
import { photoField } from "@/lib/photos";
import PhotoPicker, { usePhotos } from "./PhotoPicker";
import SuccessScreen from "./SuccessScreen";

const DRAFT_KEY = "ub-enquiry-draft";

const LABELS: Record<Field, string> = {
  full_name: "Full name",
  company_name: "Company / brand name",
  email: "Work email",
  phone: "Phone number",
  city: "City / location",
  website: "Website URL",
  social_media: "Instagram / social media",
  services_required: "Services",
  services_other: "Other service",
  business_description: "What your business does",
  project_goals: "What you want to achieve",
  current_challenges: "Biggest challenge",
  target_audience: "Target audience",
  budget: "Budget",
  start_timeline: "Start date",
  project_duration: "Project duration",
  additional_information: "Additional information",
  referral_source: "How you heard about us",
};

const FIELD_ORDER = SECTIONS.flatMap((s) => s.fields);
const pad2 = (n: number) => String(n).padStart(2, "0");

// XMLHttpRequest rather than fetch, so the button can show how much of the photos has uploaded.
function postEnquiry(body: FormData, onProgress?: (fraction: number) => void) {
  return new Promise<{ ok: boolean; data: unknown }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/enquiry");
    xhr.timeout = 180_000;
    if (onProgress) xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let data: unknown = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, data });
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.ontimeout = () => reject(new Error("Timed out"));
    xhr.send(body);
  });
}

export default function EnquiryForm() {
  const [values, setValues] = useState<EnquiryInput>(EMPTY_ENQUIRY);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [serverFieldErrors, setServerFieldErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [confirmationTo, setConfirmationTo] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<number | null>(null);
  const [active, setActive] = useState(SECTIONS[0].id);
  const photos = usePhotos();
  const startedAt = useRef(0);
  const inFlight = useRef(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const restored = useRef(false);

  const errors = useMemo(() => ({ ...validateEnquiry(values), ...serverFieldErrors }), [values, serverFieldErrors]);
  const shown = (f: Field) => ((touched[f] || attempted) && errors[f]) || undefined;

  // Restore an unsent draft (per-browser convenience only).
  useEffect(() => {
    startedAt.current = Date.now();
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setValues({ ...EMPTY_ENQUIRY, ...JSON.parse(saved) });
    } catch {}
    restored.current = true;
  }, []);

  useEffect(() => {
    if (!restored.current || reference) return;
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {}
    }, 400);
    return () => window.clearTimeout(id);
  }, [values, reference]);

  // Section reveal + "you are here" tracking for the progress guide.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".eq-section"));
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            reveal.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id.replace("eq-", ""))),
      { rootMargin: "-35% 0px -60% 0px" },
    );
    sections.forEach((s) => {
      reveal.observe(s);
      spy.observe(s);
    });
    return () => {
      reveal.disconnect();
      spy.disconnect();
    };
  }, []);

  const set = <K extends Field>(key: K, value: EnquiryInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (serverFieldErrors[key])
      setServerFieldErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
  };
  const touch = (key: Field) => setTouched((t) => (t[key] ? t : { ...t, [key]: true }));

  const sectionState = SECTIONS.map((s) => {
    const filled =
      s.id === "photos"
        ? photos.ready.length > 0
        : s.fields.some((f) => {
            const v = values[f];
            return Array.isArray(v) ? v.length > 0 : v.trim() !== "";
          });
    const valid = s.fields.every((f) => !errors[f]);
    return { ...s, done: s.optional ? filled && valid : valid };
  });
  const requiredSections = sectionState.filter((s) => !s.optional);
  const progress = requiredSections.filter((s) => s.done).length / requiredSections.length;
  const activeIndex = Math.max(0, SECTIONS.findIndex((s) => s.id === active));

  const focusField = (field: Field) => {
    const el = document.getElementById(`f-${field}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const target = el.matches("fieldset") ? el.querySelector<HTMLElement>("input") : el;
    target?.focus({ preventScroll: true });
  };

  const goTo = (id: string) =>
    document.getElementById(`eq-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return;
    setAttempted(true);
    setServerError(null);

    const clientErrors = validateEnquiry(values);
    const firstInvalid = FIELD_ORDER.find((f) => clientErrors[f]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }
    if (photos.preparing) {
      setServerError("Your photos are still being prepared. Please wait a moment, then submit again.");
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    try {
      const body = new FormData();
      body.set(
        "data",
        JSON.stringify({
          enquiry: values,
          elapsed_ms: Date.now() - startedAt.current,
          company_website: honeypotRef.current?.value ?? "",
        }),
      );
      for (const { slot, blob } of photos.ready) body.set(photoField(slot), blob, `${slot}.jpg`);
      const res = await postEnquiry(body, photos.ready.length ? setUploaded : undefined);
      const data = res.data as
        | { ok: true; reference: string; confirmationEmail?: boolean }
        | { ok: false; error: string; fieldErrors?: FieldErrors; photoErrors?: Record<string, string> }
        | null;

      // Success is only shown once the server confirms the enquiry is stored.
      if (res.ok && data?.ok) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}
        setConfirmationTo(data.confirmationEmail ? values.email.trim().toLowerCase() : null);
        setReference(data.reference);
        return;
      }
      if (data && !data.ok && data.fieldErrors) {
        setServerFieldErrors(data.fieldErrors);
        const first = FIELD_ORDER.find((f) => data.fieldErrors?.[f]);
        if (first) focusField(first);
      }
      if (data && !data.ok && data.photoErrors) photos.reject(data.photoErrors);
      setServerError(
        (data && !data.ok && data.error) || "Something went wrong while sending your enquiry. Please try again.",
      );
    } catch {
      setServerError("We couldn't reach our servers. Please check your internet connection and try again.");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
      setUploaded(null);
    }
  };

  const missing = attempted ? FIELD_ORDER.filter((f) => errors[f]) : [];
  const text = (field: Field, props: Omit<TextProps, "field" | "value" | "onChange" | "onBlur" | "error">) => (
    <TextInput
      field={field}
      value={values[field] as string}
      onChange={(v) => set(field, v)}
      onBlur={() => touch(field)}
      error={shown(field)}
      {...props}
    />
  );

  return (
    <>
      <section className="eq-hero">
        <p className="eyebrow eq-rise" style={{ "--d": 0 } as React.CSSProperties}>
          <span>(✦)</span> Start a project
        </p>
        <h1 className="eq-hero__title">
          <span className="eq-line">
            <span className="eq-rise" style={{ "--d": 1 } as React.CSSProperties}>
              Let&apos;s build
            </span>
          </span>
          <span className="eq-line">
            <span className="eq-rise" style={{ "--d": 2 } as React.CSSProperties}>
              something that
            </span>
          </span>
          <span className="eq-line">
            <span className="eq-rise gold-text" style={{ "--d": 3 } as React.CSSProperties}>
              moves.
            </span>
          </span>
        </h1>
        <p className="eq-hero__lede eq-rise" style={{ "--d": 4 } as React.CSSProperties}>
          Tell us about your brand, your goals and what you&apos;re looking to build. Our team will review your enquiry
          and get back to you within 24 hours.
        </p>
        <ul className="eq-hero__meta eq-rise" style={{ "--d": 5 } as React.CSSProperties}>
          <li>6 short sections</li>
          <li>About 5 minutes</li>
          <li>Reply within 24 hours</li>
        </ul>
      </section>

      <div className="eq-layout">
        <aside className="eq-guide" aria-label="Form progress">
          <div className="eq-guide__inner">
            <div className="eq-guide__mobile" aria-hidden="true">
              <span>
                {pad2(activeIndex + 1)} / {pad2(SECTIONS.length)}
              </span>
              <span>{SECTIONS[activeIndex].title}</span>
            </div>
            <div className="eq-guide__bar" aria-hidden="true">
              <span style={{ transform: `scaleX(${progress})` }} />
            </div>
            <p className="eq-guide__pct">
              {Math.round(progress * 100)}% complete
            </p>
            <ol className="eq-guide__list">
              {sectionState.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`eq-guide__item${active === s.id ? " is-active" : ""}${s.done ? " is-done" : ""}`}
                    onClick={() => goTo(s.id)}
                    aria-current={active === s.id ? "step" : undefined}
                  >
                    <span className="eq-guide__num">{s.done ? "✓" : pad2(i + 1)}</span>
                    <span className="eq-guide__title">{s.title}</span>
                    {s.optional && <span className="eq-guide__opt">Optional</span>}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <form className="eq-form" onSubmit={onSubmit} noValidate aria-describedby="eq-required-note">
          <p id="eq-required-note" className="eq-note">
            Fields marked <span className="eq-req">*</span> are required.
          </p>

          {/* Honeypot: invisible to people, irresistible to bots. */}
          <div className="eq-hp" aria-hidden="true">
            <label>
              Company website
              <input ref={honeypotRef} type="text" name="company_website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <Section id="about" index={0} title="About you" intro="Who we'll be speaking with.">
            <div className="eq-grid">
              {text("full_name", { label: "Full name", required: true, placeholder: "e.g. Aarav Sharma", autoComplete: "name" })}
              {text("company_name", {
                label: "Company / brand name",
                required: true,
                placeholder: "Your brand or company",
                autoComplete: "organization",
              })}
              {text("email", {
                label: "Work email",
                required: true,
                placeholder: "you@yourbrand.com",
                type: "email",
                inputMode: "email",
                autoComplete: "email",
              })}
              {text("phone", {
                label: "Phone number",
                required: true,
                placeholder: "+91 98765 43210",
                type: "tel",
                inputMode: "tel",
                autoComplete: "tel",
              })}
              {text("city", { label: "City / location", placeholder: "e.g. Mumbai", autoComplete: "address-level2" })}
              {text("website", {
                label: "Website URL",
                optional: true,
                placeholder: "yourbrand.com",
                inputMode: "url",
                autoComplete: "url",
              })}
              {text("social_media", {
                label: "Instagram / social media",
                placeholder: "instagram.com/yourbrand or @yourbrand",
                wide: true,
              })}
            </div>
          </Section>

          <Section id="needs" index={1} title="What do you need?" intro="Select everything you'd like help with.">
            <Choices
              field="services_required"
              legend="Services"
              required
              multiple
              options={SERVICES}
              value={values.services_required}
              onChange={(v) => {
                set("services_required", v as string[]);
                touch("services_required");
              }}
              error={shown("services_required")}
              variant="cards"
            />
            {values.services_required.includes("other") && (
              <div className="eq-reveal">
                {text("services_other", {
                  label: "What else do you need?",
                  required: true,
                  placeholder: "e.g. Packaging design, event branding…",
                  wide: true,
                })}
              </div>
            )}
          </Section>

          <Section id="project" index={2} title="Tell us about your project" intro="The more we know, the sharper our first conversation.">
            <TextArea
              field="business_description"
              label="What does your business / brand do?"
              required
              placeholder="What you sell or offer, who you are, and what makes you different."
              value={values.business_description}
              onChange={(v) => set("business_description", v)}
              onBlur={() => touch("business_description")}
              error={shown("business_description")}
              rows={4}
            />
            <TextArea
              field="project_goals"
              label="What are you looking to achieve?"
              required
              placeholder="More enquiries, a stronger brand, a new website, launching a product…"
              value={values.project_goals}
              onChange={(v) => set("project_goals", v)}
              onBlur={() => touch("project_goals")}
              error={shown("project_goals")}
              rows={4}
            />
            <TextArea
              field="current_challenges"
              label="What is the biggest challenge you're currently facing?"
              placeholder="What's holding the brand back right now?"
              value={values.current_challenges}
              onChange={(v) => set("current_challenges", v)}
              onBlur={() => touch("current_challenges")}
              error={shown("current_challenges")}
              rows={4}
            />
            <TextArea
              field="target_audience"
              label="Who is your target audience?"
              placeholder="Age, location, interests, the kind of customer you want more of…"
              value={values.target_audience}
              onChange={(v) => set("target_audience", v)}
              onBlur={() => touch("target_audience")}
              error={shown("target_audience")}
              rows={3}
            />
          </Section>

          <Section id="details" index={3} title="Project information" intro="Helps us propose the right team and scope.">
            <Choices
              field="budget"
              legend="What is your approximate marketing / project budget?"
              required
              options={BUDGETS}
              value={values.budget}
              onChange={(v) => {
                set("budget", v as string);
                touch("budget");
              }}
              error={shown("budget")}
            />
            <Choices
              field="start_timeline"
              legend="When would you like to start?"
              required
              options={START_TIMELINES}
              value={values.start_timeline}
              onChange={(v) => {
                set("start_timeline", v as string);
                touch("start_timeline");
              }}
              error={shown("start_timeline")}
            />
            <Choices
              field="project_duration"
              legend="How long do you expect the project / engagement to run?"
              required
              options={DURATIONS}
              value={values.project_duration}
              onChange={(v) => {
                set("project_duration", v as string);
                touch("project_duration");
              }}
              error={shown("project_duration")}
            />
          </Section>

          <Section
            id="photos"
            index={4}
            title="Photos of your business"
            intro="Optional, but it helps us picture your space before we talk."
          >
            <PhotoPicker photos={photos.photos} errors={photos.errors} onPick={photos.pick} onRemove={photos.remove} />
          </Section>

          <Section id="extra" index={5} title="Additional information" intro="Optional, but always appreciated.">
            <TextArea
              field="additional_information"
              label="Tell us anything else we should know about your project."
              optional
              placeholder="Deadlines, references you love, competitors, anything else."
              value={values.additional_information}
              onChange={(v) => set("additional_information", v)}
              onBlur={() => touch("additional_information")}
              error={shown("additional_information")}
              rows={4}
            />
            <Choices
              field="referral_source"
              legend="How did you hear about Urban Beetle?"
              optional
              options={REFERRALS}
              value={values.referral_source}
              onChange={(v) => set("referral_source", v as string)}
              error={shown("referral_source")}
              clearable
            />
          </Section>

          <div className="eq-submit">
            {missing.length > 0 && (
              <div className="eq-missing" role="alert">
                <p>
                  Almost there. Please complete {missing.length === 1 ? "this field" : `these ${missing.length} fields`}:
                </p>
                <ul>
                  {missing.map((f) => (
                    <li key={f}>
                      <button type="button" onClick={() => focusField(f)}>
                        {LABELS[f]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {serverError && (
              <div className="eq-alert" role="alert">
                <p className="eq-alert__title">Your enquiry hasn&apos;t been sent yet.</p>
                <p>{serverError}</p>
                <p className="eq-alert__alt">
                  You can try again below, email us at <a href={`mailto:${site.email}`}>{site.email}</a> or call{" "}
                  <a href={phoneHref}>{site.phone}</a>.
                </p>
              </div>
            )}

            <div className="eq-submit__row">
              <button
                type="submit"
                className="btn btn--gold eq-submit__btn"
                disabled={submitting || photos.preparing}
                aria-busy={submitting || photos.preparing}
                data-magnetic="0.2"
              >
                {submitting ? (
                  <span className="eq-submit__label">
                    <span className="eq-spinner" aria-hidden="true" />
                    {uploaded !== null && uploaded < 1
                      ? `Uploading photos… ${Math.round(uploaded * 100)}%`
                      : "Submitting…"}
                  </span>
                ) : photos.preparing ? (
                  <span className="eq-submit__label">
                    <span className="eq-spinner" aria-hidden="true" /> Preparing photos…
                  </span>
                ) : (
                  <span className="eq-submit__label">
                    {serverError ? "Try again" : "Submit enquiry"} <span aria-hidden="true">→</span>
                  </span>
                )}
              </button>
              <p className="eq-submit__note">
                Our team will get back to you within 24 hours. Your details are kept private and used only to respond to
                your enquiry.
              </p>
            </div>
          </div>
        </form>
      </div>

      {reference && <SuccessScreen reference={reference} email={confirmationTo} />}
    </>
  );
}

/* ---------------------------------------------------------------- fields */

function Section({
  id,
  index,
  title,
  intro,
  children,
}: {
  id: string;
  index: number;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section id={`eq-${id}`} className="eq-section" aria-labelledby={`eq-${id}-title`}>
      <header className="eq-section__head">
        <span className="eq-section__num">{pad2(index + 1)}</span>
        <div>
          <h2 id={`eq-${id}-title`} className="eq-section__title">
            {title}
          </h2>
          <p className="eq-section__intro">{intro}</p>
        </div>
      </header>
      <div className="eq-section__body">{children}</div>
    </section>
  );
}

function Label({ field, label, required, optional, as = "label" }: {
  field: Field;
  label: string;
  required?: boolean;
  optional?: boolean;
  as?: "label" | "legend";
}) {
  const content = (
    <>
      {label}
      {required && (
        <span className="eq-req" aria-hidden="true">
          {" "}*
        </span>
      )}
      {optional && <span className="eq-opt">Optional</span>}
    </>
  );
  return as === "legend" ? (
    <legend className="eq-label">{content}</legend>
  ) : (
    <label className="eq-label" htmlFor={`f-${field}`}>
      {content}
    </label>
  );
}

function ErrorText({ field, error }: { field: Field; error?: string }) {
  return (
    <p className="eq-error" id={`e-${field}`}>
      {error}
    </p>
  );
}

type TextProps = {
  field: Field;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  wide?: boolean;
};

function TextInput({ field, label, value, onChange, onBlur, error, required, optional, placeholder, type = "text", inputMode, autoComplete, wide }: TextProps) {
  return (
    <div className={`eq-field${error ? " has-error" : ""}${wide ? " eq-field--wide" : ""}`}>
      <Label field={field} label={label} required={required} optional={optional} />
      <input
        id={`f-${field}`}
        name={field}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        maxLength={MAX_LENGTH[field]}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-required={required || undefined}
        aria-invalid={!!error || undefined}
        aria-describedby={`e-${field}`}
        className="eq-input"
      />
      <ErrorText field={field} error={error} />
    </div>
  );
}

function TextArea({
  field,
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  optional,
  placeholder,
  rows = 4,
}: Omit<TextProps, "type" | "inputMode" | "autoComplete" | "wide"> & { rows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const max = MAX_LENGTH[field] ?? 4000;

  // Grow with the content instead of scrolling inside a tiny box.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);

  return (
    <div className={`eq-field eq-field--wide${error ? " has-error" : ""}`}>
      <Label field={field} label={label} required={required} optional={optional} />
      <textarea
        ref={ref}
        id={`f-${field}`}
        name={field}
        rows={rows}
        placeholder={placeholder}
        value={value}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-required={required || undefined}
        aria-invalid={!!error || undefined}
        aria-describedby={`e-${field}`}
        className="eq-input eq-textarea"
      />
      <div className="eq-field__foot">
        <ErrorText field={field} error={error} />
        <span className={`eq-count${value.length > max * 0.9 ? " is-near" : ""}`} aria-hidden="true">
          {value.length.toLocaleString("en-IN")} / {max.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}

function Choices({
  field,
  legend,
  options,
  value,
  onChange,
  error,
  required,
  optional,
  multiple,
  clearable,
  variant = "pills",
}: {
  field: Field;
  legend: string;
  options: Option[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  error?: string;
  required?: boolean;
  optional?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  variant?: "pills" | "cards";
}) {
  const selected = (v: string) => (Array.isArray(value) ? value.includes(v) : value === v);
  const toggle = (v: string) => {
    if (multiple) {
      const list = value as string[];
      onChange(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
    } else {
      onChange(clearable && value === v ? "" : v);
    }
  };

  return (
    <fieldset
      id={`f-${field}`}
      className={`eq-choices eq-choices--${variant}${error ? " has-error" : ""}`}
      aria-describedby={`e-${field}`}
      aria-invalid={!!error || undefined}
      aria-required={required || undefined}
    >
      <Label field={field} label={legend} required={required} optional={optional} as="legend" />
      {multiple && (
        <p className="eq-choices__count" aria-live="polite">
          {(value as string[]).length ? `${(value as string[]).length} selected` : "Choose one or more"}
        </p>
      )}
      <div className="eq-choices__grid">
        {options.map((o) => (
          <label key={o.value} className={`eq-choice${selected(o.value) ? " is-checked" : ""}`}>
            <input
              type={multiple ? "checkbox" : "radio"}
              name={field}
              value={o.value}
              checked={selected(o.value)}
              onChange={() => toggle(o.value)}
              onClick={(e) => {
                // Lets an optional single choice be un-selected by clicking it again.
                if (!multiple && clearable && value === o.value) {
                  e.preventDefault();
                  toggle(o.value);
                }
              }}
            />
            <span className={`eq-choice__mark eq-choice__mark--${multiple ? "box" : "dot"}`} aria-hidden="true" />
            <span className="eq-choice__label">{o.label}</span>
          </label>
        ))}
      </div>
      <ErrorText field={field} error={error} />
    </fieldset>
  );
}

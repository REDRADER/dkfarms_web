"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Image, { type StaticImageData } from "next/image";
import { ArrowLeft, ArrowRight, Check, Mail, Minus, PawPrint, Pencil, Plus } from "lucide-react";
import { sendEnquiryEmail } from "@/app/contact/actions";
import { enquirySchema, summarize, whatsappText, type Enquiry, type EnquiryOptions, type StayType } from "@/lib/enquiry";
import { waLink } from "@/lib/whatsapp";
import { Icon, WhatsAppIcon, type IconName } from "@/components/icons";
import { track } from "@/components/analytics/Analytics";
import styles from "./EnquiryWizard.module.css";

export type WizardContent = {
  title: string;
  line: string;
  stayTypes: { id: StayType; label: string; icon: IconName }[];
  budgets: { id: string; label: string }[];
  budgetHint: string;
  maxAdults: number;
  maxChildren: number;
  whatsappGreeting: string;
  successTitle: string;
  successLine: string;
};
export type WizardRoom = { id: string; label: string; line: string; image: StaticImageData };
export type WizardPackage = { id: string; label: string; icon: IconName };

type StepId = "type" | "choice" | "when" | "budget" | "details" | "review";
type Draft = Omit<Enquiry, "stayType"> & { stayType?: StayType };
type Errors = Partial<Record<keyof Enquiry, string>>;
type Status = { kind: "idle" } | { kind: "sent"; via: "email" | "whatsapp" } | { kind: "error"; message: string };

const blank: Draft = {
  rooms: [],
  checkIn: "",
  checkOut: "",
  adults: 2,
  children: 0,
  pets: false,
  budget: "",
  name: "",
  phone: "",
  email: "",
  message: "",
};

type WizardProps = {
  content: WizardContent;
  rooms: WizardRoom[];
  packages: WizardPackage[];
  whatsappNumber: string;
};

const noSubscribe = () => () => {};
// Deep links from room and package pages: /contact?room=pool-villa#enquiry
const readPrefill = () => {
  const q = new URLSearchParams(window.location.search);
  return q.get("room") ? `room:${q.get("room")}` : q.get("package") ? `package:${q.get("package")}` : "";
};
const readToday = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/**
 * Step-by-step enquiry: what, which room/package, dates and guests, budget,
 * contact details, then review. The guest chooses to send it on WhatsApp
 * (message prefilled) or by email (server action; no address exposed).
 */
export function EnquiryWizard(props: WizardProps) {
  // The server renders without the URL; the browser re-mounts with any ?room= / ?package= choice applied.
  const prefill = useSyncExternalStore(noSubscribe, readPrefill, () => "");
  return <Wizard key={prefill} prefill={prefill} {...props} />;
}

function Wizard({ content, rooms, packages, whatsappNumber, prefill }: WizardProps & { prefill: string }) {
  const [draft, setDraft] = useState<Draft>(() => {
    const [kind, id] = prefill.split(":");
    if (kind === "room" && rooms.some((r) => r.id === id)) return { ...blank, stayType: "room", rooms: [id] };
    if (kind === "package" && packages.some((p) => p.id === id)) return { ...blank, stayType: "package", packageId: id };
    return blank;
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [sending, startSending] = useTransition();
  const today = useSyncExternalStore(noSubscribe, readToday, () => "");
  const startedAt = useRef(0);
  const company = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const options: EnquiryOptions = {
    stayTypes: content.stayTypes,
    rooms,
    packages,
    budgets: content.budgets,
  };

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const steps: StepId[] = [
    "type",
    ...(draft.stayType === "room" || draft.stayType === "package" ? (["choice"] as const) : []),
    "when",
    "budget",
    "details",
    "review",
  ];
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const picnic = draft.stayType === "day-picnic";

  useEffect(() => {
    const h = heading.current;
    if (!moved.current || !h) return;
    h.focus({ preventScroll: true });
    h.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [stepIndex, status.kind]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function validate(id: StepId): Errors {
    const e: Errors = {};
    if (id === "type" && !draft.stayType) e.stayType = "Choose one to continue";
    if (id === "choice" && draft.stayType === "package" && !draft.packageId) e.packageId = "Pick a package";
    if (id === "when") {
      if (!draft.checkIn) e.checkIn = picnic ? "Pick a date" : "Pick a check-in date";
      else if (today && draft.checkIn < today) e.checkIn = "This date has passed";
      if (!picnic && !draft.checkOut) e.checkOut = "Pick a check-out date";
      else if (!picnic && draft.checkOut && draft.checkIn && draft.checkOut <= draft.checkIn)
        e.checkOut = "Check-out must be after check-in";
    }
    if (id === "budget" && !draft.budget) e.budget = "Pick a range (or Flexible)";
    if (id === "details") {
      const r = enquirySchema.safeParse({ ...toEnquiry(draft), stayType: draft.stayType ?? "not-sure" });
      if (!r.success) {
        for (const issue of r.error.issues) {
          const k = issue.path[0] as keyof Enquiry;
          if (k === "name" || k === "phone" || k === "email") e[k] ??= issue.message;
        }
      }
    }
    return e;
  }

  const goTo = (i: number) => {
    moved.current = true;
    setStepIndex(i);
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length === 0) goTo(stepIndex + 1);
  };

  const enquiry = draft.stayType ? toEnquiry(draft) : null;
  const ready = enquiry ? enquirySchema.safeParse(enquiry).success : false;
  const rows = enquiry && ready ? summarize(enquiry, options) : [];
  const waHref = enquiry && ready ? waLink(whatsappNumber, whatsappText(enquiry, options, content.whatsappGreeting)) : "#";

  const sendEmail = () => {
    if (!enquiry) return;
    startSending(async () => {
      const res = await sendEnquiryEmail(enquiry, {
        startedAt: startedAt.current,
        company: company.current?.value ?? "",
      });
      moved.current = true;
      if (res.ok) {
        track("enquiry_submit", { method: "email", stay_type: enquiry.stayType });
        setStatus({ kind: "sent", via: "email" });
      } else {
        setStatus({ kind: "error", message: res.error });
      }
    });
  };

  const restart = () => {
    setDraft(blank);
    setErrors({});
    setStatus({ kind: "idle" });
    goTo(0);
  };

  /* ---------- Done ---------- */
  if (status.kind === "sent") {
    return (
      <div className={styles.done} role="status">
        <span className="icon-badge" style={{ "--badge": "64px" } as React.CSSProperties}>
          <Check size={30} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h3 ref={heading} tabIndex={-1} className="t-h2-sm">
          {status.via === "email" ? content.successTitle : "WhatsApp is open"}
        </h3>
        <p className="t-muted">
          {status.via === "email"
            ? content.successLine
            : "Your message is ready in WhatsApp. Just tap Send there and we'll reply soon."}
        </p>
        <div className={styles.doneActions}>
          {status.via === "whatsapp" && (
            <a href={waHref} target="_blank" rel="noopener" className="btn" data-wa-source="enquiry">
              <WhatsAppIcon size={18} />
              Open WhatsApp again
            </a>
          )}
          <button type="button" className="btn btn--ghost" onClick={restart}>
            Start a new enquiry
          </button>
        </div>
      </div>
    );
  }

  const title: Record<StepId, string> = {
    type: "What are you planning?",
    choice: draft.stayType === "package" ? "Which package?" : "Which room?",
    when: picnic ? "Which day, and how many?" : "When, and who's coming?",
    budget: "What's your budget?",
    details: "How do we reach you?",
    review: "Check and send",
  };

  return (
    <div className={styles.wizard}>
      <div className={styles.progress}>
        <span>
          Step {stepIndex + 1} of {steps.length}
        </span>
        <span className={styles.bar} aria-hidden="true">
          <i style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
        </span>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step !== "review") next();
        }}
      >
        <fieldset className={styles.step}>
          <legend className="sr-only">{title[step]}</legend>
          <h3 ref={heading} tabIndex={-1} className={`t-h2-sm ${styles.title}`}>
            {title[step]}
          </h3>

          {step === "type" && (
            <div className={styles.choices}>
              {content.stayTypes.map((t) => (
                <label key={t.id} className={styles.choice}>
                  <input
                    type="radio"
                    name="stayType"
                    className="sr-only"
                    checked={draft.stayType === t.id}
                    onChange={() => set("stayType", t.id)}
                  />
                  <span className="icon-badge">
                    <Icon name={t.icon} size={22} />
                  </span>
                  {t.label}
                </label>
              ))}
              <FieldError msg={errors.stayType} />
            </div>
          )}

          {step === "choice" && draft.stayType === "room" && (
            <>
              <p className={styles.hint}>Pick one or more. Leave them all unticked and we&apos;ll suggest one.</p>
              <div className={styles.rooms}>
                {rooms.map((r) => (
                  <label key={r.id} className={styles.room}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={draft.rooms.includes(r.id)}
                      onChange={(e) =>
                        set("rooms", e.target.checked ? [...draft.rooms, r.id] : draft.rooms.filter((x) => x !== r.id))
                      }
                    />
                    <Image src={r.image} alt="" sizes="160px" placeholder="blur" className={styles.roomImg} />
                    <span className={styles.roomText}>
                      <strong>{r.label}</strong>
                      <span>{r.line}</span>
                    </span>
                    <span className={styles.tick} aria-hidden="true">
                      <Check size={16} strokeWidth={2} />
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === "choice" && draft.stayType === "package" && (
            <div className={styles.choices}>
              {packages.map((p) => (
                <label key={p.id} className={styles.choice}>
                  <input
                    type="radio"
                    name="packageId"
                    className="sr-only"
                    checked={draft.packageId === p.id}
                    onChange={() => set("packageId", p.id)}
                  />
                  <span className="icon-badge icon-badge--sand">
                    <Icon name={p.icon} size={22} />
                  </span>
                  {p.label}
                </label>
              ))}
              <FieldError msg={errors.packageId} />
            </div>
          )}

          {step === "when" && (
            <div className={styles.grid2}>
              <label className="field-label">
                {picnic ? "Date" : "Check-in"}
                <input
                  type="date"
                  className="field"
                  min={today || undefined}
                  value={draft.checkIn}
                  aria-invalid={!!errors.checkIn}
                  onChange={(e) => set("checkIn", e.target.value)}
                />
                <FieldError msg={errors.checkIn} />
              </label>
              {!picnic && (
                <label className="field-label">
                  Check-out
                  <input
                    type="date"
                    className="field"
                    min={draft.checkIn || today || undefined}
                    value={draft.checkOut}
                    aria-invalid={!!errors.checkOut}
                    onChange={(e) => set("checkOut", e.target.value)}
                  />
                  <FieldError msg={errors.checkOut} />
                </label>
              )}
              <Stepper
                label="Adults"
                value={draft.adults}
                min={1}
                max={content.maxAdults}
                onChange={(v) => set("adults", v)}
              />
              <Stepper
                label="Children"
                note="Under 12"
                value={draft.children}
                min={0}
                max={content.maxChildren}
                onChange={(v) => set("children", v)}
              />
              <label className={styles.toggle}>
                <input type="checkbox" checked={draft.pets} onChange={(e) => set("pets", e.target.checked)} />
                <PawPrint size={18} strokeWidth={1.5} aria-hidden="true" />
                Bringing a pet
              </label>
            </div>
          )}

          {step === "budget" && (
            <>
              <p className={styles.hint}>{content.budgetHint}</p>
              <div className={styles.chips} role="radiogroup" aria-label="Budget">
                {content.budgets.map((b) => (
                  <label key={b.id} className={styles.chipLabel}>
                    <input
                      type="radio"
                      name="budget"
                      className="sr-only"
                      checked={draft.budget === b.id}
                      onChange={() => set("budget", b.id)}
                    />
                    <span className="chip">{b.label}</span>
                  </label>
                ))}
              </div>
              <FieldError msg={errors.budget} />
            </>
          )}

          {step === "details" && (
            <div className={styles.grid2}>
              <label className="field-label">
                Name
                <input
                  className="field"
                  autoComplete="name"
                  placeholder="Your name"
                  value={draft.name}
                  aria-invalid={!!errors.name}
                  onChange={(e) => set("name", e.target.value)}
                />
                <FieldError msg={errors.name} />
              </label>
              <label className="field-label">
                Phone / WhatsApp
                <input
                  className="field"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+91"
                  value={draft.phone}
                  aria-invalid={!!errors.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                <FieldError msg={errors.phone} />
              </label>
              <label className={`field-label ${styles.full}`}>
                <span>
                  Email <span className={styles.optional}>Optional</span>
                </span>
                <input
                  className="field"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={draft.email}
                  aria-invalid={!!errors.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                <FieldError msg={errors.email} />
              </label>
              <label className={`field-label ${styles.full}`}>
                <span>
                  Anything else? <span className={styles.optional}>Optional</span>
                </span>
                <textarea
                  className="field"
                  rows={3}
                  placeholder="Occasion, food preferences, pick-up…"
                  value={draft.message}
                  onChange={(e) => set("message", e.target.value)}
                />
              </label>
              {/* Honeypot: hidden from people, irresistible to bots */}
              <input ref={company} name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.hp} />
            </div>
          )}

          {step === "review" && (
            <>
              <dl className={styles.review}>
                {rows.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" className={styles.edit} onClick={() => goTo(0)}>
                <Pencil size={14} strokeWidth={1.5} aria-hidden="true" />
                Change something
              </button>

              {status.kind === "error" && (
                <p className={styles.alert} role="alert">
                  {status.message}
                </p>
              )}

              <div className={styles.send}>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener"
                  className="btn btn--lg"
                  data-wa-source="enquiry"
                  aria-disabled={!ready}
                  onClick={(e) => {
                    if (!ready) return e.preventDefault();
                    track("enquiry_submit", { method: "whatsapp", stay_type: draft.stayType });
                    moved.current = true;
                    setStatus({ kind: "sent", via: "whatsapp" });
                  }}
                >
                  <WhatsAppIcon size={20} />
                  Send on WhatsApp
                </a>
                <button
                  type="button"
                  className="btn btn--lg btn--ghost"
                  disabled={!ready || sending}
                  onClick={sendEmail}
                >
                  <Mail size={20} strokeWidth={1.5} aria-hidden="true" />
                  {sending ? "Sending…" : "Send by email"}
                </button>
              </div>
              <p className={styles.fine}>WhatsApp opens with your details typed in; just tap Send.</p>
            </>
          )}
        </fieldset>

        {step !== "review" && (
          <div className={styles.nav}>
            {stepIndex > 0 ? (
              <button type="button" className="btn btn--ghost" onClick={() => goTo(stepIndex - 1)}>
                <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
                Back
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className="btn">
              Next
              <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        )}
        {step === "review" && (
          <div className={styles.nav}>
            <button type="button" className="btn btn--ghost" onClick={() => goTo(stepIndex - 1)}>
              <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
              Back
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function toEnquiry(d: Draft): Enquiry {
  const picnic = d.stayType === "day-picnic";
  return {
    stayType: d.stayType ?? "not-sure",
    rooms: d.stayType === "room" ? d.rooms : [],
    packageId: d.stayType === "package" ? d.packageId : undefined,
    checkIn: d.checkIn,
    checkOut: picnic ? undefined : d.checkOut,
    adults: d.adults,
    children: d.children,
    pets: d.pets,
    budget: d.budget,
    name: d.name.trim(),
    phone: d.phone.trim(),
    email: d.email?.trim() ?? "",
    message: d.message?.trim() ?? "",
  };
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <span className="field-error" role="alert">
      {msg}
    </span>
  );
}

function Stepper({
  label,
  note,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  note?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className={styles.stepper} role="group" aria-label={label}>
      <span className={styles.stepperLabel}>
        {label}
        {note && <span className={styles.optional}>{note}</span>}
      </span>
      <span className={styles.stepperCtrl}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          <Minus size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <output aria-live="polite">{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>
          <Plus size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}

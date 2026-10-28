"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  PRICING DATA                                                       */
/* ------------------------------------------------------------------ */

const CUP_PRICES = { "12oz": 5, "16oz": 7 } as const;
const MINIMUM_CUPS = 50;
const CART_RENTAL = 500;

const PACKAGES = [
  {
    id: "package1",
    name: "Package One",
    cups: 75,
    prices: { "12oz": 875, "16oz": 1025 },
    perks: ["Free customized cup stickers", "Self-serve option"],
  },
  {
    id: "package2",
    name: "Package Two",
    cups: 100,
    prices: { "12oz": 1000, "16oz": 1200 },
    perks: ["Free customized cup stickers", "Free 2-hr barista service"],
  },
];

const SERVICE_TYPES = [
  "Full Service (boba-rista on site)",
  "Self-Serve Cart (DIY)",
  "Cup Catering (drinks delivery only)",
  "By the Gallon",
  "Cart Rental Only (no drinks)",
];

const EVENT_TYPES = [
  "Wedding",
  "Birthday Party",
  "Corporate Event",
  "Community/School Event",
  "Holiday/Seasonal Celebration",
  "Special Occasion",
  "Other",
];

const EVENT_SPACES = ["Indoors", "Outdoors", "Both", "Haven't decided"];

const CUSTOMIZATIONS = [
  { id: "cup-stickers", name: "Cup Stickers", price: 0, note: "Included with packages" },
  { id: "edible-toppers", name: "Edible Drink Toppers", price: 34, note: "50 pieces" },
  { id: "drink-stirrers", name: "Drink Stirrers", price: 30, note: "25 pieces, starting at" },
  { id: "vinyl-sign", name: "Vinyl Sign (front of cart)", price: 55, note: "Starting at" },
  { id: "vinyl-wrap", name: "Vinyl Wrap (75% cart coverage)", price: 100, note: "Starting at" },
  { id: "balloon-garland", name: "Balloon Garland", price: 250, note: "Starting at" },
];

const HOW_HEARD = [
  "Instagram",
  "Google Search",
  "Word of Mouth",
  "Event/Festival",
  "Other",
];

/* ------------------------------------------------------------------ */
/*  TRAVEL RATE CALCULATOR                                             */
/* ------------------------------------------------------------------ */

function calculateTravelFee(miles: number): number {
  if (miles <= 10) return 0;
  if (miles <= 25) return (miles - 10) * 3;
  if (miles <= 40) return (miles - 10) * 3 + 50;
  if (miles <= 60) return (miles - 10) * 3 + 100;
  return -1; // custom quote
}

/* ------------------------------------------------------------------ */
/*  FORM STATE                                                         */
/* ------------------------------------------------------------------ */

interface FormData {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  duration: string;
  serviceType: string;
  eventType: string;
  guestCount: string;
  venue: string;
  eventSpace: string;
  cupSize: "12oz" | "16oz";
  packageChoice: "custom" | "package1" | "package2";
  customCupCount: string;
  baristaHours: string;
  extraHours: string;
  kegSwaps: string;
  parteaJugs: string;
  parteaBundles: string;
  customizations: string[];
  estimatedMiles: string;
  howHeard: string;
  additionalInfo: string;
}

const initialForm: FormData = {
  name: "",
  email: "",
  phone: "",
  eventDate: "",
  duration: "",
  serviceType: "",
  eventType: "",
  guestCount: "",
  venue: "",
  eventSpace: "",
  cupSize: "12oz",
  packageChoice: "custom",
  customCupCount: "",
  baristaHours: "0",
  extraHours: "0",
  kegSwaps: "0",
  parteaJugs: "0",
  parteaBundles: "0",
  customizations: [],
  estimatedMiles: "",
  howHeard: "",
  additionalInfo: "",
};

/* ------------------------------------------------------------------ */
/*  STEPS                                                              */
/* ------------------------------------------------------------------ */

const STEPS = [
  { id: "name", label: "What's your name?", field: "name" },
  { id: "email", label: "What's your email?", field: "email" },
  { id: "phone", label: "What's your phone number?", field: "phone" },
  { id: "eventDate", label: "When is your event?", field: "eventDate" },
  { id: "duration", label: "Duration of service (start & end time)?", field: "duration" },
  { id: "serviceType", label: "What type of service do you need?", field: "serviceType" },
  { id: "eventType", label: "What type of event is this?", field: "eventType" },
  { id: "guestCount", label: "Estimated number of guests?", field: "guestCount" },
  { id: "venue", label: "Event location (venue name or address)?", field: "venue" },
  { id: "eventSpace", label: "Indoor or outdoor event?", field: "eventSpace" },
  { id: "cupSize", label: "What cup size would you like?", field: "cupSize" },
  { id: "package", label: "Choose a package or go custom", field: "packageChoice" },
  { id: "extras", label: "Any add-ons?", field: "extras" },
  { id: "customizations", label: "Branding customizations?", field: "customizations" },
  { id: "travel", label: "How far is your venue from Anaheim?", field: "estimatedMiles" },
  { id: "howHeard", label: "How did you hear about us?", field: "howHeard" },
  { id: "additionalInfo", label: "Anything else we should know?", field: "additionalInfo" },
  { id: "review", label: "Your estimate", field: "review" },
];

/* ------------------------------------------------------------------ */
/*  PRICE CALCULATOR                                                   */
/* ------------------------------------------------------------------ */

function calculatePrice(form: FormData) {
  const items: { label: string; amount: number }[] = [];
  let total = 0;

  const pkg = PACKAGES.find((p) => p.id === form.packageChoice);

  if (pkg) {
    const pkgPrice = pkg.prices[form.cupSize];
    items.push({ label: `${pkg.name} (${pkg.cups} cups, ${form.cupSize})`, amount: pkgPrice });
    total += pkgPrice;
  } else {
    // Custom: cart rental + per-cup
    items.push({ label: "Cart Rental (2hr, setup/breakdown/delivery)", amount: CART_RENTAL });
    total += CART_RENTAL;

    const cups = Math.max(Number(form.customCupCount) || MINIMUM_CUPS, MINIMUM_CUPS);
    const cupTotal = cups * CUP_PRICES[form.cupSize];
    items.push({ label: `${cups} cups x $${CUP_PRICES[form.cupSize]} (${form.cupSize})`, amount: cupTotal });
    total += cupTotal;
  }

  // Barista
  const baristaHrs = Number(form.baristaHours) || 0;
  if (baristaHrs > 0) {
    const baristaCost = baristaHrs * 100;
    items.push({ label: `Barista service (${baristaHrs}hr)`, amount: baristaCost });
    total += baristaCost;
  }

  // Extra hours
  const extraHrs = Number(form.extraHours) || 0;
  if (extraHrs > 0) {
    const extraCost = extraHrs * 100;
    items.push({ label: `Extra rental hours (${extraHrs}hr)`, amount: extraCost });
    total += extraCost;
  }

  // Keg swaps
  const kegs = Number(form.kegSwaps) || 0;
  if (kegs > 0) {
    const kegCost = kegs * 50;
    items.push({ label: `Keg swaps (${kegs})`, amount: kegCost });
    total += kegCost;
  }

  // ParTea Jugs
  const jugs = Number(form.parteaJugs) || 0;
  if (jugs > 0) {
    const jugCost = jugs * 50;
    items.push({ label: `ParTea Jugs (${jugs})`, amount: jugCost });
    total += jugCost;
  }

  const bundles = Number(form.parteaBundles) || 0;
  if (bundles > 0) {
    const bundleCost = bundles * 10;
    items.push({ label: `Add On Bundles (${bundles})`, amount: bundleCost });
    total += bundleCost;
  }

  // Customizations
  form.customizations.forEach((id) => {
    const c = CUSTOMIZATIONS.find((x) => x.id === id);
    if (c && c.price > 0) {
      items.push({ label: c.name, amount: c.price });
      total += c.price;
    }
  });

  // Travel
  const miles = Number(form.estimatedMiles) || 0;
  if (miles > 10) {
    const travelFee = calculateTravelFee(miles);
    if (travelFee > 0) {
      items.push({ label: `Travel fee (~${miles} mi from Anaheim)`, amount: travelFee });
      total += travelFee;
    } else if (travelFee === -1) {
      items.push({ label: "Travel (60+ mi, custom quote needed)", amount: 0 });
    }
  }

  return { items, total };
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function QuotePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentStep = STEPS[step];

  const set = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const next = () => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { items, total } = calculatePrice(form);
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, priceBreakdown: items, total }),
      });
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again or email us at thebevebar@gmail.com");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if current step can proceed
  const canProceed = (): boolean => {
    switch (currentStep.id) {
      case "name": return form.name.trim().length > 0;
      case "email": return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
      case "phone": return form.phone.trim().length >= 7;
      case "eventDate": return form.eventDate.length > 0;
      case "duration": return form.duration.trim().length > 0;
      case "serviceType": return form.serviceType.length > 0;
      case "eventType": return form.eventType.length > 0;
      case "guestCount": return Number(form.guestCount) > 0;
      case "venue": return form.venue.trim().length > 0;
      case "eventSpace": return form.eventSpace.length > 0;
      case "cupSize": return true;
      case "package": return true;
      case "extras": return true;
      case "customizations": return true;
      case "travel": return true;
      case "howHeard": return true;
      case "additionalInfo": return true;
      case "review": return true;
      default: return true;
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">🧋</div>
          <h1 className="font-display text-3xl md:text-4xl mb-4">Quote Sent!</h1>
          <p className="font-body text-base font-light text-black/60 mb-2">
            Check your email for your estimated price breakdown.
          </p>
          <p className="font-body text-sm text-black/40 mb-8">
            Our team will contact you shortly to confirm all the details.
          </p>
          <a href="/" className="btn-primary">Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Progress bar */}
      <div className="fixed top-[60px] left-0 right-0 z-30 h-1 bg-cream-dark">
        <div
          className="h-full bg-black transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          {/* Step counter */}
          <p className="font-body text-xs tracking-[0.2em] uppercase text-black/30 mb-8">
            {step + 1} of {STEPS.length}
          </p>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Question label */}
              <h2 className="font-display text-2xl md:text-3xl mb-8">
                {currentStep.label}
              </h2>

              {/* Step content */}
              {currentStep.id === "name" && (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Full Name"
                  className="quote-input"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && canProceed() && next()}
                />
              )}

              {currentStep.id === "email" && (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@email.com"
                  className="quote-input"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && canProceed() && next()}
                />
              )}

              {currentStep.id === "phone" && (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="(555) 555-5555"
                  className="quote-input"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && canProceed() && next()}
                />
              )}

              {currentStep.id === "eventDate" && (
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => set("eventDate", e.target.value)}
                  className="quote-input"
                  autoFocus
                />
              )}

              {currentStep.id === "duration" && (
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => set("duration", e.target.value)}
                  placeholder="e.g. 2:00 PM - 5:00 PM"
                  className="quote-input"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && canProceed() && next()}
                />
              )}

              {currentStep.id === "serviceType" && (
                <div className="space-y-3">
                  {SERVICE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => { set("serviceType", type); setTimeout(next, 200); }}
                      className={`quote-option ${form.serviceType === type ? "quote-option-selected" : ""}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              {currentStep.id === "eventType" && (
                <div className="space-y-3">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => { set("eventType", type); setTimeout(next, 200); }}
                      className={`quote-option ${form.eventType === type ? "quote-option-selected" : ""}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              {currentStep.id === "guestCount" && (
                <input
                  type="number"
                  value={form.guestCount}
                  onChange={(e) => set("guestCount", e.target.value)}
                  placeholder="Number of guests"
                  className="quote-input"
                  min="1"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && canProceed() && next()}
                />
              )}

              {currentStep.id === "venue" && (
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => set("venue", e.target.value)}
                  placeholder="Venue name or address"
                  className="quote-input"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && canProceed() && next()}
                />
              )}

              {currentStep.id === "eventSpace" && (
                <div className="space-y-3">
                  {EVENT_SPACES.map((space) => (
                    <button
                      key={space}
                      onClick={() => { set("eventSpace", space); setTimeout(next, 200); }}
                      className={`quote-option ${form.eventSpace === space ? "quote-option-selected" : ""}`}
                    >
                      {space}
                    </button>
                  ))}
                </div>
              )}

              {currentStep.id === "cupSize" && (
                <div className="space-y-3">
                  {(["12oz", "16oz"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => { set("cupSize", size); setTimeout(next, 200); }}
                      className={`quote-option ${form.cupSize === size ? "quote-option-selected" : ""}`}
                    >
                      <span className="font-display text-lg">{size}</span>
                      <span className="text-black/40 ml-2">${CUP_PRICES[size]}/cup</span>
                    </button>
                  ))}
                </div>
              )}

              {currentStep.id === "package" && (
                <div className="space-y-4">
                  {PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => { set("packageChoice", pkg.id as "package1" | "package2"); setTimeout(next, 200); }}
                      className={`quote-option text-left ${form.packageChoice === pkg.id ? "quote-option-selected" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-display text-lg">{pkg.name}</span>
                        <span className="font-display text-lg">${pkg.prices[form.cupSize].toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-black/40">{pkg.cups} cups ({form.cupSize})</p>
                      <p className="text-xs text-black/30 mt-1">{pkg.perks.join(" + ")}</p>
                    </button>
                  ))}
                  <button
                    onClick={() => set("packageChoice", "custom")}
                    className={`quote-option text-left ${form.packageChoice === "custom" ? "quote-option-selected" : ""}`}
                  >
                    <span className="font-display text-lg">Custom</span>
                    <p className="text-sm text-black/40 mt-1">Build your own (50 cup minimum)</p>
                  </button>
                  {form.packageChoice === "custom" && (
                    <div className="mt-4">
                      <input
                        type="number"
                        value={form.customCupCount}
                        onChange={(e) => set("customCupCount", e.target.value)}
                        placeholder="Number of cups (min 50)"
                        className="quote-input"
                        min="50"
                      />
                    </div>
                  )}
                </div>
              )}

              {currentStep.id === "extras" && (
                <div className="space-y-6">
                  <div>
                    <label className="quote-label">Barista hours ($100/hr)</label>
                    <p className="text-xs text-black/40 mb-2">Required for 100+ guests. Up to 2 baristas.</p>
                    <select
                      value={form.baristaHours}
                      onChange={(e) => set("baristaHours", e.target.value)}
                      className="quote-input"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((h) => (
                        <option key={h} value={h}>{h} hours{h === 0 ? " (none)" : ""}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="quote-label">Extra rental hours ($100/hr)</label>
                    <select
                      value={form.extraHours}
                      onChange={(e) => set("extraHours", e.target.value)}
                      className="quote-input"
                    >
                      {[0, 1, 2, 3, 4].map((h) => (
                        <option key={h} value={h}>{h} hours{h === 0 ? " (none)" : ""}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="quote-label">Keg swaps ($50/keg, for 300+ cups)</label>
                    <select
                      value={form.kegSwaps}
                      onChange={(e) => set("kegSwaps", e.target.value)}
                      className="quote-input"
                    >
                      {[0, 1, 2, 3, 4, 5].map((k) => (
                        <option key={k} value={k}>{k}{k === 0 ? " (none)" : ""}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="quote-label">ParTea Jugs ($50/gallon)</label>
                    <select
                      value={form.parteaJugs}
                      onChange={(e) => set("parteaJugs", e.target.value)}
                      className="quote-input"
                    >
                      {[0, 1, 2, 3, 4, 5].map((j) => (
                        <option key={j} value={j}>{j}{j === 0 ? " (none)" : ""}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="quote-label">Add On Bundles ($10 each)</label>
                    <select
                      value={form.parteaBundles}
                      onChange={(e) => set("parteaBundles", e.target.value)}
                      className="quote-input"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((b) => (
                        <option key={b} value={b}>{b}{b === 0 ? " (none)" : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {currentStep.id === "customizations" && (
                <div className="space-y-3">
                  {CUSTOMIZATIONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        const curr = form.customizations;
                        set(
                          "customizations",
                          curr.includes(c.id) ? curr.filter((x) => x !== c.id) : [...curr, c.id]
                        );
                      }}
                      className={`quote-option text-left ${form.customizations.includes(c.id) ? "quote-option-selected" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <span>{c.name}</span>
                        <span className="text-black/40 text-sm">
                          {c.price === 0 ? "Free" : `$${c.price}+`}
                        </span>
                      </div>
                      <p className="text-xs text-black/30 mt-1">{c.note}</p>
                    </button>
                  ))}
                  <p className="text-xs text-black/30 mt-2">Select all that apply, or skip to continue</p>
                </div>
              )}

              {currentStep.id === "travel" && (
                <div>
                  <p className="font-body text-sm text-black/50 mb-4">
                    We are based in Anaheim. Travel within 10 miles is complimentary.
                  </p>
                  <input
                    type="number"
                    value={form.estimatedMiles}
                    onChange={(e) => set("estimatedMiles", e.target.value)}
                    placeholder="Estimated miles from Anaheim"
                    className="quote-input"
                    min="0"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && next()}
                  />
                  {Number(form.estimatedMiles) > 60 && (
                    <p className="text-sm text-black/50 mt-3">
                      For venues 60+ miles away, we will provide a custom travel quote.
                    </p>
                  )}
                </div>
              )}

              {currentStep.id === "howHeard" && (
                <div className="space-y-3">
                  {HOW_HEARD.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { set("howHeard", opt); setTimeout(next, 200); }}
                      className={`quote-option ${form.howHeard === opt ? "quote-option-selected" : ""}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentStep.id === "additionalInfo" && (
                <textarea
                  value={form.additionalInfo}
                  onChange={(e) => set("additionalInfo", e.target.value)}
                  placeholder="Theme, special requests, dietary needs, etc."
                  className="quote-input min-h-[120px] resize-y"
                  autoFocus
                />
              )}

              {currentStep.id === "review" && (() => {
                const { items, total } = calculatePrice(form);
                return (
                  <div>
                    <div className="bg-cream-dark/50 rounded-xl p-6 mb-6">
                      <div className="space-y-3 mb-6">
                        {items.map((item, i) => (
                          <div key={i} className="flex justify-between font-body text-sm">
                            <span className="text-black/70">{item.label}</span>
                            <span className="font-medium">
                              {item.amount > 0 ? `$${item.amount.toLocaleString()}` : "TBD"}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-black/10 pt-4 flex justify-between items-baseline">
                        <span className="font-display text-xl">Estimated Total</span>
                        <span className="font-display text-3xl">${total.toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="font-body text-xs text-black/40 mb-6">
                      *This is an estimate. Final pricing may vary based on specific event requirements.
                      A 50% deposit is required to secure your booking. Cancellations made 7+ days in
                      advance receive a full refund.
                    </p>

                    <div className="bg-cream-dark/30 rounded-xl p-4 mb-6">
                      <p className="font-body text-xs text-black/50 mb-2 uppercase tracking-widest">Event Summary</p>
                      <p className="font-body text-sm text-black/70">
                        {form.name} &middot; {form.eventType} &middot; {form.eventDate} &middot; {form.guestCount} guests
                      </p>
                      <p className="font-body text-sm text-black/50">
                        {form.venue} &middot; {form.serviceType}
                      </p>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="btn-primary w-full text-center disabled:opacity-50"
                    >
                      {submitting ? "Sending..." : "Send My Quote"}
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {currentStep.id !== "review" && (
            <div className="flex justify-between items-center mt-12">
              <button
                onClick={prev}
                disabled={step === 0}
                className="font-body text-sm text-black/40 hover:text-black disabled:opacity-20 transition-colors"
              >
                Back
              </button>
              <button
                onClick={next}
                disabled={!canProceed()}
                className="btn-primary disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}

          {currentStep.id === "review" && (
            <div className="mt-6">
              <button
                onClick={prev}
                className="font-body text-sm text-black/40 hover:text-black transition-colors"
              >
                Go back and edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

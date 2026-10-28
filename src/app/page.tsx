"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ScrollFade from "@/components/ScrollFade";

const clientLogos = [
  { src: "/images/client-1.png", alt: "Cypress College" },
  { src: "/images/client-2.png", alt: "Google Fiber" },
  { src: "/images/client-3.png", alt: "Advantech" },
  { src: "/images/client-4.png", alt: "Client" },
];

const scrollTexts = [
  { text: "boba on tap", top: "18%", left: "8%", right: undefined, size: "text-4xl md:text-6xl", italic: true },
  { text: "tapioca on tap", top: "30%", left: undefined, right: "6%", size: "text-lg md:text-2xl", italic: false },
  { text: "for every occasion", top: "55%", left: "5%", right: undefined, size: "text-base md:text-xl", italic: false },
  { text: "weddings", top: "65%", left: undefined, right: "10%", size: "text-sm md:text-base", italic: true },
  { text: "corporate events", top: "72%", left: undefined, right: "15%", size: "text-sm md:text-base", italic: true },
  { text: "celebrations", top: "78%", left: "12%", right: undefined, size: "text-sm md:text-base", italic: true },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const heroHeight = heroRef.current.offsetHeight;
      const progress = Math.min(
        Math.max(-rect.top / (heroHeight - window.innerHeight), 0),
        1
      );
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* === HERO with scroll-fading text === */}
      <section ref={heroRef} className="relative min-h-[250vh]">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          {scrollTexts.map((item, i) => {
            const fadeStart = i * 0.12;
            const fadeEnd = fadeStart + 0.25;
            const opacity =
              scrollProgress < fadeStart
                ? 1
                : scrollProgress > fadeEnd
                ? 0
                : 1 - (scrollProgress - fadeStart) / (fadeEnd - fadeStart);

            return (
              <div
                key={i}
                className={`absolute font-display ${item.size} ${
                  item.italic ? "italic" : ""
                } text-black/80 pointer-events-none hidden md:block`}
                style={{
                  top: item.top,
                  left: item.left,
                  right: item.right,
                  opacity: Math.max(0, opacity),
                  transform: `translateY(${(1 - opacity) * -20}px)`,
                }}
              >
                {item.text}
              </div>
            );
          })}

          {/* Mobile hero text */}
          <div
            className="absolute top-24 left-0 right-0 text-center md:hidden px-6"
            style={{ opacity: 1 - scrollProgress * 3 }}
          >
            <h1 className="font-display text-4xl italic mb-2">boba on tap</h1>
            <p className="font-body text-sm tracking-[0.3em] uppercase text-black/50">
              tapioca on tap
            </p>
          </div>

          {/* Cart image */}
          <div className="relative w-[260px] md:w-[380px] lg:w-[460px] aspect-[975/1800]">
            <Image
              src="/images/cart.png"
              alt="The BeveBar mobile boba cart"
              fill
              className="object-contain"
              priority
            />
            <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[60%]">
              <Image
                src="/images/cart-logo-top.png"
                alt=""
                width={295}
                height={51}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Scroll arrow */}
          <div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce"
            style={{ opacity: Math.max(0, 1 - scrollProgress * 5) }}
          >
            <Image src="/images/arrow.png" alt="" width={36} height={36} className="opacity-40" />
          </div>

          {/* Book Us CTA appears */}
          <div
            className="absolute bottom-28 left-1/2 -translate-x-1/2"
            style={{
              opacity: scrollProgress > 0.6 ? Math.min((scrollProgress - 0.6) * 3, 1) : 0,
              transform: `translateY(${scrollProgress > 0.6 ? 0 : 20}px)`,
              transition: "transform 0.3s ease",
            }}
          >
            <Link href="/quote" className="btn-primary whitespace-nowrap">
              Book Us
            </Link>
          </div>
        </div>
      </section>

      {/* === WHO WE SERVE === */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollFade className="text-center mb-16">
            <p className="section-label mb-4">Who We Serve</p>
            <h2 className="font-display text-3xl md:text-5xl">Trusted by the best</h2>
          </ScrollFade>
          <ScrollFade delay={200}>
            <div className="flex items-center justify-center gap-12 md:gap-20 flex-wrap">
              {clientLogos.map((logo, i) => (
                <div key={i} className="w-24 md:w-32 opacity-40 hover:opacity-70 transition-opacity">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={128}
                    height={64}
                    className="w-full h-auto object-contain grayscale"
                  />
                </div>
              ))}
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* === WHAT'S ON TAP === */}
      <section className="py-24 md:py-32 px-6 bg-cream-dark/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <ScrollFade direction="left">
              <p className="section-label mb-4">Fresh &amp; On Tap</p>
              <h2 className="font-display text-3xl md:text-5xl mb-6">
                What&apos;s on tap?
              </h2>
              <p className="font-body text-base font-light leading-relaxed text-black/60 mb-8">
                From classic milk tea to refreshing fruit blends, our on-tap dispensers serve fresh
                boba drinks right at your event. Each cup crafted with premium ingredients and
                customizable toppings.
              </p>
              <Link href="/menu" className="btn-outline">See Our Menu</Link>
            </ScrollFade>

            <ScrollFade direction="right" delay={200}>
              <div className="relative aspect-[9/16] max-h-[500px] rounded-2xl overflow-hidden shadow-2xl mx-auto w-full max-w-[300px]">
                <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                  <source src="/video/taps.mp4" type="video/mp4" />
                </video>
              </div>
            </ScrollFade>
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollFade className="text-center mb-20">
            <p className="section-label mb-4">How It Works</p>
            <h2 className="font-display text-3xl md:text-5xl">Three simple steps</h2>
          </ScrollFade>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { num: "01", title: "Tell us about your event", desc: "Fill out our quick quote builder with your event details and preferences." },
              { num: "02", title: "We customize your package", desc: "Choose from our menu of drinks, toppings, and add-ons to build your perfect bar." },
              { num: "03", title: "We show up and pour", desc: "Our team arrives, sets up the cart, and serves your guests fresh boba all event long." },
            ].map((step, i) => (
              <ScrollFade key={i} delay={i * 150}>
                <div className="text-center">
                  <span className="font-display text-6xl text-black/10 block mb-4">{step.num}</span>
                  <h3 className="font-display text-xl mb-3">{step.title}</h3>
                  <p className="font-body text-sm font-light text-black/50 leading-relaxed">{step.desc}</p>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* === BOOK CTA === */}
      <section className="py-24 md:py-32 px-6 bg-black text-cream">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollFade>
            <p className="section-label mb-4 !text-cream/40">Ready to book?</p>
            <h2 className="font-display text-3xl md:text-5xl mb-6">
              Let&apos;s make your event unforgettable
            </h2>
            <p className="font-body text-base font-light text-cream/60 mb-10 max-w-lg mx-auto">
              Get an instant estimate for your event. Our team will follow up to finalize all the details.
            </p>
            <Link
              href="/quote"
              className="inline-block px-12 py-4 bg-cream text-black font-body text-sm tracking-[0.15em] uppercase hover:bg-cream-light transition-colors"
            >
              Get Your Quote
            </Link>
          </ScrollFade>
        </div>
      </section>

      {/* === INSTAGRAM FEED === */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <ScrollFade>
            <p className="section-label mb-4">Follow Along</p>
            <h2 className="font-display text-3xl md:text-5xl mb-4">@thebevebar</h2>
            <p className="font-body text-sm font-light text-black/50 mb-12">
              See our latest events and behind-the-scenes moments
            </p>
          </ScrollFade>
          <ScrollFade delay={200}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square bg-cream-dark/50 rounded-lg overflow-hidden group cursor-pointer">
                  <div className="w-full h-full flex items-center justify-center text-black/20 group-hover:text-black/40 transition-colors">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="https://instagram.com/thebevebar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8 btn-outline"
            >
              Follow Us
            </a>
          </ScrollFade>
        </div>
      </section>
    </>
  );
}

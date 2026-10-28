"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/setup", label: "The Set Up" },
  { href: "/locations", label: "Locations" },
  { href: "/quote", label: "Book Us" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-cream/95 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="relative z-10">
            <Image
              src="/images/logo-nav.png"
              alt="The BeveBar"
              width={180}
              height={32}
              className="h-7 w-auto md:h-8"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-xs tracking-[0.2em] uppercase text-black/70 hover:text-black transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative z-10 w-8 h-8 flex flex-col justify-center items-center gap-1.5"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-[1.5px] bg-black transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-[4.5px]" : ""
              }`}
            />
            <span
              className={`block w-6 h-[1.5px] bg-black transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-[1.5px] bg-black transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-[4.5px]" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-cream transition-all duration-500 md:hidden ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-display text-2xl tracking-wide text-black/80 hover:text-black transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-6 flex flex-col items-center gap-3 text-xs tracking-[0.2em] uppercase text-black/40">
            <a
              href="https://instagram.com/thebevebar"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <a href="mailto:thebevebar@gmail.com">Email</a>
          </div>
        </div>
      </div>
    </>
  );
}

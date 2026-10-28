"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
  const [year, setYear] = useState(2026);
  useEffect(() => { setYear(new Date().getFullYear()); }, []);

  return (
    <footer className="bg-black text-cream py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl mb-4">The BeveBar</h3>
            <p className="font-body text-sm font-light text-cream/60 leading-relaxed">
              Premium mobile boba tea cart catering for your special occasions.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-body text-xs tracking-[0.25em] uppercase mb-6 text-cream/40">
              Navigate
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/menu"
                className="font-body text-sm font-light text-cream/70 hover:text-cream transition-colors"
              >
                Menu
              </Link>
              <Link
                href="/setup"
                className="font-body text-sm font-light text-cream/70 hover:text-cream transition-colors"
              >
                The Set Up
              </Link>
              <Link
                href="/locations"
                className="font-body text-sm font-light text-cream/70 hover:text-cream transition-colors"
              >
                Locations
              </Link>
              <Link
                href="/partners"
                className="font-body text-sm font-light text-cream/70 hover:text-cream transition-colors"
              >
                Partner Vendors
              </Link>
            </div>
          </div>

          {/* Book */}
          <div>
            <h4 className="font-body text-xs tracking-[0.25em] uppercase mb-6 text-cream/40">
              Book
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/quote"
                className="font-body text-sm font-light text-cream/70 hover:text-cream transition-colors"
              >
                Get a Quote
              </Link>
              <a
                href="mailto:thebevebar@gmail.com"
                className="font-body text-sm font-light text-cream/70 hover:text-cream transition-colors"
              >
                thebevebar@gmail.com
              </a>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-body text-xs tracking-[0.25em] uppercase mb-6 text-cream/40">
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://instagram.com/thebevebar"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm font-light text-cream/70 hover:text-cream transition-colors"
              >
                @thebevebar
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-cream/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-cream/30">
            &copy; {year} The BeveBar. All rights reserved.
          </p>
          <p className="font-body text-xs text-cream/30">
            Serving Orange County, Los Angeles &amp; San Diego
          </p>
        </div>
      </div>
    </footer>
  );
}

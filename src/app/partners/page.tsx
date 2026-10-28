"use client";

import ScrollFade from "@/components/ScrollFade";

export default function PartnersPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen flex flex-col">
      <section className="px-6 py-16 md:py-24 text-center flex-1 flex flex-col items-center justify-center">
        <ScrollFade>
          <p className="section-label mb-4">Partner Vendors</p>
          <h1 className="font-display text-4xl md:text-6xl mb-6">Coming Soon</h1>
          <p className="font-body text-base font-light text-black/50 max-w-md mx-auto mb-10">
            We are building a network of incredible vendors to help make your events even more
            special. Check back soon to meet our partners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/quote" className="btn-primary">
              Book Us in the Meantime
            </a>
            <a
              href="https://instagram.com/thebevebar"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Follow for Updates
            </a>
          </div>
        </ScrollFade>
      </section>
    </div>
  );
}

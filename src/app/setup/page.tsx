"use client";

import ScrollFade from "@/components/ScrollFade";

const categories = [
  {
    name: "Weddings",
    desc: "Elegant boba bars that complement your special day. Custom vinyl wraps, branded cups, and a beautiful cart setup.",
    count: 6,
  },
  {
    name: "Corporate Events",
    desc: "From team appreciation to product launches, we bring a unique refreshment experience to the office.",
    count: 4,
  },
  {
    name: "Birthday Parties",
    desc: "Make birthdays extra sweet with a boba bar. Perfect for all ages and any party theme.",
    count: 4,
  },
  {
    name: "Community Events",
    desc: "School fundraisers, festivals, and neighborhood block parties. We bring the fun for everyone.",
    count: 4,
  },
  {
    name: "Art of Roam",
    desc: "A lookbook of our cart on the go. See the BeveBar in action at pop-ups, markets, and events across SoCal.",
    count: 6,
  },
];

export default function SetupPage() {
  return (
    <div className="pt-24 pb-20">
      <section className="px-6 py-16 md:py-24 text-center">
        <ScrollFade>
          <p className="section-label mb-4">Lookbook</p>
          <h1 className="font-display text-4xl md:text-6xl mb-4">The Set Up</h1>
          <p className="font-body text-base font-light text-black/50 max-w-lg mx-auto">
            See how The BeveBar transforms events. Every set up is unique, styled to
            match the vibe of your celebration.
          </p>
        </ScrollFade>
      </section>

      {categories.map((cat, ci) => (
        <section
          key={cat.name}
          className={`px-6 py-16 ${ci % 2 === 1 ? "bg-cream-dark/30" : ""}`}
        >
          <div className="max-w-6xl mx-auto">
            <ScrollFade className="mb-10">
              <h2 className="font-display text-2xl md:text-3xl text-center mb-3">
                {cat.name}
              </h2>
              <p className="font-body text-sm font-light text-black/50 text-center max-w-md mx-auto">
                {cat.desc}
              </p>
            </ScrollFade>

            <ScrollFade delay={100}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: cat.count }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-cream-dark/60 rounded-xl overflow-hidden flex items-center justify-center group cursor-pointer"
                  >
                    <div className="text-black/15 group-hover:text-black/25 transition-colors text-center">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                      </svg>
                      <p className="text-xs">Photo</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollFade>
          </div>
        </section>
      ))}

      <section className="px-6 py-20 text-center">
        <ScrollFade>
          <p className="font-body text-base font-light text-black/50 mb-6 max-w-md mx-auto">
            Want your event to look this good? Let's make it happen.
          </p>
          <a href="/quote" className="btn-primary">
            Book Your Event
          </a>
        </ScrollFade>
      </section>
    </div>
  );
}

"use client";

import ScrollFade from "@/components/ScrollFade";

const regions = [
  {
    name: "Orange County",
    cities: [
      "Aliso Viejo", "Anaheim", "Brea", "Buena Park", "Costa Mesa",
      "Cypress", "Dana Point", "Fountain Valley", "Fullerton", "Garden Grove",
      "Huntington Beach", "Irvine", "La Habra", "La Palma", "Laguna Beach",
      "Laguna Hills", "Laguna Niguel", "Laguna Woods", "Lake Forest", "Los Alamitos",
      "Mission Viejo", "Newport Beach", "Orange", "Placentia", "Rancho Santa Margarita",
      "San Clemente", "San Juan Capistrano", "Santa Ana", "Seal Beach", "Stanton",
      "Tustin", "Villa Park", "Westminster", "Yorba Linda",
    ],
  },
  {
    name: "Los Angeles",
    cities: [
      "Alhambra", "Arcadia", "Beverly Hills", "Burbank", "Carson",
      "Cerritos", "Claremont", "Compton", "Covina", "Culver City",
      "Diamond Bar", "Downey", "El Monte", "Glendale", "Glendora",
      "Hawthorne", "Inglewood", "La Mirada", "La Verne", "Lakewood",
      "Long Beach", "Los Angeles", "Malibu", "Manhattan Beach", "Monrovia",
      "Monterey Park", "Norwalk", "Pasadena", "Pomona", "Redondo Beach",
      "Rosemead", "San Dimas", "San Gabriel", "Santa Clarita", "Santa Monica",
      "South Gate", "Temple City", "Torrance", "West Covina", "West Hollywood",
      "Whittier",
    ],
  },
  {
    name: "San Diego",
    cities: [
      "Carlsbad", "Chula Vista", "Coronado", "Del Mar", "El Cajon",
      "Encinitas", "Escondido", "Imperial Beach", "La Mesa", "National City",
      "Oceanside", "Poway", "San Diego", "San Marcos", "Santee",
      "Solana Beach", "Vista",
    ],
  },
];

export default function LocationsPage() {
  return (
    <div className="pt-24 pb-20">
      <section className="px-6 py-16 md:py-24 text-center">
        <ScrollFade>
          <p className="section-label mb-4">Where We Go</p>
          <h1 className="font-display text-4xl md:text-6xl mb-4">Locations Served</h1>
          <p className="font-body text-base font-light text-black/50 max-w-lg mx-auto">
            We bring the cart to you across Southern California. Based in Anaheim, serving
            Orange County, Los Angeles, and San Diego.
          </p>
        </ScrollFade>
      </section>

      {regions.map((region, ri) => (
        <section
          key={region.name}
          className={`px-6 py-16 ${ri % 2 === 1 ? "bg-cream-dark/30" : ""}`}
        >
          <div className="max-w-5xl mx-auto">
            <ScrollFade>
              <h2 className="font-display text-2xl md:text-3xl mb-10 text-center">
                {region.name}
              </h2>
            </ScrollFade>
            <ScrollFade delay={100}>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {region.cities.map((city) => (
                  <span
                    key={city}
                    className="font-body text-sm font-light text-black/50 hover:text-black transition-colors"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </ScrollFade>
          </div>
        </section>
      ))}

      <section className="px-6 py-20 text-center">
        <ScrollFade>
          <p className="font-body text-sm text-black/40 mb-6">
            Don't see your city? We may still be able to come to you.
          </p>
          <a href="/quote" className="btn-primary">
            Get a Quote
          </a>
        </ScrollFade>
      </section>
    </div>
  );
}

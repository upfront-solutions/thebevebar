"use client";

import Image from "next/image";
import ScrollFade from "@/components/ScrollFade";

const coreDrinks = [
  { name: "Classic Milk Tea", desc: "Traditional black milk tea with a rich, creamy finish", emoji: "🧋" },
  { name: "Jasmine Milk Tea", desc: "Fragrant jasmine green tea blended with fresh milk", emoji: "🌸" },
  { name: "Matcha Latte", desc: "Premium ceremonial-grade matcha with creamy milk", emoji: "🍵" },
  { name: "Thai Tea", desc: "Bold Thai-style tea with signature orange hue", emoji: "🧡" },
  { name: "Horchata", desc: "Creamy cinnamon-spiced rice drink", emoji: "🥛" },
  { name: "Vietnamese Coffee", desc: "Strong Vietnamese-style coffee with condensed milk", emoji: "☕" },
  { name: "Lemonade", desc: "Fresh-squeezed lemonade, perfectly balanced", emoji: "🍋" },
  { name: "Arnold Palmer", desc: "Classic half tea, half lemonade blend", emoji: "⛳" },
  { name: "Water", desc: "Refreshing filtered water", emoji: "💧" },
];

const toppings = [
  { name: "Tapioca Boba", color: "bg-amber-900" },
  { name: "Crystal Boba", color: "bg-amber-100" },
  { name: "Lychee Jelly", color: "bg-pink-100" },
  { name: "Mango Jelly", color: "bg-yellow-300" },
  { name: "Strawberry Jelly", color: "bg-red-300" },
  { name: "Coconut Jelly", color: "bg-white" },
  { name: "Egg Pudding", color: "bg-yellow-200" },
  { name: "Red Bean", color: "bg-red-800" },
  { name: "Aloe Vera", color: "bg-green-200" },
];

const parteaJugs = [
  { name: "Full Gallon", price: "$50", desc: "Perfect for large gatherings. Serves approximately 10-12 cups." },
  { name: "Add On Bundle", price: "$10", desc: "32oz topping + 20 12oz cups, lids & straws" },
];

export default function MenuPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <section className="px-6 py-16 md:py-24 text-center">
        <ScrollFade>
          <p className="section-label mb-4">Our Menu</p>
          <h1 className="font-display text-4xl md:text-6xl mb-4">What We Serve</h1>
          <p className="font-body text-base font-light text-black/50 max-w-lg mx-auto">
            Fresh, premium drinks dispensed right from our on-tap cart. Every cup made to order with your choice of toppings.
          </p>
        </ScrollFade>
      </section>

      {/* Core Drinks */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <ScrollFade>
            <h2 className="font-display text-2xl md:text-3xl mb-12 text-center">Core Drinks</h2>
          </ScrollFade>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreDrinks.map((drink, i) => (
              <ScrollFade key={drink.name} delay={i * 50}>
                <div className="menu-card p-6 flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{drink.emoji}</span>
                  <div>
                    <h3 className="font-display text-lg mb-1">{drink.name}</h3>
                    <p className="font-body text-sm font-light text-black/50">{drink.desc}</p>
                  </div>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* Toppings */}
      <section className="px-6 pb-20 bg-cream-dark/30 py-20">
        <div className="max-w-5xl mx-auto">
          <ScrollFade className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl mb-3">Toppings Bar</h2>
            <p className="font-body text-sm font-light text-black/50">
              Mix and match from our selection of 5-8 toppings at every event
            </p>
          </ScrollFade>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {toppings.map((topping, i) => (
              <ScrollFade key={topping.name} delay={i * 30}>
                <div className="text-center">
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 ${topping.color} border border-black/5 shadow-sm`} />
                  <p className="font-body text-xs md:text-sm font-light">{topping.name}</p>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Specials */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollFade>
            <h2 className="font-display text-2xl md:text-3xl mb-4">Seasonal Specials</h2>
            <p className="font-body text-base font-light text-black/50 mb-8">
              We rotate our specialty drinks with the seasons. From Tropical Tango to Strawberry Matcha, there is always something new on tap.
            </p>
            <a
              href="https://www.canva.com/design/DAGf27x2kLk/NxkbJrVdecPrpVfum4utpg/view"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Click Here to See Our Rotating Specials
            </a>
          </ScrollFade>
        </div>
      </section>

      {/* ParTea Jugs */}
      <section className="px-6 py-20 bg-cream-dark/30">
        <div className="max-w-4xl mx-auto">
          <ScrollFade className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl mb-3">ParTea Jugs</h2>
            <p className="font-body text-sm font-light text-black/50">
              Take the party home with our grab-and-go jugs
            </p>
          </ScrollFade>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {parteaJugs.map((jug, i) => (
              <ScrollFade key={jug.name} delay={i * 100}>
                <div className="menu-card p-8 text-center">
                  <h3 className="font-display text-xl mb-2">{jug.name}</h3>
                  <p className="font-display text-3xl mb-3">{jug.price}</p>
                  <p className="font-body text-sm font-light text-black/50">{jug.desc}</p>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Preview */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <ScrollFade className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl mb-3">Packages</h2>
            <p className="font-body text-sm font-light text-black/50">
              We offer packages to make your event planning easy
            </p>
          </ScrollFade>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollFade>
              <div className="menu-card p-8">
                <p className="section-label mb-2">Package One</p>
                <h3 className="font-display text-xl mb-1">75 Cups</h3>
                <p className="font-body text-sm text-black/40 mb-4">Starting at $875</p>
                <ul className="font-body text-sm font-light text-black/60 space-y-2">
                  <li>75 cups included</li>
                  <li>Free customized cup stickers</li>
                  <li>Self-serve option available</li>
                  <li>12oz ($875) or 16oz ($1,025)</li>
                </ul>
              </div>
            </ScrollFade>
            <ScrollFade delay={100}>
              <div className="menu-card p-8 border-2 border-black/10">
                <p className="section-label mb-2">Package Two</p>
                <h3 className="font-display text-xl mb-1">100 Cups</h3>
                <p className="font-body text-sm text-black/40 mb-4">Starting at $1,000</p>
                <ul className="font-body text-sm font-light text-black/60 space-y-2">
                  <li>100 cups included</li>
                  <li>Free customized cup stickers</li>
                  <li>Free 2-hr barista service</li>
                  <li>12oz ($1,000) or 16oz ($1,200)</li>
                </ul>
              </div>
            </ScrollFade>
          </div>

          <ScrollFade delay={200}>
            <div className="text-center mt-12">
              <a href="/quote" className="btn-primary">
                Build Your Custom Quote
              </a>
            </div>
          </ScrollFade>
        </div>
      </section>
    </div>
  );
}

import React from "react";

type ProductCardData = {
  title: string;
  description: string[];
  phase: string;
  liveNow: string;
};

const productCardData: ProductCardData[] = [
  {
    title: "SlushWire",
    description: [
      "✅ The most comprehensive daily insider newsletter.",
      "✅ Tracks agent openings, industry trends, and submission strategies.",
      "✅ No more missed opportunities.",
    ],
    phase: "Phase 1",
    liveNow: "Live Now!",
  },
  {
    title: "LitMatch",
    description: [
      '✅ The largest, most comprehensive agent database (bigger than the "Big Two").',
      "✅ Smart agent ranking & scores agents for your project.",
      "✅ Real, actionable insights – not just another pile of names.",
    ],
    phase: "Phase 2",
    liveNow: "May 2025",
  },
  {
    title: "Submission Magician",
    description: [
      "The ultimate tool to help create, refine, and streamline your query materials so they're agent-ready – no more classes, webinars, books, workshops, email courses.",
    ],
    phase: "Phase 3",
    liveNow: "Coming Soon!",
  },
];

const ProductCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
      {productCardData.map((card) => (
        <div
          key={card.title}
          className="text-white p-8 rounded-xl flex flex-col justify-between h-[400px] md:h-[460px] lg:h-[460px] shadow-lg"
        >
          <div>
            <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
            <ul className="flex flex-col gap-4">
              {card.description.map((description, i) => (
                <span className="text-base flex" key={i}>
                  {description}
                </span>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4">{card.phase}</h3>
            <p>{card.liveNow}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCards;

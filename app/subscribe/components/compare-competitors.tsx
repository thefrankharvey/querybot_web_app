import React from "react";

export const CompareCompetitors = () => {
  const items = [
    [
      "Finding agents",
      "Hours googling, random lists, guesswork",
      "Smart Match delivers ranked, best-fit agents",
    ],
    [
      "Knowing who's open",
      "Check QueryTracker manually, miss windows",
      "Real time alerts the moment agents open",
    ],
    [
      "Staying current",
      "Stale data, discover closures weeks late",
      "3,200+ agents, updated continuously",
    ],
    [
      "Industry news",
      "Scattered across Twitter, blogs, forums",
      "Dispatch feed - one place, always current",
    ],
    [
      "Pitch events",
      "Find out about #PitMad the day after",
      "Notified before every event",
    ],
    [
      "Time spent",
      "5-10+ hours/week on research",
      "Minutes. Then back to writing.",
    ],
    ["Confidence", "Am I missing something?", "I've got this covered."],
  ];

  return (
    <div className="pb-4 w-full md:w-3/4 mx-auto text-left">
      {/* Desktop/tablet view: keep 3 aligned columns */}
      <div className="w-full mx-auto hidden md:block">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-x-8">
          <div className="py-3" />
          <div className="text-center pt-6 pb-0 py-3">
            <label className="font-semibold text-xl">Without Us</label>
          </div>
          <div className="text-center bg-white rounded-t-lg pt-6 pb-0 py-3 shadow-lg border-2 border-accent border-b-0">
            <label className="font-semibold text-xl">With Us</label>
          </div>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <span className="font-semibold text-lg py-6">{item[0]}</span>
              <span className="text-lg py-6 px-4 text-center">{item[1]}</span>
              <span
                className={`text-lg bg-white px-4 py-6 text-center last-of-type:pb-10 shadow-lg border-2 border-accent border-t-0 border-b-0 last-of-type:border-b-2 ${
                  index === items.length - 1 ? "rounded-b-lg border-b" : ""
                }`}
              >
                {item[2]}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile view: single column cards while keeping columns aligned per item */}
      <div className="w-full mx-auto grid gap-4 md:hidden">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white shadow-lg border-2 border-accent rounded-lg overflow-hidden"
          >
            <div className="px-4 py-3 font-semibold text-lg">{item[0]}</div>
            <div className="border-t px-4 py-3">
              <div className="text-base font-semibold text-gray-700">
                With Us
              </div>
              <div className="text-lg mt-1">{item[2]}</div>
            </div>
            <div className="border-t px-4 py-3">
              <div className="text-base font-semibold text-gray-700">
                Without Us
              </div>
              <div className="text-lg mt-1">{item[1]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

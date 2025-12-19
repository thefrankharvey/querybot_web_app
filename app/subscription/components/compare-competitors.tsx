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
      "Real-time alerts the moment agents open",
    ],
    [
      "Staying current",
      "Stale data, discover closures weeks late",
      "3,200+ agents, updated continuously",
    ],
    [
      "Industry news",
      "Scattered across Twitter, blogs, forums",
      "Dispatch feed—one place, always current",
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
      <div className="w-[90%] mx-auto">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-x-8">
          <div className="py-3"></div>
          <div className="text-center pt-6 pb-0 py-3">
            <label className="font-semibold text-lg">Without Us</label>
          </div>
          <div className="text-center bg-white rounded-t-lg pt-6 pb-0 py-3 shadow-lg">
            <label className="font-semibold text-lg">With Us</label>
          </div>
          {items.map((item, index) => (
            <>
              <span key={`${index}-0`} className="font-semibold text-sm py-6">
                {item[0]}
              </span>
              <span key={`${index}-1`} className="text-sm py-6 px-4">
                {item[1]}
              </span>
              <span
                key={`${index}-2`}
                className={`text-sm bg-white px-4 py-6 last-of-type:pb-10 shadow-lg ${
                  index === items.length - 1 ? "rounded-b-lg border-b" : ""
                }`}
              >
                {item[2]}
              </span>
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

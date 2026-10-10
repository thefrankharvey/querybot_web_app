import {
  TRAIT_GROUPS, TRAIT_GROUP_LABELS, negativeBubbles, sameVocabularyScope, statementParagraph,
  type AgentVocabulary, type MatchingContext, type TraitMatches,
} from "@/lib/agent-vocabulary";

export function AgentSubmissionStatus({ vocabulary }: { vocabulary?: AgentVocabulary | null }) {
  const status = vocabulary?.submission_status;
  return <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
    status === "open" ? "border-accent bg-accent text-white" : "border-accent/20 bg-white text-accent"
  }`}>
    {status === "open" ? "Open to Submissions" : status === "closed" ? "Closed to Submissions" : "Unknown Status"}
  </span>;
}

export function AgentVocabularySections({ vocabulary, matches }: {
  vocabulary?: AgentVocabulary | null;
  matches?: TraitMatches | null;
  matchingContext?: MatchingContext;
}) {
  const usableMatches = vocabulary && matches && sameVocabularyScope(vocabulary, matches) ? matches : null;
  const matchedTraits = new Map(TRAIT_GROUPS.flatMap((group) =>
    usableMatches?.groups[group]?.map((trait) => [trait.trait_id, trait] as const) ?? []));
  const interestGroups = ["genres", "subgenres", "themes"] as const;
  const negatives = vocabulary ? negativeBubbles(vocabulary) : [];
  const interestStatement = statementParagraph(vocabulary?.raw_genre_statements ?? []);
  const negativeStatement = statementParagraph([
    ...(vocabulary?.raw_negative_statements ?? []),
    ...(vocabulary?.negative_preferences?.map((preference) => preference.raw_value) ?? []),
    ...(vocabulary?.negative_clauses?.flatMap((clause) =>
      [clause.raw_value, ...(clause.qualifier_text ? [clause.qualifier_text] : [])]) ?? []),
  ]);

  return <>
    {interestGroups.map((group) => {
      const traits = vocabulary?.trait_details[group] ?? [];
      if (group === "themes" && traits.length <= 1) return null;
      return <section key={group} className="flex flex-col gap-3" aria-label={TRAIT_GROUP_LABELS[group]}>
        <h3 className="text-lg font-semibold">{TRAIT_GROUP_LABELS[group]}</h3>
        <div className="flex flex-wrap gap-1">
          {traits.length ? traits.map((trait) => {
            const match = matchedTraits.get(trait.trait_id);
            return <span key={trait.trait_id}
              data-matched={match ? "true" : undefined}
              title={match ? match.match_type === "alias"
                ? `Matches your search. Equivalent to your selection: ${match.selected_values.join(", ")}`
                : "Matches your search" : undefined}
              className={match
                ? "surface-tag border-accent/40 bg-accent/15 px-2 py-1 text-sm font-semibold text-accent"
                : "surface-tag px-2 py-1 text-sm"}>{trait.display_value}</span>;
          }) : <p className="text-sm text-accent/72">{vocabulary ? "No confirmed interests listed." : "Reviewed agent interests are unavailable."}</p>}
        </div>
      </section>;
    })}
    <section className="flex flex-col gap-3" aria-label="Interest Statement">
      <h3 className="text-lg font-semibold">Interest Statement</h3>
      <p className="text-base leading-relaxed text-accent/78">{interestStatement || "Info Unavailable"}</p>
    </section>
    <section className="flex flex-col gap-3" aria-label="Not interested in">
      <h3 className="text-lg font-semibold">Not interested in</h3>
      {negatives.length ? <div className="flex flex-wrap gap-1">
        {negatives.map((negative) => <span key={negative.label}
          data-conditional={negative.conditional ? "true" : undefined}
          title={negative.conditional ? `Conditions apply. ${negative.text}` : negative.text}
          className="surface-tag px-2 py-1 text-sm">{negative.label}</span>)}
      </div> : <p className="text-sm text-accent/72">No exclusions listed.</p>}
      {negativeStatement && <details>
        <summary className="cursor-pointer text-lg font-semibold">More details</summary>
        <p className="mt-3 text-base leading-relaxed text-accent/78">{negativeStatement}</p>
      </details>}
    </section>
  </>;
}

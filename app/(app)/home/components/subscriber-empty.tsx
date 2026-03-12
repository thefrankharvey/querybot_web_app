export default function SubscriberEmpty({ hideCopy }: { hideCopy: boolean }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center text-center">
      <span className="inline-flex items-center rounded-full border border-accent/10 bg-white/82 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/65 shadow-[0_12px_32px_rgba(24,44,69,0.06)] backdrop-blur-sm">
        Subscriber workspace
      </span>
      <h2 className="mt-4 font-serif text-3xl leading-tight text-accent md:text-[38px]">
        Your dashboard is ready for the matches worth tracking.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-accent/76 md:text-base">
        Save strong Smart Match results here and keep every project and submission stage in one place.
      </p>
      {!hideCopy && (
        <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-accent/62">
          Start with Smart Match, then come back here to organize your list.
        </p>
      )}
    </div>
  );
}

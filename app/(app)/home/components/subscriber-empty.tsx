export default function SubscriberEmpty({
  showSmartMatchPrompt,
}: {
  showSmartMatchPrompt: boolean;
}) {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center">
      <h2 className="font-serif text-3xl leading-tight text-accent md:text-[38px]">
        Welcome to Write Query Hook!
      </h2>
      {showSmartMatchPrompt && (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-accent/76 md:text-base">
          Try Smart Match to find the best fit agents for your project.
        </p>
      )}
    </div>
  );
}

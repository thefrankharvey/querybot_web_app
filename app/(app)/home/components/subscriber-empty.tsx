import { Skeleton } from "@/app/ui-primitives/skeleton";

export default function SubscriberEmpty({
  showSmartMatchPrompt,
  isLoading = false,
}: {
  showSmartMatchPrompt: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center">
      <div className="relative" aria-hidden={isLoading || undefined}>
        <h2 className="font-serif text-3xl leading-tight text-accent md:text-[38px]">
          <span className={isLoading ? "invisible" : undefined}>
            Welcome to Write Query Hook!
          </span>
        </h2>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton variant="muted" className="h-8 w-[90%] rounded-lg md:h-10" />
          </div>
        )}
      </div>
      {showSmartMatchPrompt && !isLoading && (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-accent/76 md:text-base">
          Try Smart Match to find the best fit agents for your project.
        </p>
      )}
    </div>
  );
}

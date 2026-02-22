export default function SubscriberEmpty({ hideCopy }: { hideCopy: boolean }) {
  return (
    <div className="text-center space-y-6 max-auto flex flex-col justify-center items-center">
      <h1 className="text-lg md:text-3xl font-bold text-gray-900">
        Welcome Write Query Hook Subscriber!
      </h1>
      {!hideCopy && (
        <p className="text-sm md:text-base text-gray-600 font-semibold">
          Start by finding your perfect agent matches with Smart Match!
        </p>
      )}
    </div>
  );
}

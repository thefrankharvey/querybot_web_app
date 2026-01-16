import ButtonBar from "./button-bar";

export default function SubscriberEmpty() {
  return (
    <div className="text-center space-y-6 max-auto h-[500px] flex flex-col justify-center items-center">
      <h1 className="text-lg md:text-3xl font-bold text-gray-900">
        Welcome Write Query Hook Subscriber!
      </h1>
      <p className="text-sm md:text-base text-gray-600 font-semibold">
        Start by finding your perfect agent matches with Smart Match!
      </p>
      <div className="flex flex-col gap-4 items-center justify-center mt-4">
        <ButtonBar />
      </div>
    </div>
  );
}

import { Button } from "../ui-primitives/button";

const KitEmailBar = () => {
  return (
    <div className="w-full max-w-3xl px-8 py-2">
      <h1 className="text-2xl text-white font-semibold md:text-right text-left">
        Get our free newsletter
      </h1>
      <p className="text-xs text-white md:text-right mb-4 text-left">
        We never spam. Easily unsubscribe.
      </p>
      <form
        action="https://app.kit.com/forms/7877029/subscriptions"
        method="post"
        className="flex flex-col gap-3 items-end w-full"
      >
        <input
          type="email"
          name="email_address"
          placeholder="Email Address"
          required
          className="flex-1 md:w-[350px] w-full px-4 py-3 border-b-2 text-white border-gray-400 focus:outline-none focus:border-white transition-colors hover:border-white hover:cursor-pointer"
        />
        <Button type="submit" variant={"secondary"} size="lg">
          Subscribe
        </Button>
      </form>
    </div>
  );
};

export default KitEmailBar;

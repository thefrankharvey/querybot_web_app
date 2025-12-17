const KitBar = () => {
  return (
    <div className="w-full max-w-3xl px-8 py-2">
      <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
        Get our free newsletter.
      </h3>
      <form
        action="https://app.kit.com/forms/7877029/subscriptions"
        method="post"
        className="flex flex-col sm:flex-row gap-3 items-center"
      >
        <input
          type="email"
          name="email_address"
          placeholder="Email Address"
          required
          className="flex-1 w-full sm:w-auto px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:border-[#1b4a56] transition-colors"
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-[#1b4a56] text-white text-xl rounded-lg font-semibold hover:bg-[#153a44] transition-colors whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-3 text-center">
        We never spam. Easily unsubscribe.
      </p>
    </div>
  );
};

export default KitBar;
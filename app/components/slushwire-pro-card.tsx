import { Button } from "../ui-primitives/button";

const SlushwireProCard = () => {
  return (
    <div>
      <div className="bg-dark rounded-tl-[20px] rounded-tr-[20px] p-4 h-[500px] sm:w-[90%] md:w-[60%] lg:w-[55%] mx-auto">
        <h1 className="text-4xl font-extrabold text-white py-6 pb-9 text-center">
          SLUSHWIRE PRO
        </h1>
        <div className="bg-white rounded-xl p-4 w-full h-[400px] text-center">
          <h3 className="text-2xl pt-8">
            Get the real-time industry updates I wish I had when querying and
            never miss an opportunity.
          </h3>
          <div className="flex flex-col justify-center items-center py-10">
            <span className="text-[65px] font-extrabold leading-none flex items-center">
              <span className="text-4xl">$</span>14
            </span>
            <span className="text-base">monthly</span>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 sm:w-[90%] md:w-[60%] lg:w-[55%] mx-auto rounded-bl-[20px] rounded-br-[20px]">
        <ul className="list-disc space-y-4 text-lg overflow-y-auto h-full py-4 w-[85%] mx-auto mt-[-120px]">
          <div>
            <span className="text-xl font-semibold">
              <span className="mr-1">✅</span>Your Secret Weapon
            </span>
            <li>- Get daily real-time updates from top industry sources</li>
          </div>

          <div>
            <span className="text-xl font-semibold">
              <span className="mr-1">✅</span>Unmissable Industry Threads
            </span>
            <li>
              - The top agent AMAs, real guidance, success stories, and insider
              analysis
            </li>
          </div>

          <div>
            <span className="text-xl font-semibold">
              <span className="mr-1">✅</span>Move at the Speed of Opportunity
            </span>
            <li>- Catch and seize opportunities as they arise</li>
          </div>

          <div>
            <span className="text-xl font-semibold">
              <span className="mr-1">✅</span>Query at the Perfect Moment
            </span>
            <li>- We track agent openings and alert you first</li>
          </div>

          <div>
            <span className="text-xl font-semibold">
              <span className="mr-1">✅</span>Recently Active Agents
            </span>
            <li>
              - Know who&apos;s actively seeking queries so you pitch at the
              right time
            </li>
          </div>

          <div>
            <span className="text-xl font-semibold">
              <span className="mr-1">✅</span>Unlock Submission Strategies
            </span>
            <li>
              - Proven tips & tactics for crafting pitches, synopses, and
              queries that hook
            </li>
          </div>

          <div>
            <span className="text-xl font-semibold">
              <span className="mr-1">✅</span>Monitor Multiple Platforms
            </span>
            <li>
              - Essential updates from across social media and professional
              platforms
            </li>
          </div>

          <div>
            <span className="text-xl font-semibold">
              <span className="mr-1">✅</span>Get Early Access
            </span>
            <li>
              - You are first in line for the web&apos;s most comprehensive,
              smart agent database - launching April
            </li>
          </div>
        </ul>
        <div className="flex justify-center items-center flex-col gap-4 pt-18 pb-10">
          <a
            href="https://subscribe.writequeryhook.com/products/slush-wire-pro-direct?step=checkout&_gl=1*1o0mzku*_ga*MTczNjM3NTEyMC4xNzQ2MjEwNTg0*_ga_4C1NS70GTD*czE3NDY0ODEyMTAkbzckZzAkdDE3NDY0ODEyMTAkajAkbDAkaDA."
            target="_blank"
          >
            <Button className="cursor-pointer text-xl p-8 font-semibold">
              GET ALERTS
            </Button>
          </a>
          <span className="text-base">
            No Spam. Just Inbox Intel. Easy Cancel Anytime.
          </span>
        </div>
      </div>
    </div>
  );
};

export default SlushwireProCard;

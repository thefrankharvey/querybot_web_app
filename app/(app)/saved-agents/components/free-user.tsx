import { Check } from "lucide-react";
import ButtonBar from "./button-bar";

export default function FreeUser() {
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
        Welcome to Write Query Hook!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-3xl mt-10">
        {/* Free Tier Column */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold bg-white text-black border border-gray-200 rounded-3xl px-2 py-1 text-center">
            Free
          </h2>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-black flex-shrink-0" />
              <span className="text-black">Slushwire weekly newsletter</span>
            </li>
            {/* <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-black flex-shrink-0" />
              <span className="text-black">Submission Tracker</span>
            </li> */}
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-black flex-shrink-0" />
              <span className="text-black">Blog</span>
            </li>
          </ul>
        </div>

        {/* Subscriber Column */}
        <div className="flex flex-col gap-3">
          <a href="/subscribe">
            <h2 className="text-xl font-semibold bg-accent text-white border border-accent rounded-3xl px-2 py-1 text-center">
              Subscriber
            </h2>
          </a>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-black flex-shrink-0" />
              <span className="text-black">Slushwire weekly newsletter</span>
            </li>
            {/* <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-black flex-shrink-0" />
              <span className="text-black">
                Submission Tracker with full agent results
              </span>
            </li> */}
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-black flex-shrink-0" />
              <span className="text-black">Blog</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-black flex-shrink-0" />
              <span className="text-black">Full Agent Match results</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-black flex-shrink-0" />
              <span className="text-black">Dispatch news feed</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center justify-center mt-12">
        <ButtonBar />
      </div>
    </>
  );
}

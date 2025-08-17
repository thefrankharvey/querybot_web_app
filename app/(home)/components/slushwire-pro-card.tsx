import { Button } from "@/app/ui-primitives/button";
import { SignUpButton } from "@clerk/nextjs";
import { DatabaseZap, MailCheck, Newspaper, ScanSearch } from "lucide-react";
import Link from "next/link";

export const SlushwireProCard = () => {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <Link
        href="/subscription"
        className="rounded-xl w-full md:w-[50%] shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
      >
        <div className="bg-white rounded-xl w-full">
          <div className="flex justify-center items-center bg-accent rounded-t-xl p-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-center">
              SLUSHWIRE PRO $14
            </h1>
          </div>
          <div className="pt-8 pb-4 px-8">
            <p className="text-lg text-black text-center">
              One monthly subscription gets you access to all our tools!
            </p>
          </div>
          <div
            className="flex flex-col gap-4 bg-white rounded-xl px-4 md:px-8 pb-8 shadow-lg"
            id="content"
          >
            <p className="text-xl font-normal mt-4 flex items-center gap-3">
              <ScanSearch className="w-14 h-14" />{" "}
              <span>
                <span className="font-semibold">Smart Match</span>, finds agents
                tailored specifically to your work.
              </span>
            </p>
            <p className="text-xl font-normal mt-4 flex items-center gap-3">
              <Newspaper className="w-12 h-12" />
              <span>
                <span className="font-semibold">Slushwire Dispatch</span>,
                provides a real time industry news feed.
              </span>
            </p>
            <p className="text-xl font-normal mt-4 flex items-center gap-3">
              <DatabaseZap className="w-12 h-12" /> The largest data base of
              literary agents in the industry.
            </p>
            <p className="text-xl font-normal mt-4 flex items-center gap-3">
              <MailCheck className="w-12 h-12" /> Weekly email newsletter of
              curated industry intel.
            </p>

            <Button className="cursor-pointer text-xl w-fit p-8 font-semibold mt-4 hover:border-accent border-2 border-transparent shadow-lg hover:shadow-xl mx-auto">
              GET SLUSHWIRE PRO
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SlushwireProCard;

import { Button } from "@/app/ui-primitives/button";
// import { DownloadIcon } from "lucide-react";
import Link from "next/link";

export default function ButtonBar() {
  return (
    <div className="flex md:flex-row flex-col gap-4 items-center justify-center">
      <Link href="/smart-match">
        <Button
          className="shadow-lg hover:shadow-xl text-xl px-12 py-6 font-semibold"
          size="lg"
        >
          Find Agents
        </Button>
      </Link>
      {/* <a
        href="https://docs.google.com/spreadsheets/u/4/d/17yQjT-helZqZF1kdF7UzUQYFdNRwrAvGc8Dm2Inbahw/edit?gid=419639381#gid=419639381"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full md:w-auto"
      >
        <Button className="shadow-lg hover:shadow-xl flex items-center gap-2">
          <DownloadIcon className="w-4 h-4" />
          Submission Tracker
        </Button>
      </a> */}
    </div>
  );
}

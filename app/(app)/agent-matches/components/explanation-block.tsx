import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/ui-primitives/dialog";
import { Button } from "@/app/ui-primitives/button";
import CopyToClipboard from "@/app/components/copy-to-clipboard";

const ExplanationBlock = () => {
  return (
    <div className="space-y-2 w-full md:w-fit">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="cursor-pointer text-sm p-2 px-4 w-full md:w-fit shadow-lg hover:shadow-xl"
            variant="secondary"
          >
            How to use the results
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl bg-white rounded-lg px-4 md:p-8 mt-6">
          <DialogHeader>
            <DialogTitle>
              <div className="text-xl font-semibold text-gray-900">
                How to use the results
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <div>
                  <span className="font-semibold">View results</span>
                  <br /> - The results are scored based on how well an agent
                  matches with the entries in the form you submitted. Click the
                  agent card to see the agent&apos;s details.
                </div>
              </li>

              <li className="flex items-start">
                <div>
                  <span className="font-semibold">Query Spreadsheet</span>
                  <br /> - You can download the results from each page in a
                  formatted spreadsheet that you can use during your query
                  process.
                </div>
              </li>

              <li className="flex items-start">
                <div>
                  <span className="font-semibold">Give us honest feedback</span>
                  <br /> - please click the feedback button and let us know what
                  works, what doesn&apos;t, what was missing, what would make
                  you fall in love with our platform, pretty please? You&apos;ll
                  be helping writers everywhere have a better shot at that book
                  deal.
                </div>
              </li>

              <li className="flex items-start">
                <div>
                  <span className="font-semibold">
                    Have anything else to say?
                  </span>
                  <br />{" "}
                  <div className="text-accent/70 font-semibold hover:text-accent">
                    <CopyToClipboard text="feedback@writequeryhook.com" />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExplanationBlock;

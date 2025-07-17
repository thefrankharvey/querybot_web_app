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
            className="cursor-pointer text-base p-6 w-full md:w-fit shadow-lg hover:shadow-xl"
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
                  <strong>View results</strong>
                  <br /> - Your results will show up in a few seconds. The
                  results are scored based on how well an agent matches with the
                  entries in the form you submitted. Click the agent card to see
                  the agent&apos;s details.
                </div>
              </li>

              <li className="flex items-start">
                <div>
                  <strong>Download results</strong>
                  <br /> - You can download the results from each page by
                  clicking the download button. This will download a spreadsheet
                  of your results that you can use.
                </div>
              </li>

              <li className="flex items-start">
                <div>
                  <strong>Give us honest feedback</strong>
                  <br /> - please click the feedback button and let us know what
                  works, what doesn&apos;t, what was missing, what would make
                  you fall in love with our platform, pretty please? You&apos;ll
                  be helping writers everywhere have a better shot at that book
                  deal.
                </div>
              </li>

              <li className="flex items-start">
                <div>
                  <strong>Have anything else to say?</strong>
                  <br />{" "}
                  <div className="text-blue-800 font-semibold">
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

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/ui-primitives/dialog";
import { Button } from "@/app/ui-primitives/button";

const ExplanationBlock = () => {
  return (
    <div className="space-y-2 mb-8">
      <h2 className="text-xl font-semibold text-gray-900">
        How to get the best results:
      </h2>

      <p className="text-gray-700">
        Fill this out this form as completely as possible. The more specific and
        complete your entries are the better your results will be.
      </p>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="cursor-pointer text-lg p-6 font-semibold w-full md:w-fit mt-8 md:mt-0 shadow-lg hover:shadow-xl"
            variant="secondary"
          >
            More Details
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-lg p-8">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              How to get the best results
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <div>
                  <strong>Choose Fiction or Non-Fiction carefully</strong>
                  <br /> – This affects everything else we recommend.
                </div>
              </li>

              <li className="flex items-start">
                <div>
                  <strong>
                    Select the main genre that best fits your book
                  </strong>
                  <br /> – Be honest and specific.
                </div>
              </li>

              <li className="flex items-start">
                <div>
                  <strong>Add subgenres to narrow your match</strong>
                  <br /> – Think tone, setting, or style (e.g., Espionage,
                  Political, Romance).
                </div>
              </li>

              <li className="flex items-start">
                <div>
                  <strong>Select the format</strong>
                  <br /> – Is your manuscript a novel, screenplay, graphic
                  novel, etc.?
                </div>
              </li>

              <li className="flex items-start">
                <div>
                  <strong>Pick the target audience</strong>
                  <br /> – Who are you writing for? (e.g., Middle Grade, YA,
                  Adults).
                </div>
              </li>

              <li className="flex items-start">
                <div>
                  <strong>Add themes (optional)</strong>
                  <br /> – Helps us better understand the emotional or topical
                  core of your book (e.g., grief, friendship, justice).
                </div>
              </li>

              <li className="flex items-start">
                <div>
                  <div className="mb-2">
                    <strong>
                      Add comparable titles (optional but powerful)
                    </strong>
                    <br /> – Include any number of published books similar in
                    style, tone, or audience to yours. This boosts match
                    accuracy.
                  </div>
                  <div className="ml-4">
                    <p className="font-medium mb-1">Example:</p>
                    <ul className="space-y-1 text-sm">
                      <li>▪ Title: The Book Thief</li>
                      <li>▪ Author: Markus Zusak</li>
                    </ul>
                  </div>
                </div>
              </li>
              <li className="flex items-start">
                <div>
                  <strong>Give us feedback</strong>
                  <br /> - this tool can only improve with your input - when you
                  have viewed your results please click the feedback button - it
                  will only take 2-3 minutes.
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

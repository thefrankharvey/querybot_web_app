"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/app/ui-primitives/button";

const SavedMatchEmpty = () => {
  return (
    <div className="w-full flex flex-col justify-start md:w-[1000px] md:mx-auto mt-15">
      <div className="flex flex-col gap-4 bg-white rounded-lg p-4 md:p-12 w-full shadow-lg h-[500px] justify-center items-center">
        <div className="text-center space-y-6 max-auto">
          <h1 className="text-lg md:text-3xl font-bold text-gray-900">
            No Saved Agents Yet
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Start by finding your perfect agent matches and save them to your
            profile
          </p>
          <Link href="/smart-match">
            <Button className="shadow-lg hover:shadow-xl">
              Go to Smart Match
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SavedMatchEmpty;

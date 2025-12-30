"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/ui-primitives/button";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { Spinner } from "@/app/ui-primitives/spinner";
// import { ActionCards } from "@/app/components/action-cards";

const SavedAgents = () => {
  const { agentsList, isLoading } = useProfileContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && agentsList && agentsList.length > 0) {
      router.replace(`/saved-agents/${agentsList[0].index_id}`);
    }
  }, [agentsList, isLoading, router]);

  if (isLoading || (agentsList && agentsList.length > 0)) {
    return (
      <div className="w-full flex flex-col justify-start md:w-[1000px] md:mx-auto mt-4">
        <div className="flex flex-col gap-4 bg-white rounded-lg p-4 md:p-12 w-full shadow-lg h-[500px] justify-center items-center">
          <Spinner className="size-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-start md:w-[1000px] md:mx-auto mt-4">
      {/* <ActionCards /> */}
      <div className="flex flex-col gap-4 bg-white rounded-lg p-4 md:p-12 w-full shadow-lg h-[500px] justify-center items-center">
        <div className="text-center space-y-6 max-auto">
          <h1 className="text-lg md:text-3xl font-bold text-gray-900">
            Welcome Write Query Hook Subscriber!
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

export default SavedAgents;

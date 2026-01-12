"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/ui-primitives/button";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { Spinner } from "@/app/ui-primitives/spinner";
// import { ActionCards } from "@/app/components/action-cards";
import { useClerkUser } from "@/app/hooks/use-clerk-user";

const SavedAgents = () => {
  const { agentsList, isLoading } = useProfileContext();
  const { isSubscribed } = useClerkUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && agentsList && agentsList.length > 0) {
      router.replace(`/saved-agents/${agentsList[0].index_id}`);
    }
  }, [agentsList, isLoading, router]);

  if (isLoading || (agentsList && agentsList.length > 0)) {
    return (
      <div className="w-full flex flex-col justify-start md:w-[1000px] md:mx-auto mt-13">
        <div className="flex flex-col gap-4 bg-white rounded-lg p-4 md:p-12 w-full shadow-lg h-[500px] justify-center items-center">
          <Spinner className="size-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-start md:w-[1000px] md:mx-auto mt-13">
      {/* <ActionCards /> */}
      <div className="flex flex-col gap-4 bg-white rounded-lg p-4 md:p-12 w-full shadow-lg h-[500px] justify-center items-center">
        <div className="text-center space-y-6 max-auto">
          <h1 className="text-lg md:text-3xl font-bold text-gray-900">
            {isSubscribed
              ? "Welcome Write Query Hook Subscriber!"
              : "Welcome to Write Query Hook!"}
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Start by finding your perfect agent matches and save them to your
            profile
          </p>
          <div className="flex md:flex-row flex-col gap-4 items-center justify-center">
            <Link href="/smart-match">
              <Button className="shadow-lg hover:shadow-xl">Find Agents</Button>
            </Link>
            <a
              href="https://docs.google.com/spreadsheets/u/4/d/17yQjT-helZqZF1kdF7UzUQYFdNRwrAvGc8Dm2Inbahw/edit?gid=419639381#gid=419639381"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto"
            >
              <Button className="shadow-lg hover:shadow-xl">
                Free Query Spreadsheet
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedAgents;

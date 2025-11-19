"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui-primitives/accordion";
import { ProfileProvider, useProfileContext } from "../context/profile-context";
import { Spinner } from "../ui-primitives/spinner";

const ProfileLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { agentsList, isLoading } = useProfileContext();
  const [accordionValue, setAccordionValue] = React.useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (agentsList && agentsList.length > 0) {
      setAccordionValue("saved-matches");
    }
  }, [agentsList]);

  return (
    <div className="w-full min-h-screen pt-12 pb-10 md:px-0">
      <div className="w-full md:w-[1300px] mx-auto flex flex-col md:flex-row">
        <aside className="w-full md:sticky md:top-24 h-full md:max-w-[173px]">
          <nav className="w-full flex flex-col gap-2 p-4 md:p-0 rounded-none shadow-none mt-0 md:mt-16">
            <Accordion
              type="single"
              collapsible
              className="w-full md:w-fit"
              value={accordionValue}
              onValueChange={setAccordionValue}
            >
              <AccordionItem value="saved-matches">
                <AccordionTrigger
                  className={cn(
                    "underline-none flex flex-row items-center justify-between text-sm font-medium transition-colors duration-200 hover:text-accent px-3 py-2 rounded-md",
                    pathname.includes("/profile/saved-match")
                      ? "text-accent bg-accent/10"
                      : "text-gray-700"
                  )}
                >
                  <Link
                    href="/profile/saved-match"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1"
                  >
                    Saved Agents
                  </Link>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center ml-4 mt-2 py-4">
                      <Spinner />
                    </div>
                  ) : agentsList?.length && agentsList.length > 0 ? (
                    <div className="flex flex-col gap-2 ml-4 mt-2">
                      {agentsList.map((agent) => (
                        <Link
                          href={`/profile/saved-match/${agent.index_id}`}
                          key={agent.id}
                        >
                          <h3
                            className={cn(
                              "text-sm font-medium transition-colors duration-200 hover:text-accent px-3 py-2 rounded-md capitalize",
                              pathname.includes(
                                `/profile/saved-match/${agent.index_id}`
                              )
                                ? "text-accent bg-accent/10"
                                : "text-gray-700"
                            )}
                          >
                            {agent.name}
                          </h3>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 ml-4 mt-4">
                      <p className="text-sm font-medium text-gray-700">
                        No saved matches
                      </p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            {/* <Link
              href="/profile/latest-blog"
              className={cn(
                "text-sm font-medium transition-colors duration-200 hover:text-accent px-3 py-2 rounded-md",
                pathname === "/profile/latest-blog"
                  ? "text-accent bg-accent/10"
                  : "text-gray-700"
              )}
            >
              Latest Blog
            </Link> */}
            <Link
              href="/profile/account"
              className={cn(
                "text-sm font-medium transition-colors duration-200 hover:text-accent px-3 py-2 rounded-md",
                pathname === "/profile/account"
                  ? "text-accent bg-accent/10"
                  : "text-gray-700"
              )}
            >
              Account
            </Link>
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProfileProvider>
      <ProfileLayoutContent>{children}</ProfileLayoutContent>
    </ProfileProvider>
  );
};

export default ProfileLayout;

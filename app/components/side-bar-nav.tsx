"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui-primitives/accordion";
import { Spinner } from "@/app/ui-primitives/spinner";
import { cn } from "@/app/utils";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { ScanSearch, Newspaper, NotebookPen } from "lucide-react";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { SignOutButton } from "@clerk/nextjs";
import { ACCORDION_STORAGE_KEY } from "../constants";

export const SideBarNav = () => {
  const pathname = usePathname();
  const { agentsList, isLoading } = useProfileContext();
  const { isSubscribed, isLoading: isSubscribedLoading } = useClerkUser();
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    undefined
  );
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(ACCORDION_STORAGE_KEY);
    if (saved !== null) {
      setAccordionValue(saved === "open" ? "saved-agents" : undefined);
    }
    setHasLoadedFromStorage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedFromStorage) return;

    const saved = localStorage.getItem(ACCORDION_STORAGE_KEY);
    if (saved === null && agentsList && agentsList.length > 0) {
      setAccordionValue("saved-agents");
      localStorage.setItem(ACCORDION_STORAGE_KEY, "open");
    }
  }, [agentsList, hasLoadedFromStorage]);

  const handleAccordionChange = (value: string | undefined) => {
    setAccordionValue(value);
    localStorage.setItem(ACCORDION_STORAGE_KEY, value ? "open" : "closed");
  };

  return (
    <div className="w-[195px] shrink-0 pt-4 ml-8 sticky top-0 self-start h-fit hidden md:block">
      <Link href="/" className="text-xl font-semibold text-black">
        <Image
          src="/wqh-logo.png"
          alt="logo"
          width={60}
          height={60}
          className="w-[60px] h-[60px] rounded-full ml-8"
        />
      </Link>
      <div className="w-full flex flex-col md:flex-row pt-8">
        <aside className="w-full md:sticky md:top-24 h-full md:max-w-[195px]">
          <nav className="w-full flex flex-col gap-2 p-4 md:p-0 rounded-none shadow-none mt-0 md:mt-16">
            {!isSubscribed && !isSubscribedLoading && (
              <Link href="/subscribe">
                <div className="cursor-pointer text-sm p-2 px-4 mb-4 text-center rounded-md bg-accent text-white hover:bg-white hover:text-accent transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                  Subscribe
                </div>
              </Link>
            )}
            <Link
              href="/smart-match"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md flex items-center gap-2 hover:text-accent hover:bg-accent/10 transition-all duration-300",
                pathname.includes("smart-match") ||
                  pathname.includes("agent-matches")
                  ? "text-accent bg-accent/10"
                  : "text-black"
              )}
            >
              <ScanSearch className="w-4 h-4" />
              Smart Match
            </Link>
            <Link
              href="/dispatch"
              prefetch={true}
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md flex items-center gap-2 hover:text-accent hover:bg-accent/10 transition-all duration-300",
                pathname.includes("dispatch")
                  ? "text-accent bg-accent/10"
                  : "text-black"
              )}
            >
              <Newspaper className="w-4 h-4" />
              Dispatch
            </Link>
            <Link
              href="/blog"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md flex items-center gap-2 hover:text-accent hover:bg-accent/10 transition-all duration-300",
                pathname.includes("blog")
                  ? "text-accent bg-accent/10"
                  : "text-black"
              )}
            >
              <NotebookPen className="w-4 h-4" />
              Blog
            </Link>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={accordionValue}
              onValueChange={handleAccordionChange}
            >
              <AccordionItem value="saved-agentses">
                <AccordionTrigger
                  className={cn(
                    "underline-none flex flex-row items-center w-full justify-between text-sm font-medium transition-colors duration-300 px-3 py-2 rounded-md hover:text-accent hover:bg-accent/10",
                    pathname.includes("saved-agents")
                      ? "text-accent bg-accent/10"
                      : "text-black"
                  )}
                >
                  <Link
                    href={`/saved-agents/${agentsList?.[0]?.index_id || ""}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2"
                  >
                    {agentsList && agentsList.length > 0 ? (
                      <span className="flex justify-center items-center text-accent bg-accent/10 rounded-[50px] h-4 w-4 text-sm p-3 ml-[-3px]">
                        {agentsList.length}
                      </span>
                    ) : (
                      ""
                    )}
                    <span className="flex">Saved Agents</span>
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
                          href={`/saved-agents/${agent.index_id}`}
                          key={agent.id}
                        >
                          <h3
                            className={cn(
                              "text-sm font-medium transition-colors duration-300 hover:text-accent pr-3 pl-[25px] py-2 rounded-md capitalize max-w-[160px] truncate hover:bg-accent/10",
                              pathname.includes(
                                `/saved-agents/${agent.index_id}`
                              )
                                ? "text-accent bg-accent/10"
                                : "text-black"
                            )}
                          >
                            {agent.name}
                          </h3>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 ml-4 mt-4">
                      <p className="text-sm font-medium text-black">
                        No saved agents
                      </p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <hr className="my-2 border-t-1 border-accent/10" />
            <Link
              href="/account"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-md hover:text-accent hover:bg-accent/10 transition-all duration-300",
                pathname.includes("account")
                  ? "text-accent bg-accent/10"
                  : "text-black"
              )}
            >
              Account
            </Link>
            <SignOutButton>
              <div className="font-medium px-3 py-2 cursor-pointer text-sm text-black transition-all duration-300 hover:text-accent hover:bg-accent/10 rounded-md">
                Sign out
              </div>
            </SignOutButton>
          </nav>
        </aside>
      </div>
    </div>
  );
};

"use client";

import { useEffect, useState } from "react";
import { cn } from "../utils";
import Link from "next/link";
import { SignOutButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useClerkUser } from "../hooks/use-clerk-user";
import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui-primitives/accordion";
import { useProfileContext } from "@/app/(app)/context/profile-context";
import { ACCORDION_STORAGE_KEY } from "../constants";
import { Spinner } from "../ui-primitives/spinner";
import { Newspaper, NotebookPen, ScanSearch } from "lucide-react";

export const AppHamburger = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isSubscribed } = useClerkUser();
  const { agentsList, isLoading } = useProfileContext();
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
    <>
      {open && (
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="flex flex-col justify-center items-center w-10 h-10 p-0 md:hidden"
      >
        <span
          className={`block w-10 h-0.5 bg-current transition-transform duration-200 ${open ? "translate-y-[10px] rotate-45" : ""
            }`}
        />
        <span
          className={`block w-10 h-0.5 bg-current my-2 transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"
            }`}
        />
        <span
          className={`block w-10 h-0.5 bg-current transition-transform duration-200 ${open ? "-translate-y-[10px] -rotate-45" : ""
            }`}
        />
      </button>
      <div
        className={cn(
          "absolute inset-0 w-screen h-[100vh] transition-opacity duration-300 bg-background z-99 overflow-hidden overscroll-none p-6 pt-16 mt-[80px]",
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-4 items-center w-full h-full overflow-y-auto">
          <SignedIn>
            {!isSubscribed && (
              <Link
                onClick={() => setOpen(false)}
                href="/subscribe"
                className="text-base w-full text-center py-2"
              >
                <div className="cursor-pointer text-base font-medium text-center p-2 px-4 rounded-md bg-accent text-white shadow-lg w-full">
                  Subscribe
                </div>
              </Link>
            )}
            <Link
              onClick={() => setOpen(false)}
              href="/smart-match"
              className={cn(
                "text-base w-full font-medium text-center py-2 flex items-center justify-center gap-2",
                pathname.includes("smart-match")
                  ? "text-accent bg-accent/10 rounded-md"
                  : "text-black"
              )}
            >
              <ScanSearch className="w-4 h-4" />
              Smart Match
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/dispatch"
              className={cn(
                "text-base w-full font-medium text-center py-2 flex items-center justify-center gap-2",
                pathname.includes("dispatch")
                  ? "text-accent bg-accent/10 rounded-md"
                  : "text-black"
              )}
            >
              <Newspaper className="w-4 h-4" />
              Dispatch
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/blog"
              className={cn(
                "text-base w-full font-medium text-center py-2 flex items-center justify-center gap-2",
                pathname.includes("blog")
                  ? "text-accent bg-accent/10 rounded-md"
                  : "text-black"
              )}
            >
              <NotebookPen className="w-4 h-4" />
              Blog
            </Link>
            <Accordion
              type="single"
              collapsible
              className="w-full md:w-fit"
              value={accordionValue}
              onValueChange={handleAccordionChange}
            >
              <AccordionItem value="saved-agentses">
                <AccordionTrigger
                  className={cn(
                    "underline-none flex flex-row items-center justify-center text-base font-medium transition-colors duration-300 px-3 py-2 rounded-md hover:text-accent hover:bg-accent/10",
                    pathname.includes("saved-agents")
                      ? "text-accent bg-accent/10"
                      : "text-black"
                  )}
                >
                  <Link
                    href={`/saved-agents/${agentsList?.[0]?.index_id || ""}`}
                    onClick={(e) => { e.stopPropagation(); setOpen(false) }}
                    className="flex items-center gap-2"
                  >
                    {agentsList && agentsList.length > 0 ? (
                      <span className="flex justify-center items-center text-accent bg-accent/10 rounded-[50px] h-4 w-4 text-sm p-3 ml-[-3px]">
                        {agentsList.length}
                      </span>
                    ) : (
                      ""
                    )}
                    <span className="flex text-base font-medium">
                      Saved Agents
                    </span>
                  </Link>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center ml-4 mt-2 py-4">
                      <Spinner />
                    </div>
                  ) : agentsList?.length && agentsList.length > 0 ? (
                    <div className="flex justify-center items-center flex-col gap-2 ml-4 mt-2">
                      {agentsList.map((agent) => (
                        <Link
                          href={`/saved-agents/${agent.index_id}`}
                          key={agent.id}
                        >
                          <h3
                            className={cn(
                              "text-base font-medium transition-colors duration-300 hover:text-accent px-3 py-2 rounded-md capitalize",
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
                    <div className="flex flex-col justify-center items-center gap-2 ml-4 mt-4">
                      <p className="text-base font-medium text-black">
                        No saved agents
                      </p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </SignedIn>
          <div className="flex justify-center flex-col items-center gap-6 w-full md:w-fit mt-10">
            <hr className="w-full border-t-1 border-accent/10 md:hidden" />
            <SignedIn>
              <Link
                onClick={() => setOpen(false)}
                href="/account"
                className="text-base font-medium w-full text-center py-2 md:hidden"
              >
                Account
              </Link>
              <div
                className="cursor-pointer text-base font-medium text-center p-2 px-4 rounded-md bg-white text-black shadow-lg w-full"
                onClick={() => setOpen(false)}
              >
                <SignOutButton />
              </div>
            </SignedIn>
          </div>
          <SignedOut>
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              <div
                className="cursor-pointer text-base font-medium text-center p-2 px-4 rounded-md bg-white text-black shadow-lg w-full"
                onClick={() => setOpen(false)}
              >
                Sign In
              </div>
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              <div className="cursor-pointer text-base font-medium p-2 px-4 rounded-md bg-accent text-white shadow-lg w-full text-center mt-4">
                Sign Up
              </div>
            </Link>
          </SignedOut>
        </div>
      </div>
    </>
  );
};

export default AppHamburger;

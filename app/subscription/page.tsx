"use client";

import { useClerkUser } from "../hooks/use-clerk-user";
import Link from "next/link";
import { Button } from "../ui-primitives/button";
import { getFromLocalStorage } from "../utils";
import Spinner from "../components/spinner";
import {
  DatabaseZap,
  MailCheck,
  Newspaper,
  ScanSearch,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui-primitives/accordion";
import { useState, useEffect } from "react";
import { initializeSubscription } from "../actions/subscription-actions";
import { useRouter } from "next/navigation";

const Subscription = () => {
  const router = useRouter();
  const { isSubscribed, isLoading, user } = useClerkUser();
  const hasAgentMatches = getFromLocalStorage("agent_matches");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Check for success/cancel params from Stripe redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      setMessage({
        type: "success",
        text: "Subscription successful! Welcome to Slushwire Pro!",
      });
    } else if (urlParams.get("canceled") === "true") {
      setMessage({
        type: "error",
        text: "Subscription was canceled. You can try again anytime.",
      });
    }
  }, []);

  const handleSubscribe = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setIsSubscribing(true);
    setMessage(null);

    try {
      // Stripe price ID for Slushwire Pro subscription
      const STRIPE_PRICE_ID = "price_1R1cnMHX8wDCje2DINjUqfkW";

      const result = await initializeSubscription(
        user.id,
        user.emailAddresses[0]?.emailAddress || "",
        STRIPE_PRICE_ID
      );

      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        setMessage({
          type: "error",
          text:
            result.error ||
            "Failed to initialize subscription. Please try again.",
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 flex justify-center items-center">
        <Spinner size={100} />
      </div>
    );
  }

  return (
    <div className="pt-12 flex flex-col gap-4 items-center">
      {isSubscribed ? (
        <>
          <div className="w-full md:w-3/4 mx-auto flex flex-col items-center">
            <h1 className="text-[24px] md:text-[40px] mb-8 font-semibold leading-tight text-center">
              Welcome Slushwire Pro Subscriber!
              <br />
            </h1>
            <div className="flex flex-col md:flex-row gap-8 mt-8 w-full justify-center">
              <Link href="/smart-match">
                <Button className="cursor-pointer text-xl p-8 font-semibold w-full md:w-auto shadow-lg hover:shadow-xl">
                  Smart Match
                </Button>
              </Link>
              <Link href="/slush-feed">
                <Button className="cursor-pointer text-xl p-8 font-semibold w-full md:w-auto shadow-lg hover:shadow-xl">
                  Slushwire Dispatch
                </Button>
              </Link>
              {hasAgentMatches && hasAgentMatches.length > 0 && (
                <Link href="/agent-matches">
                  <Button className="cursor-pointer text-xl p-8 font-semibold w-full md:w-auto shadow-lg hover:shadow-xl">
                    Full Agent Results
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="pb-4 w-full md:w-3/4 mx-auto text-left">
            <h1 className="text-[24px] md:text-[30px] font-semibold leading-tight text-center">
              Join the Slushwire community!
            </h1>
            <div className="w-fit mx-auto flex flex-col mt-8" id="content">
              <p className="text-xl font-bold">What you get:</p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="smart-match">
                  <AccordionTrigger className="[&>svg]:text-accent">
                    <div className="text-base font-normal flex gap-3 items-center">
                      <ScanSearch className="w-8 h-8" />{" "}
                      <span>
                        <span className="font-semibold bg-accent px-2 py-1 mr-1 rounded-md">
                          Smart Match
                        </span>
                        finds agents tailored specifically to your work.
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-4 font-normal text-base ml-2 md:ml-11 w-full md:w-[450px]">
                      <div className="flex gap-3 items-center">
                        <span className="text-xl">✅</span>
                        <span>
                          Smart agent ranking & scores agents for your who can
                          serve your project best.
                        </span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <span className="text-xl">✅</span>
                        <span>
                          Real, actionable insights, not just another pile of
                          names.
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="slushwire-dispatch">
                  <AccordionTrigger className="[&>svg]:text-accent">
                    <div className="text-base font-normal flex gap-3 items-center">
                      <Newspaper className="w-8 h-8" />
                      <span>
                        <span className="font-semibold bg-accent px-2 py-1 mr-1 rounded-md">
                          Slushwire Dispatch
                        </span>
                        provides a real time industry news feed.
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-4 font-normal text-base ml-2 md:ml-11 w-full md:w-[450px]">
                      <div className="flex gap-3 items-center">
                        <span className="text-xl">✅</span>
                        <span>
                          Your Secret Weapon, Get daily real-time updates from
                          top industry sources
                        </span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <span className="text-xl">✅</span>
                        <span>
                          Recently Active Agents, know who&apos;s actively
                          seeking queries so you pitch at the right time
                        </span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <span className="text-xl">✅</span>
                        <span>
                          Monitor Multiple Platforms, Essential updates from
                          across social media and professional platforms
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="agent-database">
                  <AccordionTrigger className="[&>svg]:text-accent">
                    <div className="text-base font-normal flex gap-3 items-center">
                      <DatabaseZap className="w-8 h-8" /> The largest data base
                      of literary agents in the industry.
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-4 font-normal text-base ml-2 md:ml-11 w-full md:w-[450px]">
                      <div className="flex gap-3 items-center">
                        <span className="text-xl">✅</span>
                        <span>
                          The most comprehensive agent database (bigger than the
                          &quot;Big Two&quot;).
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="weekly-newsletter">
                  <AccordionTrigger className="[&>svg]:text-accent">
                    <div className="text-base font-normal flex gap-3 items-center">
                      <MailCheck className="w-8 h-8" />
                      Weekly email newsletter of curated industry intel.
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-4 font-normal text-base ml-2 md:ml-11 w-full md:w-[450px]">
                      <div className="flex gap-3 items-center">
                        <span className="text-xl">✅</span>
                        <span>
                          Unmissable Industry Threads, The top agent AMAs, real
                          guidance, success stories, and insider analysis
                        </span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <span className="text-xl">✅</span>
                        <span>
                          Unlock Submission Strategies, Proven tips &amp;
                          tactics for crafting pitches, synopses, and queries
                          that hook
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <p className="text-base font-normal text-left w-full md:w-[550px] mx-auto p-4 pb-0">
              And we&apos;re just getting started! We have a lot of new features
              in the pipeline. Get early access with Slushwire Pro!
            </p>
          </div>

          {/* Custom Pricing Card */}
          <div className="w-full md:w-[450px] mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-lg">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">Slushwire Pro</h3>
                <p className="text-gray-600 mb-6">Built to empower authors</p>

                <div className="mb-8 flex justify-center items-center">
                  <span className="text-4xl font-semibold">$14</span>
                  <span className="text-gray-600 ml-2">/ month</span>
                </div>

                {/* Success/Error Messages */}
                {message && (
                  <div
                    className={`mb-6 p-4 rounded-md flex items-center gap-2 ${
                      message.type === "success"
                        ? "bg-green-50 border border-green-200 text-green-800"
                        : "bg-red-50 border border-red-200 text-red-800"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="text-sm">{message.text}</span>
                  </div>
                )}

                <Button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="w-full text-lg py-6 font-semibold shadow-lg hover:shadow-xl"
                >
                  {isSubscribing ? (
                    <div className="flex items-center gap-2">
                      <Spinner size={20} />
                      Processing...
                    </div>
                  ) : (
                    "GET SLUSHWIRE PRO"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Subscription;

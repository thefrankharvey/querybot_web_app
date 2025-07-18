import React from "react";

const About = () => {
  return (
    <div className="w-full">
      <div className="pt-12 pb-10 md:pt-20 md:pb-20 w-full md:w-[85%] mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-[48px] font-extrabold leading-tight mb-8 text-left">
          About
        </h1>

        <div className="flex flex-col gap-4 bg-white rounded-lg p-6 md:p-12 shadow-lg max-w-4xl mx-auto">
          <p className="text-lg font-semibold leading-relaxed">
            The path to literary representation is harder than it should be—not
            because writers aren&apos;t ready, but because the system
            isn&apos;t.
          </p>

          <div className="space-y-4 text-gray-700">
            <p>
              In 2014, Publisher&apos;s Marketplace recorded 10,717 book deals.
              By 2024, that number had grown to 14,942—a 39% increase. Book
              sales are up. Interest in new voices is up. So why does it feel
              like it&apos;s getting harder than ever to find a literary agent?
            </p>

            <p className="text-lg font-semibold">
              We believe the problem isn&apos;t you. It isn&apos;t them.
              It&apos;s the Query Industrial Complex.
            </p>

            <p>
              For too long, writers have been forced to navigate outdated
              platforms, incomplete agent databases, and predatory
              &ldquo;consulting&rdquo; fees just to get a foot in the door. Most
              tools stop at teaching you how to write a good query—but what
              about helping you find who to send it to?
            </p>

            <p className="text-lg font-semibold">
              Slushwire Pro was built to change that.
            </p>

            <p>
              We&apos;ve created the largest, most comprehensive literary agent
              database in the industry—and we pair it with{" "}
              <span className="font-semibold">Smart Match</span>, our matching
              tool that help you find agents truly aligned with your work. No
              fluff. No scams. Just the right information, tailored to you.
              matching tools that help you find agents truly aligned with your
              work. No fluff. No scams. Just the right information, tailored to
              you.
            </p>

            <p className="text-lg font-semibold">
              But we go beyond just the query.
            </p>

            <p>
              Your <span className="font-semibold">Slushwire Pro</span>{" "}
              subscription includes access to{" "}
              <span className="font-semibold">Slushwire Dispatch</span>, our
              real-time feed of industry opportunities. Stay in the loop on
              AMAs, pitch events, agent wishlists, query tips, and more—all in
              one place. Because publishing opportunities don&apos;t just happen
              inside the inbox.
            </p>
          </div>
          <p className="text-lg font-semibold">
            Slushwire Pro is here to help you break through.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;

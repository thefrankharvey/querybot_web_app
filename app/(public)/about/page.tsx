import Image from "next/image";
import React from "react";

const About = () => {
  return (
    <div className="w-full">
      <div className="pt-12 pb-10 md:pb-20 w-full md:w-[85%] mx-auto max-w-4xl">
        <div className="flex justify-center items-center">
          <Image
            src="/frank-avatar.png"
            alt="Frank avatar"
            width={200}
            height={200}
            className="mb-8"
          />
        </div>
        <div className="flex flex-col gap-4 bg-white rounded-lg p-6 md:p-12 shadow-lg max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-[32px] font-semibold text-accent leading-tight mb-4 text-left">
            About
          </h1>
          <p>
            If you’ve ever stared at a query spreadsheet and thought, “There has
            to be a better way than this,” you’re not imagining it.
          </p>

          <p>
            I’m Frank, and I created Write Query Hook because I hit the same
            wall you’re probably hitting right now. When I was querying my book,
            the hardest part wasn’t writing the query letters, it was figuring
            out who actually made sense to query.
          </p>

          <p>
            I did what everyone tells you to do: I bounced between QueryTracker,
            Publishers Marketplace, agency websites, interviews, and wishlists.
            I kept dozens of tabs open. I cross referenced scattered bios and
            old posts. And after all that work, I’d still find out an agent was
            closed, not really looking for my category, or only a “maybe” match
            at best. The whole process felt like you were expected to become a
            part-time researcher just to earn the right to press send.
          </p>

          <p>
            And the most frustrating part? The information wasn’t just hard to
            find, it was often outdated, incomplete, or totally disconnected
            from what you actually write. Nothing was truly matching you to
            agents based on your work. Nothing was giving real-time clarity
            about who was open, what they’re looking for, and where legitimate
            opportunities are actually happening. So you end up scouring the
            internet, building a list that kind of makes sense, and hoping you
            didn’t waste weeks targeting the wrong people.
          </p>

          <p>
            That’s the moment Write Query Hook clicked for me: querying
            shouldn’t feel like guesswork.
          </p>

          <p>
            We believe the problem isn't you. It isn't them. It's the Query
            Industrial Complex.
          </p>

          <p>
            For too long, writers have been forced to navigate outdated
            platforms, incomplete agent databases, and predatory “consulting”
            fees just to get a foot in the door. Most tools stop at teaching you
            how to write a good query, but what about helping you find who to
            send it to?
          </p>

          <p>Write Query Hook was built to change that.</p>

          <p>
            We've created the largest, most comprehensive literary agent
            database in the industry and we pair it with Smart Match, our
            matching tool that helps you find agents truly aligned with your
            work. No fluff. No scams. Just the right information, tailored to
            you.
          </p>

          <p>
            And instead of checking a dozen tabs to see who’s open and what’s
            working right now, the Dispatch news feed puts it all in one real-time feed, including AMAs,
            pitch events, agent MSWLs, query tips, and more. Because
            publishing opportunities don't just happen inside the inbox.
          </p>

          <p>Write Query Hook is here to help you break through.</p>
        </div>
      </div>
    </div>
  );
};

export default About;

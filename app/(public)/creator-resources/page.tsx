import React from "react";
import InstagramIcon from "@/app/components/custom-icons/instagram-icon";
import TiktokIcon from "@/app/components/custom-icons/tiktok-icon";
import XIcon from "@/app/components/custom-icons/x-icon";
import BlueskyIcon from "@/app/components/custom-icons/bluesky-icon";
import ThreadsIcon from "@/app/components/custom-icons/threads-icon";
import CopyToClipboard from "@/app/components/copy-to-clipboard";

const CreatorResources = () => {
  return (
    <div className="w-full">
      <div className="pt-12 pb-10 md:pb-20 w-full md:w-[85%] mx-auto max-w-4xl">
        <h1 className="text-[32px] font-semibold text-accent leading-tight mb-4 text-left">
          Creator Resources
        </h1>
        <div className="flex flex-col gap-4 bg-white rounded-lg md:p-6 p-4 md:p-12 shadow-lg max-w-4xl mx-auto">
          <h1 className="text-[24px] font-semibold text-accent leading-tight mb-0 mt-4 text-left">
            What is Write Query Hook
          </h1>
          <p>
            Write Query Hook is a platform designed specifically for writers going through the query process.
            Previously, querying writers would have to spend hours searching for a single agent that might be a good fit, painstakingly build a spreadsheet with agents one by one, and manually update the status and dates of each submission.
            As well as trying to stay up to date on the latest agent openings, MSWLs, and AMAs.
          </p>
          <strong className="font-semibold">We&apos;ve solved these problems!</strong>
          <ul>
            <li><strong className="font-semibold">Smart Match</strong> - Find the right agents for your writing fast</li>
            <li><strong className="font-semibold">Query Dashboard</strong> - Save your matches with one click and track your query progress</li>
            <li><strong className="font-semibold">Dispatch</strong> - Stay current on the latest agent openings, MSWLs, AMAs, and more</li>
          </ul>

          <h1 className="text-[24px] font-semibold text-accent leading-tight mb-0 mt-4 text-left">
            Features In Depth:
          </h1>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-semibold text-accent leading-tight text-left">
                Smart Match
              </h1>
              <p>
                Smart Match combines the largest literary agent database on the internet, with more than 3,300 agents, and our search algorithm to match writers’
                project details with the best agents for their work. In a single search, writers can find potentially hundreds of agents for their project.
                Smart Match evaluates genre, subgenre, format, themes, comp titles, and audience to surface the strongest matches,
                then allows writers to filter agent matches by country and open/closed status. With one click, they can save results to the
                Query Dashboard or export a ready to use query spreadsheet pre filled with their matches.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-semibold text-accent leading-tight text-left">
                Query Dashboard
              </h1>
              <p>
                The Query Dashboard handles the admin side of querying. Writers can save all or specifically selected
                agent matches in one click. They&apos;re able to skip the manual spreadsheet setup, rate each
                agent by personal fit, mark query letters as ready to send, add project
                names for multiple manuscripts, and keep notes on every agent.
                The dashboard also tracks submission progress, including how many
                days it has been since a query or manuscript was sent, and makes it
                easy to filter by fit and submission status.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-semibold text-accent leading-tight text-left">
                Dispatch
              </h1>
              <p>
                Dispatch is the real-time publishing intel feed inside Write Query
                Hook. It helps writers stay current as industry information changes
                by tracking agent open and closed statuses, surfacing MSWL updates,
                collecting AMA moments, and pulling together practical pubtips in
                one place. That means writers can adjust their query strategy
                quickly instead of discovering important changes after they have
                already submitted.
              </p>
            </div>
          </div>
          <h1 className="text-[24px] font-semibold text-accent leading-tight mb-0 mt-4 text-left">
            What We&apos;re Offering Creators
          </h1>
          <p>
            We want to partner with creators who speak to writers in the querying process,
            and we aim to make that partnership genuinely worthwhile. For the right fit, we offer complimentary full access
            to the platform so creators can explore it firsthand, create from real experience,
            and share something valuable with their audience.
            For creators with especially strong alignment, we are also open to paid collaborations over time,
            with the goal of building long-term partnerships that provide real value to both creators and the writers they support.
          </p>

          <p>
            Our goal is long-term alignment, not one-off promo. We are looking
            for creators who can show querying writers how the platform actually helps:
            find best-fit agents, track their query progress, and stay up to date
            with the changing literary agent landscape.
          </p>

          <h1 className="text-[24px] font-semibold text-accent leading-tight mb-0 mt-4 text-left">
            Content Ideas You Can Steal
          </h1>
          <p>
            - The query process is exhausting! Write Query Hook makes it easy to find agents, track submissions, and keep up with industry updates all in one place.
          </p>
          <p>
            - If your query tracking process is living across spreadsheets, notes, and a million tabs, fear not Write Query Hook has the solution for you.
          </p>
          <p>
            - Querying writers do not have time for scattered research, manual tracking, and outdated spreadsheets.
            They need better tools to find the right agents, stay organized, and keep up with industry changes.
          </p>

          <div>
            <p className="font-semibold text-lg mt-4">
              If you have any questions, please feel free to reach out to us on social media or at
            </p>
            <CopyToClipboard
              text="feedback@writequeryhook.com"
              className="text-accent font-semibold text-lg"
            />
          </div>

          <div className="flex flex-row gap-4 mt-4 justify-center">
            <a href="https://www.instagram.com/writequeryhook" target="_blank" rel="noopener noreferrer" className="text-accent">
              <InstagramIcon className="w-8 h-8" />
            </a>
            <a href="https://www.tiktok.com/@write.query.hook?is_from_webapp=1" target="_blank" rel="noopener noreferrer" className="text-accent">
              <TiktokIcon className="w-8 h-8" />
            </a>
            <a href="https://x.com/writequeryhook" target="_blank" rel="noopener noreferrer" className="text-accent">
              <XIcon className="w-8 h-8" />
            </a>
            <a href="https://bsky.app/profile/writequeryhook.bsky.social" target="_blank" rel="noopener noreferrer" className="text-accent">
              <BlueskyIcon className="w-8 h-8" />
            </a>
            <a href="https://www.threads.com/@writequeryhook" target="_blank" rel="noopener noreferrer" className="text-accent">
              <ThreadsIcon className="w-8 h-8" />
            </a>
          </div>
        </div>
      </div>
    </div >
  );
};

export default CreatorResources;

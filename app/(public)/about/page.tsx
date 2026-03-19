import Image from "next/image";
import Link from "next/link";

import HomeContentShell from "@/app/(public)/(home)/components/home-content-shell";
import { Button } from "@/app/ui-primitives/button";
import { cn } from "@/app/utils";

const features = [
  {
    name: "Over 3,300 Literary Agents",
    description:
      "The most on the internet, in one place. No more fractions of lists scattered across seven platforms. We are the one source of truth, updated daily.",
  },
  {
    name: "Smart Match",
    description:
      "A system that assesses, scores, ranks, and matches agents to your specific manuscript: genre, format, themes, comps, audience. Not random. Not alphabetical. Ranked by fit.",
  },
  {
    name: "Query Dashboard",
    description:
      "Save your matched agents with one click. Track every query in one modern dashboard. No spreadsheets. Unless you\u2019re into that sort of thing\u2014we have that too.",
  },
  {
    name: "Daily News Feed",
    description:
      "Monitors the industry around the clock, tracking MSWLs, AMAs, query tips, publishing advice, query critiques, and more so you don\u2019t miss opportunities.",
  },
  {
    name: "Slushwire Dispatch",
    description:
      "Our super popular newsletter that keeps you in the loop on everything happening in the query trenches.",
  },
  {
    name: "Query Tracking Spreadsheet",
    description:
      "Because some of you love the spreadsheet. We got you.",
  },
];

export default function About() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Radial gradient background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 70%)",
        }}
      />

      <HomeContentShell className="max-w-3xl">
        <div className="space-y-6 pb-24 pt-12 text-base leading-8 text-accent/90 md:pt-16">
          {/* Avatars */}
          <div className="flex justify-center gap-6 !mb-5">
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/frank-avatar-green-lines-only.png"
                alt="Frank avatar"
                width={180}
                height={180}
                className="rounded-full"
                priority
              />
              <span className="text-sm text-accent/70">Frank, Writer &amp; Data Guy</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/matt-avatar-green-lines-only.png.png"
                alt="Matt avatar"
                width={180}
                height={180}
                className="rounded-full"
                priority
              />
              <span className="text-sm text-accent/70">Matt, Non-Writer &amp; Software Guy</span>
            </div>
          </div>

          {/* Origin narrative */}
          <p>
            <span className="font-serif text-xl text-accent md:text-2xl">
              My first rejection
            </span>{" "}
            was for a screenplay.{" "}
            Long before I sold out, defecting to our capitalist overlords, I
            was 21 with a finished screenplay. I bought the Screenwriter&apos;s
            Bible, read <em>Save the Cat</em>, stamped and mailed the
            &ldquo;cover&rdquo; letter (or whatever it was called back then)
            off to Hollywood. I got exactly one request which resulted in my
            very first official rejection.
          </p>

          <p className="font-serif text-xl text-accent md:text-2xl">
            Yay!
          </p>

          <p>
            As you know, there would be many, many more of those for short
            stories, a novel, a children&apos;s book.
          </p>

          <p className="font-serif text-xl text-accent md:text-2xl">
            Art is hard.
          </p>

          <p>
            Fast forward to the present day Query Trenches: oh man are they
            the sludgiest they&apos;ve ever been. Of course there&apos;s the
            old guard platforms that are about as fit for service as Homer
            Simpson at the nuclear plant.
          </p>

          {/* GIF */}
          <div className="flex justify-center py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3aHBzMmNscnk3MXJnZndxbmRpMmptMWEzdHI1dTJrMjZncWdhY2wzMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8EmeieJAGjvUI/giphy.gif"
              alt="Homer Simpson at the nuclear plant"
              className="w-full max-w-sm rounded-2xl shadow-[0_12px_30px_rgba(20,40,60,0.08)]"
            />
          </div>

          <p>Not to mention the new predators stalking the trenches:</p>

          <p className="font-serif text-xl text-accent md:text-2xl">
            $1,300 for a &ldquo;curated&rdquo; list of 30 agents&apos; contact
            information?
          </p>

          <p>I wish I was kidding.</p>

          <p>
            Navigating our modern Query Industrial Complex feels overwhelming
            and oppressive. And almost everyone who&apos;s been there shares
            the same perspective. This is where my frustration turns into rage
            the more I hear, &ldquo;it&apos;s just the way it is&rdquo; and
            &ldquo;this is all we&apos;ve got&rdquo; from gatekeepers,
            published authors, and the locked-out alike. Nobody likes it but
            also nobody is doing anything about it.
          </p>

          <p>
            This is the part where I stop querying, not because it turns out
            that I&apos;m still a shitty writer (I am) but because{" "}
            <span className="font-serif text-lg text-accent">
              this problem must be solved
            </span>{" "}
            before making another footprint in the sludge. My skin crawls
            thinking about how many of us have missed opportunities or given
            up because of this completely preventable bottleneck.
          </p>

          {/* What We Built */}
          <p>
            <span className="font-serif text-xl text-accent md:text-2xl">
              So we built it.
            </span>{" "}
            After recruiting my friend and cofounder Matt as the technical arm
            of our rebellion against the QIC, Write Query Hook was born. It&apos;s
            a set of ever evolving tools designed for writers that query:
          </p>

          {/* Feature cards grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.name}
                className={cn(
                  "rounded-[28px] border border-white/90 bg-white/88 p-6",
                  "shadow-[0_20px_56px_rgba(24,44,69,0.08)] backdrop-blur-sm"
                )}
              >
                <h3 className="mb-2 text-lg font-bold text-accent">
                  {feature.name}
                </h3>
                <p className="text-sm leading-7 text-accent/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* No AI badge */}
          <div className="flex justify-center">
            <span
              className={cn(
                "inline-block rounded-full border border-accent/15 bg-accent/5 px-5 py-2",
                "text-sm font-semibold tracking-wide text-accent"
              )}
            >
              No AI.
            </span>
          </div>

          {/* Sign-off */}
          <p>
            We are a small but mighty team. We can&apos;t guarantee you an
            agent. But we can give you the best shot at landing the right
            agent by arming you with modern tools built by writers and
            engineers with better data. Because, we truly want to see you land an agent. The query process doesn&apos;t have
            to feel like the Odyssey (by the other Homer). We&apos;re
            handling the dirty work now. Because, after all, you are a
            writer not a secretary.
          </p>

          <p className="font-serif text-lg text-accent">
            Frank,
            <br />
            Emperor of Slushville
          </p>

          <p className="text-sm italic text-accent/50">
            Written from the peak of Mount Slushmore, 2025
          </p>

          <div>
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 text-base"
            >
              <Link href="/sign-up">Start free</Link>
            </Button>
          </div>
        </div>
      </HomeContentShell>
    </div>
  );
}

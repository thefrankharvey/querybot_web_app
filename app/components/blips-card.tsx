"use client";

import { useState } from "react";
import { Blips } from "@/app/types";
import {
  formatGenres,
  formatDisplayString,
  capitalizeFirstCharacter,
} from "@/app/utils";
import { Users } from "lucide-react";
import Link from "next/link";

const BlipsCard = ({
  blips,
  isOpenToSubs,
}: {
  blips: Blips;
  isOpenToSubs?: boolean;
}) => {
  const [openAccordion, setOpenAccordion] = useState<boolean>(false);

  const formattedInterests = blips.extra_interest
    ? capitalizeFirstCharacter(formatDisplayString(blips.extra_interest))
    : null;

  // Data required to show a card.
  const isDataValid =
    blips.agency && blips.genres && formattedInterests && blips.name
      ? true
      : false;

  return isDataValid ? (
    <div className="glass-panel flex w-full flex-col gap-4 p-4 py-8 md:p-8">
      {blips.website ? (
        <>
          <Link href={blips.website} target="_blank">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-accent">
                <Users />
                <h3 className="text-sm">{blips.name}</h3>
              </div>
              {isOpenToSubs ? (
                <span className="rounded-full border border-accent bg-accent px-3 py-1 text-sm font-semibold text-white">
                  Open to Submissions
                </span>
              ) : (
                <span className="rounded-full border border-accent bg-accent px-3 py-1 text-sm font-semibold text-white">
                  Agent Update
                </span>
              )}
            </div>
          </Link>
          {blips.agency && (
            <Link href={blips.website} target="_blank">
              <div className="flex gap-2 text-sm text-accent/78">
                <h3 className="font-semibold">Agency:</h3>
                <p>{blips.agency}</p>
              </div>
            </Link>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-accent">
              <Users />
              <h3 className="text-sm">{blips.name}</h3>
            </div>
            {isOpenToSubs && (
              <span className="rounded-full border border-accent bg-accent px-3 py-1 text-sm font-semibold text-white">
                Open to Submissions
              </span>
            )}
          </div>

          {blips.agency && (
            <div className="flex gap-2 text-sm text-accent/78">
              <h3 className="font-semibold">Agency:</h3>
              <p>{blips.agency}</p>
            </div>
          )}
        </>
      )}

      <div>
        <h3 className="text-sm font-semibold text-accent">Top Genres:</h3>
        <div className="flex flex-wrap gap-1">
          {blips.genres
            ? formatGenres(blips.genres)
                .slice(0, 8)
                .map((genre, index) => (
                  <div
                    className="surface-tag px-2 py-1 text-xs"
                    key={index}
                  >
                    {genre}
                  </div>
                ))
            : "Info Unavailable"}
        </div>
      </div>
      <div
        className="flex flex-col cursor-pointer text-sm"
        onClick={() => setOpenAccordion(!openAccordion)}
      >
        <h3 className="text-sm font-semibold text-accent">Interests:</h3>
        {!openAccordion ? (
          <p className="line-clamp-3 text-accent/78">{formattedInterests}</p>
        ) : (
          <p className="text-accent/78">{formattedInterests}</p>
        )}
      </div>
    </div>
  ) : null;
};

export default BlipsCard;

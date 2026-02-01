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
    <div className="bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md flex flex-col gap-4">
      {blips.website ? (
        <>
          <Link href={blips.website} target="_blank">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center font-semibold">
                <Users />
                <h3 className="text-sm">{blips.name}</h3>
              </div>
              {isOpenToSubs ? (
                <span className="bg-accent text-white text-sm p-1 px-3 rounded-xl font-semibold">
                  Open to Submissions
                </span>
              ) : (
                <span className="bg-accent text-white text-sm p-1 px-3 rounded-xl font-semibold">
                  Agent Update
                </span>
              )}
            </div>
          </Link>
          {blips.agency && (
            <Link href={blips.website} target="_blank">
              <div className="flex gap-2 text-sm">
                <h3 className="font-semibold">Agency:</h3>
                <p>{blips.agency}</p>
              </div>
            </Link>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center font-semibold">
              <Users />
              <h3 className="text-sm">{blips.name}</h3>
            </div>
            {isOpenToSubs && (
              <span className="bg-accent text-white text-sm p-1 px-3 rounded-xl font-semibold">
                Open to Submissions
              </span>
            )}
          </div>

          {blips.agency && (
            <div className="flex gap-2 text-sm">
              <h3 className="font-semibold">Agency:</h3>
              <p>{blips.agency}</p>
            </div>
          )}
        </>
      )}

      <div>
        <h3 className="text-sm font-semibold">Top Genres:</h3>
        <div className="flex flex-wrap gap-1">
          {blips.genres
            ? formatGenres(blips.genres)
                .slice(0, 8)
                .map((genre, index) => (
                  <div
                    className="bg-gray-100 px-2 py-1 text-xs rounded-md"
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
        <h3 className="text-sm font-semibold">Interests:</h3>
        {!openAccordion ? (
          <p className="line-clamp-3">{formattedInterests}</p>
        ) : (
          <p>{formattedInterests}</p>
        )}
      </div>
    </div>
  ) : null;
};

export default BlipsCard;

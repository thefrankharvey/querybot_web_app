"use client";

import { useState } from "react";
import { Blips } from "@/app/types";
import { formatGenres, removePipes } from "@/app/utils";
import { Users } from "lucide-react";
import Link from "next/link";

const BlipsCard = ({ blips }: { blips: Blips }) => {
  const [openAccordion, setOpenAccordion] = useState<boolean>(false);

  const formattedBio = blips.bio ? removePipes(blips.bio) : null;

  // Data required to show a card.
  const isDataValid =
    blips.agency && blips.genres && formattedBio && blips.name ? true : false;

  return isDataValid ? (
    <div className="bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md flex flex-col gap-4">
      {blips.website ? (
        <>
          <Link href={blips.website} target="_blank">
            <div className="flex gap-2 items-center font-semibold italic">
              <Users />
              <h3 className="text-sm">{blips.name}</h3>
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
          <div className="flex gap-2 items-center font-semibold italic">
            <Users />
            <h3 className="text-sm">{blips.name}</h3>
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
        <h3 className="text-sm font-semibold">Genres:</h3>
        <div className="flex flex-wrap gap-1">
          {formatGenres(blips.genres)
            .slice(0, 8)
            .map((genre, index) => (
              <div
                className="bg-gray-100 px-2 py-1 text-xs rounded-md"
                key={index}
              >
                {genre}
              </div>
            ))}
        </div>
      </div>
      <div
        className="flex flex-col cursor-pointer text-sm"
        onClick={() => setOpenAccordion(!openAccordion)}
      >
        <h3 className="text-sm font-semibold">Bio:</h3>
        {!openAccordion ? (
          <p className="line-clamp-3">{formattedBio}</p>
        ) : (
          <p>{formattedBio}</p>
        )}
      </div>
    </div>
  ) : null;
};

export default BlipsCard;

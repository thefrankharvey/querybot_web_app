"use client";

import { RedditPost } from "@/app/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const RedditCard = ({ post }: { post: RedditPost }) => {
  const [openAccordion, setOpenAccordion] = useState(false);

  return (
    <div className="bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md">
      <Link href={post.post_link || ""} target="_blank">
        <div className="flex gap-2 items-center font-semibold">
          <div className="min-h-[24px] min-w-[24px]">
            <Image
              src={"/reddit-icon.svg"}
              width={24}
              height={24}
              alt="reddit icon"
            />
          </div>
          <h3 className="text-sm line-clamp-1 px-1">{post.headline}</h3>
        </div>
      </Link>
      <div
        className="flex flex-col cursor-pointer mt-4 text-sm"
        onClick={() => setOpenAccordion(!openAccordion)}
      >
        <h3 className="text-base font-semibold"></h3>
        {!openAccordion ? (
          <p className="line-clamp-3">{post.content}</p>
        ) : (
          <p>{post.content}</p>
        )}
      </div>
    </div>
  );
};

export default RedditCard;

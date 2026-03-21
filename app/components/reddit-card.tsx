"use client";

import { RedditPost } from "@/app/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const RedditCard = ({ post }: { post: RedditPost }) => {
  const [openAccordion, setOpenAccordion] = useState(false);

  return (
    <div className="glass-panel w-full p-4 py-8 md:p-8">
      <Link href={post.post_link || ""} target="_blank">
        <div className="flex items-center gap-2 font-semibold text-accent">
          <div className="min-h-[24px] min-w-[24px]">
            <Image
              src={"/reddit-icon.svg"}
              width={24}
              height={24}
              alt="reddit icon"
            />
          </div>
          <h3 className="text-sm px-1 max-w-[280px] md:max-w-full truncate">
            {post.headline}
          </h3>
        </div>
      </Link>
      <div
        className="flex flex-col cursor-pointer mt-4 text-sm"
        onClick={() => setOpenAccordion(!openAccordion)}
      >
        <h3 className="text-base font-semibold"></h3>
        {!openAccordion ? (
          <p className="line-clamp-3 max-w-[320px] break-words text-accent/78 md:max-w-full word-wrap">
            {post.content}
          </p>
        ) : (
          <p className="max-w-[320px] break-words text-accent/78 md:max-w-full word-wrap">
            {post.content}
          </p>
        )}
      </div>
    </div>
  );
};

export default RedditCard;

import { BlueskyPost } from "@/app/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const BlueskyCard = ({ post }: { post: BlueskyPost }) => {
  return (
    <Link href={post.url} target="_blank">
      <div className="bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md gap-4 flex flex-col">
        <div className="flex gap-4 items-center">
          <Image
            src="/bluesky-icon.svg"
            alt="bluesky butterfly"
            width={24}
            height={24}
          />
          <h3 className="text-sm font-semibold">{post.hashtag}</h3>
        </div>
        <p className="overflow-hidden">{post.text}</p>
      </div>
    </Link>
  );
};

export default BlueskyCard;

import { BlueskyPost } from "@/app/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const BlueskyCard = ({ post }: { post: BlueskyPost }) => {
  return (
    <Link href={post.url} target="_blank">
      <div className="glass-panel flex w-full flex-col gap-4 p-4 py-8 md:p-8">
        <div className="flex gap-4 items-center">
          <Image
            src="/bluesky-icon.svg"
            alt="bluesky butterfly"
            width={24}
            height={24}
          />
          <h3 className="text-sm font-semibold text-accent">{post.hashtag}</h3>
        </div>
        <p className="overflow-hidden text-sm text-accent/78">{post.text}</p>
      </div>
    </Link>
  );
};

export default BlueskyCard;

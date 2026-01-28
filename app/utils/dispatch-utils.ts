import { formatDisplayString, urlFormatter } from "@/app/utils";
import { Blips, FeedItem } from "../types";

export const formatBlips = (blip: Blips): Blips => {
  return {
    ...blip,
    extra_interest: blip.extra_interest
      ? formatDisplayString(blip.extra_interest)
      : undefined,
    website: blip.website ? urlFormatter(blip.website) || "" : "",
  };
};

export const formatFeedItem = (item: FeedItem): FeedItem => {
  if (item.type === "new_opening" || item.type === "agent_activity") {
    return {
      ...item,
      data: formatBlips(item.data),
    };
  }
  return item;
};

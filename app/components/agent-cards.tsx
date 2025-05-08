import React from "react";
import { Star, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui-primitives/dialog";

type AgentCardProps = {
  aala_member: boolean | null;
  agency: string | null;
  bio: string | null;
  clients: string | null;
  email: string | null;
  extra_interest: string | null;
  extra_links: string | null;
  favorites: string | null;
  genres: string | null;
  location: string | null;
  name: string | null;
  pubmarketplace: string | null;
  querymanager: string | null;
  querytracker: string | null;
  sales: string | null;
  submission_req: string | null;
  total_score: number | null;
  twitter_handle: string | null;
  twitter_url: string | null;
  website: string | null;
};

// TODO
// figure out which extra_links to use

const isValidData = (data: string | null): boolean => {
  return data && data !== "!missing" ? true : false;
};

export const AgentCards = ({
  agent,
  index,
}: {
  agent: AgentCardProps;
  index: number;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div
        className="bg-white rounded-lg p-4 py-8 md:p-8 w-full hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => (index < 3 ? setIsOpen(true) : undefined)}
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold capitalize">{agent.name}</h2>
            {agent.total_score && (
              <p className="text-xl font-semibold flex items-center gap-1">
                <Star className="w-6 h-6" />
                {agent.total_score}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Bio:</label>
            <p className="text-sm line-clamp-3">
              {isValidData(agent.bio) ? agent.bio : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Agency:</label>
            <p className="text-sm">
              {isValidData(agent.agency) ? agent.agency : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Clients:</label>
            <p className="text-sm line-clamp-3">
              {isValidData(agent.clients) ? agent.clients : "Info Unavailable"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Sales:</label>
            <p className="text-sm line-clamp-3">
              {isValidData(agent.sales) ? agent.sales : "Info Unavailable"}
            </p>
          </div>
        </div>
      </div>

      <DialogContent className="max-w-[700px] max-h-[80vh] overflow-y-auto [&>button:last-child]:hidden">
        <DialogHeader>
          <div className="flex justify-between w-full">
            <DialogTitle className="text-2xl capitalize">
              {agent.name}
            </DialogTitle>
            <X
              className="w-8 h-8 cursor-pointer"
              onClick={() => setIsOpen(false)}
            />
          </div>
          {agent.total_score && (
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5" />
              <span className="text-lg font-semibold">{agent.total_score}</span>
            </div>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4 w-full">
          <div>
            <h3 className="font-semibold mb-2">Contact</h3>
            <p className="text-sm">
              {isValidData(agent.email) ? agent.email : "Info Unavailable"}
            </p>
          </div>

          {isValidData(agent.website) && (
            <div>
              <h3 className="font-semibold mb-2">Website</h3>
              <a
                href={agent.website || ""}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {agent.website}
              </a>
            </div>
          )}

          {isValidData(agent.twitter_url) && (
            <div>
              <h3 className="font-semibold mb-2">Twitter</h3>
              <a
                href={agent.twitter_url || ""}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {agent.twitter_handle}
              </a>
            </div>
          )}
          <div>
            <h3 className="font-semibold mb-2">Agency</h3>
            <p className="text-sm">
              {isValidData(agent.agency) ? agent.agency : "Info Unavailable"}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Clients</h3>
            <p className="text-sm">
              {isValidData(agent.clients) ? agent.clients : "Info Unavailable"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Bio</h3>
            <p className="text-sm">
              {isValidData(agent.bio) ? agent.bio : "Info Unavailable"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Sales</h3>
            <p className="text-sm">
              {isValidData(agent.sales) ? agent.sales : "Info Unavailable"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Location</h3>
            <p className="text-sm">
              {isValidData(agent.location)
                ? agent.location
                : "Info Unavailable"}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Genres</h3>
            <p className="text-sm">
              {isValidData(agent.genres) ? agent.genres : "Info Unavailable"}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Submission Requirements</h3>
            <p className="text-sm">
              {isValidData(agent.submission_req)
                ? agent.submission_req
                : "Info Unavailable"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentCards;

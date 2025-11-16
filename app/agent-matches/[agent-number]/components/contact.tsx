import CopyToClipboard from "@/app/components/copy-to-clipboard";
import TooltipComponent from "@/app/components/tooltip";
import { AgentMatch } from "@/app/context/agent-matches-context";
import { Button } from "@/app/ui-primitives/button";
import { formatEmail, urlFormatter } from "@/app/utils";
import React from "react";
import { useSaveAgent } from "@/app/hooks/use-save-agent";

const Contact = ({
  agent,
  isSubscribed,
}: {
  agent: AgentMatch;
  isSubscribed: boolean;
}) => {
  const { mutate: saveAgent, isPending } = useSaveAgent();

  const handleSaveAgent = () => {
    const payload = {
      name: agent.name,
      email: agent.email || null,
      agency: agent.agency || null,
      agency_url: agent.website || null,
      index_id: agent.agent_id || null,
      query_tracker: agent.querytracker || null,
      pub_marketplace: agent.pubmarketplace || null,
      match_score: agent.normalized_score || null,
    };

    saveAgent(payload);
  };

  return (
    <div>
      {!isSubscribed ? (
        <div className="flex flex-col gap-2 items-start">
          <TooltipComponent
            contentClass="text-center"
            content="Subscribe to Write Query Hook to see contact details!"
          >
            <h2 className="text-xl font-bold mb-2 text-left">Contact</h2>
            <div className="flex flex-col gap-2 items-start">
              <div>
                <span className="font-semibold">Email:</span> ***************
              </div>
              <div>
                <span className="font-semibold">Query Tracker:</span>{" "}
                ***************
              </div>
              <div>
                <span className="font-semibold">PubMarketplace:</span>{" "}
                ***************
              </div>
            </div>
          </TooltipComponent>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-2">Contact</h2>
          <div className="flex flex-col gap-2">
            {agent.email && (
              <div className="flex flex-col gap-1">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-1 w-fit">
                  <label className="font-semibold">Email:</label>
                  <div className="flex flex-wrap gap-2 md:gap-4">
                    {formatEmail(agent.email)?.map((email, index) => {
                      return <CopyToClipboard key={index} text={email} />;
                    })}
                  </div>
                </div>
              </div>
            )}
            {agent.querymanager && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={urlFormatter(agent.querymanager) || ""}
                className="underline font-semibold hover:text-accent"
              >
                Query Manager
              </a>
            )}
            {agent.pubmarketplace && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={urlFormatter(agent.pubmarketplace) || ""}
                className="underline font-semibold hover:text-accent"
              >
                PubMarketplace
              </a>
            )}
            {agent.querytracker && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={urlFormatter(agent.querytracker) || ""}
                className="underline font-semibold hover:text-accent"
              >
                Query Tracker
              </a>
            )}
          </div>
        </>
      )}
      <Button
        className="text-sm shadow-lg hover:shadow-xl mt-4"
        onClick={handleSaveAgent}
        disabled={isPending}
      >
        {isPending ? "Saving..." : "Save Agent"}
      </Button>
    </div>
  );
};

export default Contact;

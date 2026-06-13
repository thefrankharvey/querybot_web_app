"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";
import { agentStatusOptions } from "@/app/constants";
import { useState } from "react";

export const AgentsFilterBar = () => {
  const [agentStatus, setAgentStatus] = useState(agentStatusOptions[0]);

  return (
    <div className="bg-white rounded-md">
      <Select
        value={agentStatus.value}
        onValueChange={(value) =>
          setAgentStatus(
            agentStatusOptions.find(
              (option) => option.value === value
            ) as (typeof agentStatusOptions)[0]
          )
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          {agentStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

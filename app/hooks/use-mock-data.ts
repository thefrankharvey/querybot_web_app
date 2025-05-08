import mockData from "../mock-data.json";

export const useMockData = () => {
  let currentName = "";
  const filteredMockData = mockData.filter((agent) => {
    const agentName = agent.name?.toLowerCase();
    if (agentName === currentName) {
      return false;
    }
    currentName = agentName;
    return true;
  });

  return filteredMockData;
};

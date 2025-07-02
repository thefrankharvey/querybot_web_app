import React from "react";
import { Feed } from "./components/feed";

const SlushReport = async () => {
  const res = await fetch("https://querybot-api.onrender.com/recent-activity");
  const data = await res.json();

  if (!res.ok) {
    return "There was an error.";
  }

  return (
    <div className="w-full flex flex-col justify-start md:w-[700px] md:mx-auto pt-30">
      <h1 className="text-4xl font-extrabold leading-tight mb-8">
        Slushwire Dispatch
      </h1>
      <Feed data={data} />
    </div>
  );
};

export default SlushReport;

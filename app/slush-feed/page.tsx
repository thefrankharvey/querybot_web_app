import React from "react";
import { Feed } from "./components/feed";

const fetchSlushFeed = async () => {
  try {
    const res = await fetch(
      "https://querybot-api.onrender.com/recent-activity"
    );
    return res.json();
  } catch (e) {
    console.log(e);
  }
};

const SlushReport = async () => {
  const data = await fetchSlushFeed();

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

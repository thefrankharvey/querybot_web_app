import { NextResponse } from "next/server";
import example from "@/app/example.json";

export async function POST() {
  // POST(req: NextRequest)
  //   const body = await req.json();

  // Make the external POST request from the server
  try {
    const externalRes = await fetch(
      "https://querybot-api.onrender.com/jotform-webhook",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //   Authorization: `Bearer ${process.env.EXTERNAL_API_KEY}`,
        },
        body: JSON.stringify(example),
      }
    );
    const data = await externalRes.json();

    return NextResponse.json(data, { status: externalRes.status });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

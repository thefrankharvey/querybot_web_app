import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error No type declarations available for pdf-parse
import pdfParse from "pdf-parse/lib/pdf-parse";

// Define the structure of form data
interface QueryFormData {
  email: string;
  genre: string;
  subgenres: string[];
  special_audience: string;
  target_audience: string;
  comps: { title: string; author: string }[];
  themes: string;
  synopsis: string;
  manuscript?: string; // Optional as it might come from file parsing
}

export async function POST(req: NextRequest) {
  try {
    let formData: QueryFormData;
    let manuscriptText = "";

    // Check if the request is multipart form-data (containing a file)
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const multipartFormData = await req.formData();

      // Extract the file and form data fields
      const manuscript = multipartFormData.get("manuscript") as File | null;

      console.log("manuscript:", manuscript);

      // Convert form data to JSON object
      formData = {
        email: multipartFormData.get("email") as string,
        genre: multipartFormData.get("genre") as string,
        subgenres: JSON.parse(
          (multipartFormData.get("subgenres") as string) || "[]"
        ),
        special_audience: multipartFormData.get("special_audience") as string,
        target_audience: multipartFormData.get("target_audience") as string,
        comps: JSON.parse((multipartFormData.get("comps") as string) || "[]"),
        themes: multipartFormData.get("themes") as string,
        synopsis: multipartFormData.get("synopsis") as string,
      };

      // Process the file if present
      if (manuscript) {
        const manuscriptType = manuscript.type;
        // Handle different file types
        if (manuscriptType === "application/pdf") {
          try {
            // Convert manuscript to ArrayBuffer
            const arrayBuffer = await manuscript.arrayBuffer();
            // Convert ArrayBuffer to Buffer for pdf-parse
            const buffer = Buffer.from(arrayBuffer);

            // Parse the PDF
            const data = await pdfParse(buffer);
            manuscriptText = data.text;
          } catch (pdfError) {
            console.error("PDF parsing error:", pdfError);
            return NextResponse.json(
              { error: "Failed to parse PDF file" },
              { status: 500 }
            );
          }
        }
      }
    } else {
      // Regular JSON request
      formData = await req.json();
      manuscriptText = formData.manuscript || "";
    }

    // Add the parsed manuscript text to the payload
    const payload = {
      ...formData,
      manuscriptText,
    };

    console.log("===== payload ======", payload);

    // Make the external POST request
    const externalRes = await fetch(
      "https://querybot-api.onrender.com/jotform-webhook",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await externalRes.json();
    return NextResponse.json(data, { status: externalRes.status });
  } catch (error) {
    console.error("============== API Error ==============", error);
    // return NextResponse.json(
    //   { error: error instanceof Error ? error.message : "Unknown error" },
    //   { status: 500 }
    // );
  }
}

// Increase the request body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

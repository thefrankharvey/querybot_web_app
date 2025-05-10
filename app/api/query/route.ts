import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

// Define the structure of form data
interface QueryFormData {
  email: string;
  genre: string;
  subgenres: string[];
  specialAudience: string;
  targetAudience: string;
  comps: { title: string; author: string }[];
  themes: string;
  plotBeats: string;
  manuscriptText?: string; // Optional as it might come from file parsing
}

export async function POST(req: NextRequest) {
  try {
    let formData: QueryFormData;
    let manuscriptText = "";

    // Check if the request is multipart form-data (containing a file)
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const multipartFormData = await req.formData();

      // Extract the file and form data fields
      const file = multipartFormData.get("file") as File | null;

      console.log("File:", file);

      // Convert form data to JSON object
      formData = {
        email: multipartFormData.get("email") as string,
        genre: multipartFormData.get("genre") as string,
        subgenres: JSON.parse(
          (multipartFormData.get("subgenres") as string) || "[]"
        ),
        specialAudience: multipartFormData.get("specialAudience") as string,
        targetAudience: multipartFormData.get("targetAudience") as string,
        comps: JSON.parse((multipartFormData.get("comps") as string) || "[]"),
        themes: multipartFormData.get("themes") as string,
        plotBeats: multipartFormData.get("plotBeats") as string,
      };

      // Process the file if present
      if (file) {
        const fileType = file.type;

        // Handle different file types
        if (fileType === "application/pdf") {
          // Convert File to ArrayBuffer
          const arrayBuffer = await file.arrayBuffer();
          // Convert ArrayBuffer to Buffer for pdf-parse
          const buffer = Buffer.from(arrayBuffer);

          // Parse the PDF
          const data = await pdfParse(buffer);
          manuscriptText = data.text;
        } else if (
          fileType === "application/msword" ||
          fileType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          return NextResponse.json(
            { error: "Word document parsing not yet implemented" },
            { status: 501 }
          );
        } else if (file.size > 0) {
          return NextResponse.json(
            { error: `Unsupported file type: ${fileType}` },
            { status: 400 }
          );
        }
      }
    } else {
      // Regular JSON request
      formData = await req.json();
      manuscriptText = formData.manuscriptText || "";
    }

    // Add the parsed manuscript text to the payload
    const payload = {
      ...formData,
      manuscriptText,
    };
    console.log("Payload:", payload);

    // Make the external POST request
    // const externalRes = await fetch(
    //   "https://querybot-api.onrender.com/jotform-webhook",
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       // Authorization: `Bearer ${process.env.EXTERNAL_API_KEY}`,
    //     },
    //     body: JSON.stringify(payload),
    //   }
    // );

    // if (!externalRes.ok) {
    //   throw new Error(`External API error: ${externalRes.status}`);
    // }

    // const data = await externalRes.json();
    // return NextResponse.json(data, { status: externalRes.status });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Increase the request body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

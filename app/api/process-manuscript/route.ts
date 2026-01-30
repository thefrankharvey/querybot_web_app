import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
// @ts-expect-error No type declarations available for pdf-parse
import pdfParse from "pdf-parse/lib/pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const manuscript = formData.get("manuscript") as File | null;
    let manuscriptText = "";

    if (!manuscript) {
      return NextResponse.json({ text: "" });
    }

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
    } else if (
      manuscriptType.includes("word") ||
      manuscriptType.includes("docx")
    ) {
      // For now just return a placeholder for Word docs
      // Would need a Word document parser here
      manuscriptText = "Word document content extraction not implemented yet.";
    }

    return NextResponse.json({ text: manuscriptText });
  } catch (error) {
    console.error("Manuscript processing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Disable body parser for file handling
export const config = {
  api: {
    bodyParser: false,
  },
};

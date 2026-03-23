import { type NextRequest, NextResponse } from "next/server";
import {
  getProcessorForFile,
  ingestDocument,
  supportedExtensions,
} from "@/core/lib/ingestion";

export const maxDuration = 60;

/** Maximum upload size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: true, message: "No file provided." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: true, message: "File exceeds 10 MB limit." },
        { status: 400 },
      );
    }

    const processor = getProcessorForFile(file.name);
    if (!processor) {
      return NextResponse.json(
        {
          error: true,
          message: `Unsupported file type. Supported: ${supportedExtensions.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await processor.extract(buffer, file.name);

    if (extracted.chunks.length === 0) {
      return NextResponse.json(
        { error: true, message: "No content could be extracted from the file." },
        { status: 422 },
      );
    }

    const result = await ingestDocument(extracted);

    return NextResponse.json({
      success: true,
      filename: result.filename,
      chunksProcessed: result.chunksProcessed,
      embeddingsCount: result.embeddingsCount,
    });
  } catch (error: unknown) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: true, message: "Failed to process document." },
      { status: 500 },
    );
  }
}

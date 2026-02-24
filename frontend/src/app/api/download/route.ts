import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:9090";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch(`${BACKEND_URL}/api/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: err.message || "Backend download failed" },
        { status: response.status },
      );
    }

    // Stream the ZIP back to the browser
    const zipBuffer = await response.arrayBuffer();
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="dataset.zip"`,
      },
    });
  } catch (err: unknown) {
    console.error("[/api/download] Error:", err);
    return NextResponse.json(
      { error: "Failed to connect to backend service." },
      { status: 503 },
    );
  }
}

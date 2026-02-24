import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch(`${BACKEND_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Backend search failed" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[/api/search] Error:", err);
    return NextResponse.json(
      {
        error:
          "Failed to connect to backend service. Is the Ballerina server running?",
      },
      { status: 503 },
    );
  }
}

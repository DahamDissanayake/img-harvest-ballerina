import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:9090";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/api/refine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Backend returned non-JSON response" },
        { status: 502 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Refinement failed" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[/api/refine] Error:", err);
    return NextResponse.json(
      { error: "Failed to connect to backend service." },
      { status: 503 },
    );
  }
}

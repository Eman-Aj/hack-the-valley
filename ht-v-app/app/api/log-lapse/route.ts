import { NextResponse } from "next/server";
import { MOCK_MEMORY_LAPSES } from "../../../lib/mock-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, reportedBy, note } = body;

    if (!residentId || !note) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newLapse = {
      id: `lapse_${Date.now()}`,
      residentId,
      reportedBy: reportedBy || "staff",
      note,
      timestamp: Date.now(),
    };

    // Save to our centralized mock database
    MOCK_MEMORY_LAPSES.push(newLapse);

    return NextResponse.json({ 
      success: true, 
      message: "Memory lapse logged successfully",
      data: newLapse 
    });
  } catch (error) {
    console.error("Log Lapse Error:", error);
    return NextResponse.json(
      { error: "Failed to log memory lapse" }, 
      { status: 500 }
    );
  }
}
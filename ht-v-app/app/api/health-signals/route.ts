import { NextResponse } from "next/server";
import { evaluateHealthSignals } from "../../../lib/signal-engine";
import { MOCK_RESIDENTS, MOCK_OBSERVATIONS } from "../../../lib/mock-db";

export async function POST(req: Request) {
  try {
    const { residentId } = await req.json();
    
    const resident = MOCK_RESIDENTS.find(r => r.id === residentId);
    if (!resident) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 });
    }

    // Run the deterministic engine
    const signals = evaluateHealthSignals(resident, MOCK_OBSERVATIONS);

    return NextResponse.json({ 
      residentName: resident.preferredName,
      signals 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process health signals" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface VerificationPayload {
  num1: number;
  num2: number;
  userAnswer: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as VerificationPayload;
    const { num1, num2, userAnswer } = body;

    const botIndicators: string[] = [];
    const expected = num1 + num2;
    const passed = Number(userAnswer?.trim()) === expected;

    if (passed) {
      return NextResponse.json({
        success: true,
        score: 0.0,
        isBot: false,
        indicators: ["Trust verification: Solved sum of numbers challenge."],
        verdict: "HUMAN_VERIFIED",
        timestamp: Date.now()
      });
    } else {
      botIndicators.push(`Incorrect response: Entered "${userAnswer}", expected "${expected}"`);
      return NextResponse.json({
        success: true,
        score: 1.0,
        isBot: true,
        indicators: botIndicators,
        verdict: "AUTOMATED_BOT_DETECTED",
        timestamp: Date.now()
      });
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "Failed verifying math challenge"
    }, { status: 400 });
  }
}

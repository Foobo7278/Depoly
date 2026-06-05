import { NextRequest, NextResponse } from "next/server";
import { addToQueue, removeFromQueue, getMatch } from "@/lib/serverStore";
import { UserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, profile } = body as { action: "join" | "cancel"; profile?: UserProfile };

    if (!profile || !profile.id) {
      return NextResponse.json({ success: false, error: "Missing identity profile" }, { status: 400 });
    }

    if (action === "join") {
      addToQueue(profile.id, profile);
      return NextResponse.json({ success: true, status: "searching" });
    } else if (action === "cancel") {
      removeFromQueue(profile.id);
      return NextResponse.json({ success: true, status: "idle" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Match api issue:", err);
    return NextResponse.json({ success: false, error: "Match failure" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const matchObj = getMatch(userId);

    if (matchObj) {
      return NextResponse.json({
        success: true,
        status: "matched",
        match: matchObj,
      });
    }

    return NextResponse.json({
      success: true,
      status: "searching",
      match: null,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Queued state failure" }, { status: 500 });
  }
}

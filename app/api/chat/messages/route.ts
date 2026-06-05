import { NextRequest, NextResponse } from "next/server";
import { addMessageToMatch, endMatch, serverState, setTypingStatus } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, matchId, userId, message, senderId, senderName, text } = body;

    if (action === "disconnect") {
      endMatch(matchId, userId);
      return NextResponse.json({ success: true, status: "ended" });
    }

    if (action === "typing") {
      const { isTyping } = body;
      if (!matchId || !userId) {
        return NextResponse.json({ success: false, error: "Missing matchId or userId" }, { status: 400 });
      }
      setTypingStatus(matchId, userId, !!isTyping);
      return NextResponse.json({ success: true });
    }

    // Default is action "send"
    if (!matchId) {
      return NextResponse.json({ success: false, error: "Missing matchId" }, { status: 400 });
    }

    const newMsg = addMessageToMatch(matchId, senderId || userId, senderName || "Stranger", text || message);

    return NextResponse.json({
      success: true,
      message: newMsg,
    });
  } catch (err) {
    console.error("Message api key error:", err);
    return NextResponse.json({ success: false, error: "Messages handling failure" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json({ success: false, error: "Missing matchId" }, { status: 400 });
    }

    const matchObj = serverState.matches.get(matchId);
    if (!matchObj) {
      return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      messages: matchObj.messages,
      status: matchObj.status,
      endedBy: matchObj.endedBy,
      typingUsers: matchObj.typingUsers || {},
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Fetch message history failure" }, { status: 500 });
  }
}

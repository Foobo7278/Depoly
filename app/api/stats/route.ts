import { NextResponse } from "next/server";
import { getStats } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json({
      success: true,
      onlineUsers: stats.onlineUsers,
      chatsToday: stats.chatsToday,
      countriesCount: stats.countriesCount,
      messagesSentCount: stats.messagesSentCount,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Stats fetch failure" }, { status: 500 });
  }
}

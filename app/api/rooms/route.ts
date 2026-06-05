import { NextResponse } from "next/server";
import { getRooms } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rooms = getRooms();
    return NextResponse.json({
      success: true,
      rooms,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Rooms fetch failure" }, { status: 500 });
  }
}

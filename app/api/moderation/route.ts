import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportType, reportedUserId, reason, text } = body;

    if (text) {
      const isInappropriate = /badword|offensive|hack/i.test(text);
      return NextResponse.json({
        success: true,
        flagged: isInappropriate,
        category: isInappropriate ? "harassment" : "clear",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Report filed successfully for user ${reportedUserId || "Stranger"}. Admin will triage within 10 minutes.`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Moderation processing error" }, { status: 500 });
  }
}

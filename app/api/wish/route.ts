import { NextResponse } from "next/server";

import { submitWish } from "@/lib/services/wish-submission.service";
import type { WishRequestPayload } from "@/lib/types/wish";

export const runtime = "nodejs";

function getRequesterIp(request: Request): string | null {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    return first || null;
  }

  const xRealIp = request.headers.get("x-real-ip");
  return xRealIp?.trim() || null;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { ok: false, message: "Invalid request format." },
      { status: 415 },
    );
  }

  let payload: WishRequestPayload;
  try {
    payload = (await request.json()) as WishRequestPayload;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const result = await submitWish({
    payload,
    requesterIp: getRequesterIp(request),
  });

  if (result.ok) {
    return NextResponse.json({ ok: true, message: "Wish submitted." }, { status: 200 });
  }

  if (result.code === "invalid_input") {
    return NextResponse.json(
      { ok: false, message: "Please provide a valid wish." },
      { status: 400 },
    );
  }

  if (result.code === "captcha_failed") {
    return NextResponse.json(
      { ok: false, message: "Verification failed." },
      { status: 400 },
    );
  }

  if (result.code === "upstream_rejected") {
    return NextResponse.json(
      { ok: false, message: "Unable to submit right now." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: false, message: "Unexpected server error." }, { status: 500 });
}
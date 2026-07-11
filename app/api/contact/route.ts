import { NextRequest, NextResponse } from "next/server";

// TODO: connect a real email provider (e.g. Resend) using an API key
// stored in an environment variable. For now this endpoint validates
// the payload and returns success so the form works end-to-end.
export async function POST(req: NextRequest) {
  const data = await req.formData();
  const name = data.get("name");
  const email = data.get("email");
  const message = data.get("message");

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // console.log for now — replace with actual email send.
  console.log("New contact request:", { name, email, message });

  return NextResponse.json({ ok: true });
}

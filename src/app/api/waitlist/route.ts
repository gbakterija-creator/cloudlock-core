import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const logEntry = `${new Date().toISOString()} - ${email}\n`;
    const logPath = path.join(process.cwd(), "waitlist.txt");
    fs.appendFileSync(logPath, logEntry);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
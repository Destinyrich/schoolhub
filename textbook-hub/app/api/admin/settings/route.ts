import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

// The admin can change the fee (and anything else) at will from here.
export async function PATCH(req: Request) {
  const body = await req.json();
  await updateSettings(body);
  const settings = await getSettings();
  return NextResponse.json(settings);
}

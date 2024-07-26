import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
	const { promptId, apiKey } = z.object({ promptId: z.string(), apiKey: z.string() }).parse(await request.json());
	return NextResponse.json({ success: true });
}

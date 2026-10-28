import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const RunSchema = z.object({
  name: z.string().min(1).max(40),
  patron: z.enum(["fiend", "goo", "archfey", "hexblade"]),
  floor: z.number().int().min(1).max(5),
  kills: z.number().int().min(0).max(999),
  gold: z.number().int().min(0).max(999999),
  score: z.number().int().min(0).max(999999),
  victory: z.boolean(),
  cause: z.string().max(200).optional(),
});

export async function GET() {
  try {
    const runs = await db.run.findMany({
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      take: 12,
    });
    return NextResponse.json({ runs });
  } catch (error) {
    console.error("GET /api/runs failed", error);
    return NextResponse.json({ runs: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RunSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid run data" }, { status: 400 });
    }
    const run = await db.run.create({ data: parsed.data });
    return NextResponse.json({ run }, { status: 201 });
  } catch (error) {
    console.error("POST /api/runs failed", error);
    return NextResponse.json({ error: "Could not record the run" }, { status: 500 });
  }
}

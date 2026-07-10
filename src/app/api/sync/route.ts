import { db, hasDatabase } from "@/db";
import { learnerSync, type LearningSnapshot } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SyncBody = {
  deviceId?: string;
  playerName?: string;
  avatar?: string;
  snapshot?: LearningSnapshot;
};

const memoryStore = globalThis as typeof globalThis & {
  __luthsPlaygroundMemorySync?: Map<string, { playerName: string; avatar: string; version: number; snapshot: LearningSnapshot; updatedAt: string }>;
};

function store() {
  memoryStore.__luthsPlaygroundMemorySync ??= new Map();
  return memoryStore.__luthsPlaygroundMemorySync;
}

export async function GET(request: Request) {
  const deviceId = new URL(request.url).searchParams.get("deviceId")?.trim();
  if (!deviceId || deviceId.length > 100) {
    return NextResponse.json({ error: "A valid device ID is required." }, { status: 400 });
  }

  if (!hasDatabase || !db) {
    const saved = store().get(deviceId);
    if (!saved) return NextResponse.json({ found: false, demoMode: true });
    return NextResponse.json({ found: true, demoMode: true, ...saved });
  }

  const [saved] = await db.select().from(learnerSync).where(eq(learnerSync.deviceId, deviceId)).limit(1);
  if (!saved) return NextResponse.json({ found: false });

  return NextResponse.json({
    found: true,
    playerName: saved.playerName,
    avatar: saved.avatar,
    version: saved.version,
    snapshot: saved.snapshot,
    updatedAt: saved.updatedAt,
  });
}

export async function POST(request: Request) {
  let body: SyncBody;
  try {
    body = (await request.json()) as SyncBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const deviceId = body.deviceId?.trim();
  const playerName = body.playerName?.trim().slice(0, 24) || "Player";
  const avatar = body.avatar?.slice(0, 8) || "🧑‍🚀";
  const snapshot = body.snapshot;

  if (!deviceId || deviceId.length > 100 || !snapshot || typeof snapshot.xp !== "number") {
    return NextResponse.json({ error: "Invalid sync payload." }, { status: 400 });
  }

  if (!hasDatabase || !db) {
    const current = store().get(deviceId);
    const next = {
      playerName,
      avatar,
      snapshot,
      version: (current?.version || 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    store().set(deviceId, next);
    return NextResponse.json({ ok: true, demoMode: true, version: next.version, updatedAt: next.updatedAt });
  }

  const [saved] = await db
    .insert(learnerSync)
    .values({ deviceId, playerName, avatar, snapshot })
    .onConflictDoUpdate({
      target: learnerSync.deviceId,
      set: {
        playerName,
        avatar,
        snapshot,
        version: sql`${learnerSync.version} + 1`,
        updatedAt: new Date(),
      },
    })
    .returning({ version: learnerSync.version, updatedAt: learnerSync.updatedAt });

  return NextResponse.json({ ok: true, version: saved.version, updatedAt: saved.updatedAt });
}

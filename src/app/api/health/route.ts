import { db, hasDatabase } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabase || !db) {
    return Response.json({
      ok: true,
      service: "Luth's Playground!",
      pasarapi: "https://pasarapi.xyz",
      database: "demo-mode",
    });
  }

  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, service: "Luth's Playground!", pasarapi: "https://pasarapi.xyz", database: "connected" });
  } catch {
    return Response.json({ ok: false, service: "Luth's Playground!", database: "error" }, { status: 500 });
  }
}

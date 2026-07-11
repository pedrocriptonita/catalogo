import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health check simples: app de pé + conexão com o banco.
 * GET /api/health → { status: "ok", db: true }
 */
export async function GET() {
  try {
    await prisma.$queryRaw`select 1`;
    return NextResponse.json({ status: "ok", db: true });
  } catch (error) {
    console.error("[health] falha na conexão com o banco:", error);
    return NextResponse.json({ status: "degraded", db: false }, { status: 503 });
  }
}

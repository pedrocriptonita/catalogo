// Aplica supabase/rls.sql no banco usando a conexão de sessão (DIRECT_URL).
// Uso: node scripts/apply-rls.mjs
import "dotenv/config";
import { readFileSync } from "node:fs";
import pg from "pg";

const sql = readFileSync(new URL("../supabase/rls.sql", import.meta.url), "utf8");

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL,
  connectionTimeoutMillis: 10000,
});

try {
  await client.connect();
  await client.query(sql);
  console.log("✅ RLS aplicada com sucesso (tabelas + storage).");
} catch (err) {
  console.error("❌ Falha ao aplicar RLS:", err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

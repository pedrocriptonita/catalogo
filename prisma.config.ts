import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // O CLI (migrate/studio) precisa de conexão de sessão (porta 5432).
    // O app em runtime usa DATABASE_URL (pooler transaction, 6543) — ver lib/prisma.ts.
    url: env("DIRECT_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});

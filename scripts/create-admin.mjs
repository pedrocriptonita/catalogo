// Registra um usuário do Supabase Auth na tabela `admins`.
// Pré-requisito: criar o usuário no Dashboard (Authentication → Users →
// Add user → e-mail + senha, com "Auto Confirm User" marcado).
//
// Uso: node scripts/create-admin.mjs email@exemplo.com "Nome do Admin"
import "dotenv/config";
import { randomBytes } from "node:crypto";
import pg from "pg";

const [email, name] = process.argv.slice(2);

if (!email) {
  console.error('Uso: node scripts/create-admin.mjs email@exemplo.com "Nome do Admin"');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL,
  connectionTimeoutMillis: 10000,
});

// cuid simples para o id (mesmo formato de comprimento usado pelo Prisma)
const cuid = `c${randomBytes(12).toString("hex")}`;

try {
  await client.connect();

  const { rows } = await client.query(
    "select id, email from auth.users where lower(email) = lower($1) limit 1",
    [email]
  );

  if (rows.length === 0) {
    console.error(
      `❌ Nenhum usuário com e-mail "${email}" encontrado no Supabase Auth.\n` +
        "Crie primeiro no Dashboard: Authentication → Users → Add user."
    );
    process.exit(1);
  }

  const user = rows[0];

  const result = await client.query(
    `insert into public.admins (id, auth_id, email, name, created_at, updated_at)
     values ($1, $2, $3, $4, now(), now())
     on conflict (auth_id) do update set deleted_at = null, updated_at = now()
     returning id`,
    [cuid, user.id, user.email, name ?? null]
  );

  console.log(`✅ Admin registrado: ${user.email} (admins.id = ${result.rows[0].id})`);
} catch (err) {
  console.error("❌ Falha ao registrar admin:", err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

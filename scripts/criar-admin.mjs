// Cria o primeiro usuário administrador. Idempotente: se o e-mail já existir, não faz nada.
// A senha não fica no histórico nem no código: é passada por variável de ambiente na hora da execução.
//
// Uso (PowerShell):
//   $env:DATABASE_URL="..."; $env:ADMIN_EMAIL="voce@exemplo.com"; $env:ADMIN_NOME="Seu nome"; $env:ADMIN_SENHA="..."
//   node scripts/criar-admin.mjs
import pg from "pg";
import bcrypt from "bcryptjs";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_NOME, ADMIN_SENHA } = process.env;

if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_NOME || !ADMIN_SENHA) {
  console.error("Defina DATABASE_URL, ADMIN_EMAIL, ADMIN_NOME e ADMIN_SENHA.");
  process.exit(1);
}
if (ADMIN_SENHA.length < 10) {
  console.error("A senha deve ter pelo menos 10 caracteres.");
  process.exit(1);
}

const email = ADMIN_EMAIL.trim().toLowerCase();
const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  const existe = await client.query("select 1 from usuarios where email = $1", [email]);
  if (existe.rowCount > 0) {
    console.log("Já existe um usuário com esse e-mail. Nada foi alterado.");
  } else {
    const senhaHash = await bcrypt.hash(ADMIN_SENHA, 12);
    await client.query(
      "insert into usuarios (nome, email, senha_hash, perfil) values ($1, $2, $3, 'administrador')",
      [ADMIN_NOME.trim(), email, senhaHash]
    );
    console.log("Administrador criado.");
  }
} finally {
  await client.end();
}

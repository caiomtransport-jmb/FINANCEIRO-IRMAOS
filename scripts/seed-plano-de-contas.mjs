// Cria os três grupos fixos do plano de contas (Receita, Custo, Despesa).
// É idempotente: rodar de novo não duplica nada.
// Uso: DATABASE_URL=... node scripts/seed-plano-de-contas.mjs
import pg from "pg";

const GRUPOS = [
  { nome: "Receita", grupo: "receita" },
  { nome: "Custo", grupo: "custo" },
  { nome: "Despesa", grupo: "despesa" },
];

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não definida.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  for (const { nome, grupo } of GRUPOS) {
    const existe = await client.query(
      "select 1 from categorias where grupo = $1 and pai_id is null limit 1",
      [grupo]
    );
    if (existe.rowCount > 0) {
      console.log(`já existe: ${nome}`);
      continue;
    }
    await client.query(
      "insert into categorias (nome, grupo, pai_id) values ($1, $2, null)",
      [nome, grupo]
    );
    console.log(`criado: ${nome}`);
  }
} finally {
  await client.end();
}

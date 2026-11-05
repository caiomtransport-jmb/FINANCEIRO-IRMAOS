import { defineConfig } from "drizzle-kit";

// A URL do banco vem de DATABASE_URL (Supabase ou Neon). Não é necessária para gerar migrações.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});

"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categorias } from "@/db/schema";
import { lerSessao } from "@/lib/auth";

export type EstadoCategoria = { ok: boolean; erro?: string };

const GRUPOS_FIXOS = ["receita", "custo", "despesa"] as const;
type Grupo = (typeof GRUPOS_FIXOS)[number];

export async function criarCategoria(_anterior: EstadoCategoria, formData: FormData): Promise<EstadoCategoria> {
  const sessao = await lerSessao();
  if (!sessao) return { ok: false, erro: "Sessão expirada. Entre novamente." };

  const nome = String(formData.get("nome") ?? "").trim();
  const destino = String(formData.get("destino") ?? ""); // "g:receita" ou "c:<uuid>"

  if (!nome) return { ok: false, erro: "Informe o nome da categoria." };

  let grupo: Grupo;
  let paiId: string | null = null;

  if (destino.startsWith("g:")) {
    const g = destino.slice(2);
    if (!(GRUPOS_FIXOS as readonly string[]).includes(g)) return { ok: false, erro: "Grupo inválido." };
    grupo = g as Grupo;
  } else if (destino.startsWith("c:")) {
    // O grupo é herdado do pai, para que a DRE sempre some certo.
    const [pai] = await db
      .select({ id: categorias.id, grupo: categorias.grupo })
      .from(categorias)
      .where(eq(categorias.id, destino.slice(2)))
      .limit(1);
    if (!pai) return { ok: false, erro: "A categoria pai não existe mais." };
    grupo = pai.grupo;
    paiId = pai.id;
  } else {
    return { ok: false, erro: "Escolha onde a categoria fica." };
  }

  await db.insert(categorias).values({ nome, grupo, paiId });
  revalidatePath("/plano-de-contas");
  return { ok: true };
}

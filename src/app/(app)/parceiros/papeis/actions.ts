"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { papeis } from "@/db/schema";
import { exigirAdministrador, ehErroDeDuplicidade, ehErroDeVinculo } from "@/lib/permissoes";

export type EstadoPapel = { ok: boolean; erro?: string };

// Cadastrar e excluir papéis é decisão do administrador.
export async function criarPapel(_anterior: EstadoPapel, formData: FormData): Promise<EstadoPapel> {
  const sessao = await exigirAdministrador();
  if (!sessao.ok) return { ok: false, erro: sessao.erro };

  const nome = String(formData.get("nome") ?? "").trim().replace(/\s+/g, " ");
  if (nome.length < 2) return { ok: false, erro: "Informe o nome do papel (mínimo 2 letras)." };

  try {
    await db.insert(papeis).values({ nome });
  } catch (erro) {
    if (ehErroDeDuplicidade(erro)) return { ok: false, erro: `Já existe o papel "${nome}".` };
    throw erro;
  }

  revalidatePath("/parceiros");
  revalidatePath("/parceiros/papeis");
  return { ok: true };
}

export async function excluirPapel(_anterior: EstadoPapel, formData: FormData): Promise<EstadoPapel> {
  const sessao = await exigirAdministrador();
  if (!sessao.ok) return { ok: false, erro: sessao.erro };

  const id = String(formData.get("id") ?? "");
  try {
    await db.delete(papeis).where(eq(papeis.id, id));
  } catch (erro) {
    // Papel em uso por algum parceiro não é apagado, para não perder o vínculo.
    if (ehErroDeVinculo(erro)) {
      return { ok: false, erro: "Este papel está em uso por parceiros. Remova-o dos parceiros antes de excluir." };
    }
    throw erro;
  }

  revalidatePath("/parceiros");
  revalidatePath("/parceiros/papeis");
  return { ok: true };
}

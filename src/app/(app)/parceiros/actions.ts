"use server";

import { revalidatePath } from "next/cache";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { papeis, parceiroPapeis, parceiros } from "@/db/schema";
import { exigirSessao, ehErroDeDuplicidade } from "@/lib/permissoes";

export type EstadoParceiro = { ok: boolean; erro?: string };

export async function criarParceiro(_anterior: EstadoParceiro, formData: FormData): Promise<EstadoParceiro> {
  const sessao = await exigirSessao();
  if (!sessao.ok) return { ok: false, erro: sessao.erro };

  const nome = String(formData.get("nome") ?? "").trim();
  const documento = String(formData.get("documento") ?? "").replace(/\D/g, "") || null;
  const limiar = Number(String(formData.get("limiarInadimplenciaDias") ?? "1").trim());
  // Papéis vêm do catálogo cadastrado pelo administrador; só IDs existentes são aceitos.
  const idsPapeis = [...new Set(formData.getAll("papeis").map(String).filter(Boolean))];

  if (!nome) return { ok: false, erro: "Informe o nome do parceiro." };
  if (idsPapeis.length === 0) return { ok: false, erro: "Escolha ao menos um papel para o parceiro." };
  if (documento && documento.length !== 11 && documento.length !== 14) {
    return { ok: false, erro: "CPF deve ter 11 dígitos e CNPJ, 14. Deixe em branco se não tiver." };
  }
  if (!Number.isInteger(limiar) || limiar < 0 || limiar > 3650) {
    return { ok: false, erro: "Limiar de inadimplência deve ser um número de dias entre 0 e 3650." };
  }

  const existentes = await db.select({ id: papeis.id }).from(papeis).where(inArray(papeis.id, idsPapeis));
  if (existentes.length !== idsPapeis.length) {
    return { ok: false, erro: "Um dos papéis escolhidos não existe mais. Atualize a página." };
  }

  try {
    await db.transaction(async (tx) => {
      const [criado] = await tx
        .insert(parceiros)
        .values({ nome, documento, limiarInadimplenciaDias: limiar })
        .returning({ id: parceiros.id });

      await tx.insert(parceiroPapeis).values(idsPapeis.map((papelId) => ({ parceiroId: criado.id, papelId })));
    });
  } catch (erro) {
    if (ehErroDeDuplicidade(erro)) return { ok: false, erro: "Já existe um parceiro com esse CPF/CNPJ." };
    throw erro;
  }

  revalidatePath("/parceiros");
  return { ok: true };
}

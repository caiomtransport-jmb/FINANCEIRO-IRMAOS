"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { motoristas } from "@/db/schema";
import { exigirSessao, ehErroDeDuplicidade } from "@/lib/permissoes";

export type EstadoMotorista = { ok: boolean; erro?: string };

export async function criarMotorista(_anterior: EstadoMotorista, formData: FormData): Promise<EstadoMotorista> {
  const sessao = await exigirSessao();
  if (!sessao.ok) return { ok: false, erro: sessao.erro };

  const nome = String(formData.get("nome") ?? "").trim();
  const documento = String(formData.get("documento") ?? "").replace(/\D/g, "") || null;
  const cnh = String(formData.get("cnh") ?? "").trim().toUpperCase() || null;
  const telefone = String(formData.get("telefone") ?? "").trim() || null;

  if (!nome) return { ok: false, erro: "Informe o nome do motorista." };
  if (documento && documento.length !== 11) return { ok: false, erro: "CPF deve ter 11 dígitos. Deixe em branco se não tiver." };

  try {
    await db.insert(motoristas).values({ nome, documento, cnh, telefone });
  } catch (erro) {
    if (ehErroDeDuplicidade(erro)) return { ok: false, erro: "Já existe um motorista com esse CPF." };
    throw erro;
  }

  revalidatePath("/motoristas");
  revalidatePath("/veiculos");
  return { ok: true };
}

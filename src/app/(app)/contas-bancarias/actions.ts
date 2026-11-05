"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contasBancarias } from "@/db/schema";
import { exigirAdministrador, exigirSessao, ehErroDeVinculo } from "@/lib/permissoes";
import { normalizarValor } from "@/lib/dinheiro";

export type EstadoConta = { ok: boolean; erro?: string };

type Dados = { nome: string; banco: string | null; agencia: string | null; numeroConta: string | null; saldoInicial: string };

// Lê e valida os campos do formulário, usado por criar e editar.
function lerDados(formData: FormData): { dados?: Dados; erro?: string } {
  const nome = String(formData.get("nome") ?? "").trim();
  const banco = String(formData.get("banco") ?? "").trim() || null;
  const agencia = String(formData.get("agencia") ?? "").trim() || null;
  const numeroConta = String(formData.get("numeroConta") ?? "").trim() || null;
  // Saldo inicial pode ser negativo (conta no cheque especial, por exemplo).
  const saldoInicial = normalizarValor(String(formData.get("saldoInicial") ?? ""));

  if (!nome) return { erro: "Informe o nome da conta." };
  if (saldoInicial === null) return { erro: "Saldo inicial inválido. Exemplos: 1500,00 ou -320,50." };
  return { dados: { nome, banco, agencia, numeroConta, saldoInicial } };
}

export async function criarContaBancaria(_anterior: EstadoConta, formData: FormData): Promise<EstadoConta> {
  const sessao = await exigirSessao();
  if (!sessao.ok) return { ok: false, erro: sessao.erro };

  const { dados, erro } = lerDados(formData);
  if (!dados) return { ok: false, erro };

  await db.insert(contasBancarias).values(dados);
  revalidatePath("/contas-bancarias");
  return { ok: true };
}

export async function atualizarContaBancaria(_anterior: EstadoConta, formData: FormData): Promise<EstadoConta> {
  const sessao = await exigirSessao();
  if (!sessao.ok) return { ok: false, erro: sessao.erro };

  const id = String(formData.get("id") ?? "");
  const { dados, erro } = lerDados(formData);
  if (!dados) return { ok: false, erro };

  await db.update(contasBancarias).set({ ...dados, atualizadoEm: new Date() }).where(eq(contasBancarias.id, id));
  revalidatePath("/contas-bancarias");
  return { ok: true };
}

export async function excluirContaBancaria(_anterior: EstadoConta, formData: FormData): Promise<EstadoConta> {
  // Exclusão é só do administrador.
  const sessao = await exigirAdministrador();
  if (!sessao.ok) return { ok: false, erro: sessao.erro };

  const id = String(formData.get("id") ?? "");
  try {
    await db.delete(contasBancarias).where(eq(contasBancarias.id, id));
  } catch (erro) {
    if (ehErroDeVinculo(erro)) {
      return { ok: false, erro: "Esta conta tem lançamentos e não pode ser excluída." };
    }
    throw erro;
  }

  revalidatePath("/contas-bancarias");
  return { ok: true };
}

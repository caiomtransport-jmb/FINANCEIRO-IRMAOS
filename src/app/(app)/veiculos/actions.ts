"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { motoristas, veiculos, vinculosMotorista } from "@/db/schema";
import { exigirSessao, ehErroDeDuplicidade } from "@/lib/permissoes";

export type EstadoVeiculo = { ok: boolean; erro?: string };

const PROPRIEDADES = ["proprio", "arrendado", "terceiro"] as const;
type Propriedade = (typeof PROPRIEDADES)[number];

const MOTIVOS = ["designacao_inicial", "troca_de_veiculo", "remanejamento"] as const;
type Motivo = (typeof MOTIVOS)[number];

const PLACA_REGEX = /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/; // formato antigo (ABC-1234) e Mercosul (ABC1D23)

export async function criarVeiculo(_anterior: EstadoVeiculo, formData: FormData): Promise<EstadoVeiculo> {
  const sessao = await exigirSessao();
  if (!sessao.ok) return { ok: false, erro: sessao.erro };

  const placa = String(formData.get("placa") ?? "").trim().toUpperCase();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const propriedade = String(formData.get("propriedade") ?? "proprio");

  if (!PLACA_REGEX.test(placa)) return { ok: false, erro: "Placa inválida. Use ABC-1234 ou ABC1D23." };
  if (!descricao) return { ok: false, erro: "Descreva o veículo, por exemplo: Caminhão Volvo FH 2019." };
  if (!(PROPRIEDADES as readonly string[]).includes(propriedade)) return { ok: false, erro: "Propriedade inválida." };

  try {
    await db.insert(veiculos).values({ placa, descricao, propriedade: propriedade as Propriedade });
  } catch (erro) {
    if (ehErroDeDuplicidade(erro)) return { ok: false, erro: `Já existe um veículo com a placa ${placa}.` };
    throw erro;
  }

  revalidatePath("/veiculos");
  return { ok: true };
}

// Vincula um motorista a um veículo. Se o motorista estava em outro veículo, aquele vínculo é encerrado
// (ele "pegou outro veículo" ou foi remanejado). Se o veículo já tinha motorista, o anterior sai.
export async function vincularMotorista(_anterior: EstadoVeiculo, formData: FormData): Promise<EstadoVeiculo> {
  const sessao = await exigirSessao();
  if (!sessao.ok) return { ok: false, erro: sessao.erro };

  const veiculoId = String(formData.get("veiculoId") ?? "");
  const motoristaId = String(formData.get("motoristaId") ?? "");
  const motivoBruto = String(formData.get("motivo") ?? "designacao_inicial");

  if (!veiculoId || !motoristaId) return { ok: false, erro: "Escolha o motorista." };
  if (!(MOTIVOS as readonly string[]).includes(motivoBruto)) return { ok: false, erro: "Motivo inválido." };
  const motivo = motivoBruto as Motivo;

  const [motorista] = await db
    .select({ id: motoristas.id, status: motoristas.status })
    .from(motoristas)
    .where(eq(motoristas.id, motoristaId))
    .limit(1);
  if (!motorista) return { ok: false, erro: "Motorista não encontrado." };
  if (motorista.status !== "ativo") return { ok: false, erro: "Motorista inativo não pode ser vinculado." };

  const agora = new Date();
  await db.transaction(async (tx) => {
    // Encerra o vínculo atual do motorista (em outro veículo) e o do veículo (outro motorista).
    await tx
      .update(vinculosMotorista)
      .set({ fim: agora, atualizadoEm: agora })
      .where(and(eq(vinculosMotorista.motoristaId, motoristaId), isNull(vinculosMotorista.fim)));
    await tx
      .update(vinculosMotorista)
      .set({ fim: agora, atualizadoEm: agora })
      .where(and(eq(vinculosMotorista.veiculoId, veiculoId), isNull(vinculosMotorista.fim)));

    await tx.insert(vinculosMotorista).values({ motoristaId, veiculoId, motivo, inicio: agora });
  });

  revalidatePath("/veiculos");
  revalidatePath("/motoristas");
  return { ok: true };
}

// Libera o veículo: encerra o vínculo do motorista atual, sem colocar outro no lugar.
export async function liberarVeiculo(_anterior: EstadoVeiculo, formData: FormData): Promise<EstadoVeiculo> {
  const sessao = await exigirSessao();
  if (!sessao.ok) return { ok: false, erro: sessao.erro };

  const veiculoId = String(formData.get("veiculoId") ?? "");
  const agora = new Date();
  await db
    .update(vinculosMotorista)
    .set({ fim: agora, atualizadoEm: agora })
    .where(and(eq(vinculosMotorista.veiculoId, veiculoId), isNull(vinculosMotorista.fim)));

  revalidatePath("/veiculos");
  revalidatePath("/motoristas");
  return { ok: true };
}

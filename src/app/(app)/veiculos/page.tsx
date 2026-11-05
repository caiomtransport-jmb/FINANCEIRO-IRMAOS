import { Suspense } from "react";
import { connection } from "next/server";
import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { motoristas, veiculos, vinculosMotorista } from "@/db/schema";
import { Cartao, Etiqueta, Pagina, Vazio } from "@/components/ui";
import { FormularioVeiculo } from "./formulario";
import { VinculoMotorista, type MotoristaOpcao } from "./vinculo";

const ROTULO_PROPRIEDADE: Record<string, { rotulo: string; tom: "verde" | "azul" | "ambar" }> = {
  proprio: { rotulo: "Próprio", tom: "verde" },
  arrendado: { rotulo: "Arrendado", tom: "azul" },
  terceiro: { rotulo: "De terceiro", tom: "ambar" },
};

export default function VeiculosPage() {
  return (
    <Pagina titulo="Veículos" descricao="A frota, com a propriedade de cada veículo e quem está dirigindo.">
      <FormularioVeiculo />
      <Suspense fallback={<p className="text-sm text-zinc-500">Carregando frota...</p>}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}

async function Conteudo() {
  await connection();

  const [lista, ativos, motoristasAtivos] = await Promise.all([
    db.select().from(veiculos).orderBy(asc(veiculos.placa)),
    db
      .select({ veiculoId: vinculosMotorista.veiculoId, motoristaId: vinculosMotorista.motoristaId, nome: motoristas.nome })
      .from(vinculosMotorista)
      .innerJoin(motoristas, eq(vinculosMotorista.motoristaId, motoristas.id))
      .where(isNull(vinculosMotorista.fim)),
    db.select().from(motoristas).where(eq(motoristas.status, "ativo")).orderBy(asc(motoristas.nome)),
  ]);

  // Para cada motorista, em qual veículo ele está hoje (se estiver em algum).
  const opcoesMotorista: MotoristaOpcao[] = motoristasAtivos.map((m) => {
    const vinc = ativos.find((a) => a.motoristaId === m.id);
    const placa = vinc ? lista.find((v) => v.id === vinc.veiculoId)?.placa ?? null : null;
    return { id: m.id, nome: m.nome, veiculoAtual: placa };
  });

  if (lista.length === 0) {
    return <Vazio titulo="Nenhum veículo cadastrado" descricao="Cadastre o primeiro veículo acima." />;
  }

  return (
    <Cartao titulo={`Frota (${lista.length})`}>
      <ul className="divide-y divide-zinc-100">
        {lista.map((v) => {
          const prop = ROTULO_PROPRIEDADE[v.propriedade];
          const atual = ativos.find((a) => a.veiculoId === v.id)?.nome ?? null;
          return (
            <li key={v.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 font-mono text-sm font-semibold tracking-wider text-zinc-800">
                    {v.placa}
                  </span>
                  <p className="text-sm text-zinc-900">{v.descricao}</p>
                </div>
                <Etiqueta tom={prop.tom}>{prop.rotulo}</Etiqueta>
              </div>
              <VinculoMotorista
                veiculoId={v.id}
                motoristaAtual={atual}
                motoristas={opcoesMotorista}
              />
            </li>
          );
        })}
      </ul>
    </Cartao>
  );
}

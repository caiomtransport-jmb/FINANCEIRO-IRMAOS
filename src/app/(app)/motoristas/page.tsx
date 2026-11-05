import { Suspense } from "react";
import { connection } from "next/server";
import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { motoristas, vinculosMotorista, veiculos } from "@/db/schema";
import { Cartao, Etiqueta, Pagina, Vazio } from "@/components/ui";
import { FormularioMotorista } from "./formulario";

export default function MotoristasPage() {
  return (
    <Pagina titulo="Motoristas" descricao="Quem dirige a frota, e em qual veículo está no momento.">
      <FormularioMotorista />
      <Suspense fallback={<p className="text-sm text-zinc-500">Carregando motoristas...</p>}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}

async function Conteudo() {
  await connection();

  const [lista, vinculosAtivos] = await Promise.all([
    db.select().from(motoristas).orderBy(asc(motoristas.nome)),
    db
      .select({ motoristaId: vinculosMotorista.motoristaId, placa: veiculos.placa, descricao: veiculos.descricao })
      .from(vinculosMotorista)
      .innerJoin(veiculos, eq(vinculosMotorista.veiculoId, veiculos.id))
      .where(isNull(vinculosMotorista.fim)),
  ]);

  if (lista.length === 0) {
    return <Vazio titulo="Nenhum motorista cadastrado" descricao="Cadastre o primeiro acima." />;
  }

  return (
    <Cartao titulo={`Motoristas (${lista.length})`}>
      <ul className="divide-y divide-zinc-100">
        {lista.map((m) => {
          const atual = vinculosAtivos.find((v) => v.motoristaId === m.id);
          return (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-zinc-900">{m.nome}</p>
                <p className="text-sm text-zinc-500">
                  {[m.cnh && `CNH ${m.cnh}`, m.telefone].filter(Boolean).join(" · ") || "Sem CNH ou telefone"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {atual ? (
                  <Etiqueta tom="verde">
                    {atual.placa} · {atual.descricao}
                  </Etiqueta>
                ) : (
                  <Etiqueta tom="neutro">Sem veículo</Etiqueta>
                )}
                <Etiqueta tom={m.status === "ativo" ? "azul" : "neutro"}>{m.status === "ativo" ? "Ativo" : "Inativo"}</Etiqueta>
              </div>
            </li>
          );
        })}
      </ul>
    </Cartao>
  );
}

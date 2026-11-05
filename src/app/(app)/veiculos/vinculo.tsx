"use client";

import { useActionState, useState } from "react";
import { liberarVeiculo, vincularMotorista, type EstadoVeiculo } from "./actions";
import { Alerta, Botao } from "@/components/ui";

export type MotoristaOpcao = { id: string; nome: string; veiculoAtual: string | null };

const estadoInicial: EstadoVeiculo = { ok: false };

const MOTIVOS = [
  { valor: "designacao_inicial", rotulo: "Designação inicial" },
  { valor: "troca_de_veiculo", rotulo: "Troca de veículo" },
  { valor: "remanejamento", rotulo: "Remanejamento" },
];

export function VinculoMotorista({
  veiculoId,
  motoristaAtual,
  motoristas,
}: {
  veiculoId: string;
  motoristaAtual: string | null;
  motoristas: MotoristaOpcao[];
}) {
  const [estado, acao, pendente] = useActionState(vincularMotorista, estadoInicial);
  const [estadoLiberacao, acaoLiberar, pendenteLiberacao] = useActionState(liberarVeiculo, estadoInicial);
  const [motorista, setMotorista] = useState("");
  const [editando, setEditando] = useState(false);

  // Fecha o modo de edição quando o vínculo for gravado (ajuste de estado durante a renderização).
  const [estadoVisto, setEstadoVisto] = useState(estado);
  if (estado !== estadoVisto) {
    setEstadoVisto(estado);
    if (estado.ok) setEditando(false);
  }

  const erro = estado.erro ?? estadoLiberacao.erro;

  return (
    <div className="mt-2 w-full text-sm">
      {!editando ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-zinc-500">Motorista:</span>
          <span className={motoristaAtual ? "font-medium text-zinc-900" : "text-zinc-400"}>
            {motoristaAtual ?? "Nenhum no momento"}
          </span>
          <Botao type="button" variante="secundario" className="px-3 py-1" onClick={() => setEditando(true)}>
            {motoristaAtual ? "Trocar motorista" : "Vincular motorista"}
          </Botao>
          {motoristaAtual && (
            <form action={acaoLiberar}>
              <input type="hidden" name="veiculoId" value={veiculoId} />
              <Botao type="submit" variante="secundario" disabled={pendenteLiberacao} className="px-3 py-1 text-zinc-600">
                Liberar veículo
              </Botao>
            </form>
          )}
        </div>
      ) : (
        <form action={acao} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="veiculoId" value={veiculoId} />
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-600">Motorista</span>
            <select
              name="motoristaId"
              required
              value={motorista}
              onChange={(e) => setMotorista(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-marca focus:ring-2 focus:ring-marca/20 focus:outline-none"
            >
              <option value="" disabled>
                Selecione...
              </option>
              {motoristas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                  {m.veiculoAtual ? ` (hoje em ${m.veiculoAtual})` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-600">Motivo</span>
            <select
              name="motivo"
              defaultValue="designacao_inicial"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-marca focus:ring-2 focus:ring-marca/20 focus:outline-none"
            >
              {MOTIVOS.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.rotulo}
                </option>
              ))}
            </select>
          </label>
          <Botao type="submit" disabled={pendente || !motorista}>
            {pendente ? "Salvando..." : "Confirmar"}
          </Botao>
          <Botao type="button" variante="secundario" onClick={() => setEditando(false)}>
            Cancelar
          </Botao>
        </form>
      )}

      {erro && (
        <div className="mt-2">
          <Alerta tipo="erro">{erro}</Alerta>
        </div>
      )}
    </div>
  );
}

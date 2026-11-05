"use client";

import { useActionState, useState } from "react";
import { atualizarContaBancaria, excluirContaBancaria, type EstadoConta } from "./actions";
import { Alerta, Botao, Campo, Dinheiro, campo } from "@/components/ui";

export type ContaLinha = {
  id: string;
  nome: string;
  banco: string | null;
  agencia: string | null;
  numeroConta: string | null;
  saldoInicial: string;
};

const estadoInicial: EstadoConta = { ok: false };

export function ListaContas({ contas, podeExcluir }: { contas: ContaLinha[]; podeExcluir: boolean }) {
  return (
    <ul className="divide-y divide-zinc-100">
      {contas.map((c) => (
        <ItemConta key={c.id} conta={c} podeExcluir={podeExcluir} />
      ))}
    </ul>
  );
}

function ItemConta({ conta, podeExcluir }: { conta: ContaLinha; podeExcluir: boolean }) {
  const [editando, setEditando] = useState(false);
  const [estadoEdicao, acaoEdicao, pendenteEdicao] = useActionState(atualizarContaBancaria, estadoInicial);
  const [estadoExclusao, acaoExclusao, pendenteExclusao] = useActionState(excluirContaBancaria, estadoInicial);

  // Fecha o modo de edição quando a gravação der certo (ajuste de estado durante a renderização).
  const [estadoVisto, setEstadoVisto] = useState(estadoEdicao);
  if (estadoEdicao !== estadoVisto) {
    setEstadoVisto(estadoEdicao);
    if (estadoEdicao.ok) setEditando(false);
  }

  const detalhes = [conta.banco, conta.agencia && `Ag. ${conta.agencia}`, conta.numeroConta && `Cc. ${conta.numeroConta}`]
    .filter(Boolean)
    .join(" · ");

  if (editando) {
    return (
      <li className="py-4">
        <form action={acaoEdicao} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={conta.id} />
          <Campo rotulo="Nome da conta *" className="sm:col-span-2">
            <input name="nome" required defaultValue={conta.nome} className={campo} />
          </Campo>
          <Campo rotulo="Banco">
            <input name="banco" defaultValue={conta.banco ?? ""} className={campo} />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Agência">
              <input name="agencia" defaultValue={conta.agencia ?? ""} className={campo} />
            </Campo>
            <Campo rotulo="Conta">
              <input name="numeroConta" defaultValue={conta.numeroConta ?? ""} className={campo} />
            </Campo>
          </div>
          <Campo rotulo="Saldo inicial (R$)" dica="Pode ser negativo." className="sm:col-span-2">
            <input name="saldoInicial" inputMode="decimal" defaultValue={conta.saldoInicial} className={campo} />
          </Campo>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Botao type="submit" disabled={pendenteEdicao}>
              {pendenteEdicao ? "Salvando..." : "Salvar alterações"}
            </Botao>
            <Botao type="button" variante="secundario" onClick={() => setEditando(false)}>
              Cancelar
            </Botao>
            {estadoEdicao.erro && <Alerta tipo="erro">{estadoEdicao.erro}</Alerta>}
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="font-medium text-zinc-900">{conta.nome}</p>
        <p className="text-sm text-zinc-500">{detalhes || "Sem dados bancários"}</p>
        {estadoExclusao.erro && (
          <p className="mt-1 text-sm text-red-600">{estadoExclusao.erro}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Saldo inicial</p>
          <Dinheiro valor={conta.saldoInicial} />
        </div>
        <div className="flex items-center gap-2">
          <Botao type="button" variante="secundario" className="px-3 py-1.5" onClick={() => setEditando(true)}>
            Editar
          </Botao>
          {podeExcluir && (
            <form
              action={acaoExclusao}
              onSubmit={(e) => {
                if (!confirm(`Excluir a conta "${conta.nome}"? Esta ação não pode ser desfeita.`)) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={conta.id} />
              <Botao type="submit" disabled={pendenteExclusao} className="border border-red-200 bg-white px-3 py-1.5 text-red-700 hover:bg-red-50">
                {pendenteExclusao ? "Excluindo..." : "Excluir"}
              </Botao>
            </form>
          )}
        </div>
      </div>
    </li>
  );
}

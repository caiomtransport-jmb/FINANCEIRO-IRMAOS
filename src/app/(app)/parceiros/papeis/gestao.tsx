"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarPapel, excluirPapel, type EstadoPapel } from "./actions";
import { Alerta, Botao, Campo, Cartao, campo } from "@/components/ui";

export type PapelLinha = { id: string; nome: string; emUso: number };

const estadoInicial: EstadoPapel = { ok: false };

export function GestaoPapeis({ papeis }: { papeis: PapelLinha[] }) {
  const [estado, acao, pendente] = useActionState(criarPapel, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <>
      <Cartao titulo="Novo papel" descricao="Os papéis disponíveis para os parceiros, como fornecedor de peças ou cliente.">
        <form ref={formRef} action={acao} className="flex flex-wrap items-end gap-3">
          <Campo rotulo="Nome do papel *" className="min-w-64 flex-1">
            <input name="nome" required placeholder="Ex.: Fornecedor de combustível" className={campo} />
          </Campo>
          <Botao type="submit" disabled={pendente}>
            {pendente ? "Salvando..." : "Adicionar papel"}
          </Botao>
        </form>
        {estado.erro && <div className="mt-3"><Alerta tipo="erro">{estado.erro}</Alerta></div>}
        {estado.ok && !estado.erro && <div className="mt-3"><Alerta tipo="sucesso">Papel adicionado.</Alerta></div>}
      </Cartao>

      <Cartao titulo={`Papéis cadastrados (${papeis.length})`}>
        {papeis.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum papel cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {papeis.map((p) => (
              <LinhaPapel key={p.id} papel={p} />
            ))}
          </ul>
        )}
      </Cartao>
    </>
  );
}

function LinhaPapel({ papel }: { papel: PapelLinha }) {
  const [estado, acao, pendente] = useActionState(excluirPapel, estadoInicial);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div>
        <p className="font-medium text-zinc-900">{papel.nome}</p>
        <p className="text-sm text-zinc-500">
          {papel.emUso === 0 ? "Não usado por parceiros" : `Usado por ${papel.emUso} parceiro(s)`}
        </p>
        {estado.erro && <p className="mt-1 text-sm text-red-600">{estado.erro}</p>}
      </div>
      <form
        action={acao}
        onSubmit={(e) => {
          if (!confirm(`Excluir o papel "${papel.nome}"?`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={papel.id} />
        <Botao
          type="submit"
          disabled={pendente}
          variante="secundario"
          className="border-red-200 px-3 py-1.5 text-red-700 hover:bg-red-50"
        >
          {pendente ? "Excluindo..." : "Excluir"}
        </Botao>
      </form>
    </li>
  );
}

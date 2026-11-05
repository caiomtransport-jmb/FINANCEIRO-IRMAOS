"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { criarParceiro, type EstadoParceiro } from "./actions";
import { Alerta, Botao, Campo, Cartao, campo } from "@/components/ui";

export type PapelOpcao = { id: string; nome: string };

const estadoInicial: EstadoParceiro = { ok: false };

export function FormularioParceiro({ papeis, podeGerenciarPapeis }: { papeis: PapelOpcao[]; podeGerenciarPapeis: boolean }) {
  const [estado, acao, pendente] = useActionState(criarParceiro, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  // Papéis escolhidos no dropdown aparecem como chips e são enviados como campos ocultos.
  const [escolhidos, setEscolhidos] = useState<PapelOpcao[]>([]);
  const [selecionado, setSelecionado] = useState("");

  // Ao salvar com sucesso, limpa o formulário e os chips (ajuste de estado durante a renderização).
  const [estadoVisto, setEstadoVisto] = useState(estado);
  if (estado !== estadoVisto) {
    setEstadoVisto(estado);
    if (estado.ok) {
      setEscolhidos([]);
      setSelecionado("");
    }
  }

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado]);

  const disponiveis = papeis.filter((p) => !escolhidos.some((e) => e.id === p.id));

  function adicionar() {
    const papel = papeis.find((p) => p.id === selecionado);
    if (papel) setEscolhidos((atual) => [...atual, papel]);
    setSelecionado("");
  }

  return (
    <Cartao titulo="Novo parceiro" descricao="Uma pessoa ou empresa pode ter mais de um papel.">
      <form ref={formRef} action={acao} className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome *" className="sm:col-span-2">
          <input name="nome" required placeholder="Razão social ou nome" className={campo} />
        </Campo>
        <Campo rotulo="CPF ou CNPJ" dica="Opcional. Só números são aceitos.">
          <input name="documento" inputMode="numeric" className={campo} />
        </Campo>
        <Campo rotulo="Dias de atraso para inadimplência" dica="Tolerância antes de marcar como inadimplente.">
          <input name="limiarInadimplenciaDias" type="number" min={0} max={3650} defaultValue={1} className={campo} />
        </Campo>

        <div className="sm:col-span-2">
          <p className="mb-1.5 text-sm font-medium text-zinc-700">Papéis *</p>

          {papeis.length === 0 ? (
            <Alerta tipo="erro">
              Nenhum papel cadastrado. Peça ao administrador para cadastrar os papéis antes de criar parceiros.
              {podeGerenciarPapeis && (
                <>
                  {" "}
                  <Link href="/parceiros/papeis" className="font-medium underline">
                    Cadastrar papéis
                  </Link>
                </>
              )}
            </Alerta>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <select value={selecionado} onChange={(e) => setSelecionado(e.target.value)} className={`${campo} sm:max-w-xs`}>
                  <option value="">Selecione um papel...</option>
                  {disponiveis.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
                <Botao type="button" variante="secundario" onClick={adicionar} disabled={!selecionado}>
                  Adicionar
                </Botao>
              </div>

              <div className="mt-3 flex min-h-8 flex-wrap gap-2">
                {escolhidos.length === 0 && <span className="text-sm text-zinc-400">Nenhum papel escolhido.</span>}
                {escolhidos.map((p) => (
                  <span key={p.id} className="inline-flex items-center gap-2 rounded-full bg-marca-suave px-3 py-1 text-sm font-medium text-marca">
                    {p.nome}
                    <button
                      type="button"
                      aria-label={`Remover ${p.nome}`}
                      onClick={() => setEscolhidos((atual) => atual.filter((x) => x.id !== p.id))}
                      className="text-marca/70 hover:text-marca"
                    >
                      ×
                    </button>
                    <input type="hidden" name="papeis" value={p.id} />
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Botao type="submit" disabled={pendente || papeis.length === 0}>
            {pendente ? "Salvando..." : "Salvar parceiro"}
          </Botao>
          {estado.erro && <Alerta tipo="erro">{estado.erro}</Alerta>}
          {estado.ok && !estado.erro && <Alerta tipo="sucesso">Parceiro salvo.</Alerta>}
        </div>
      </form>
    </Cartao>
  );
}

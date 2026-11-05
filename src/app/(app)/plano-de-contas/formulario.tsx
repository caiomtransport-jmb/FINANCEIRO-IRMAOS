"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarCategoria, type EstadoCategoria } from "./actions";
import { Alerta, Botao, Campo, Cartao, campo } from "@/components/ui";

export type OpcaoDestino = { valor: string; rotulo: string };

const estadoInicial: EstadoCategoria = { ok: false };

export function FormularioCategoria({ opcoes }: { opcoes: OpcaoDestino[] }) {
  const [estado, acao, pendente] = useActionState(criarCategoria, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <Cartao titulo="Nova categoria" descricao="Escolha um grupo fixo ou uma categoria existente para criar uma subcategoria.">
      <form ref={formRef} action={acao} className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome *">
          <input name="nome" required placeholder="Ex.: Combustível" className={campo} />
        </Campo>
        <Campo rotulo="Fica dentro de *">
          <select name="destino" required defaultValue="" className={campo}>
            <option value="" disabled>
              Selecione...
            </option>
            {opcoes.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </Campo>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Botao type="submit" disabled={pendente}>
            {pendente ? "Salvando..." : "Salvar categoria"}
          </Botao>
          {estado.erro && <Alerta tipo="erro">{estado.erro}</Alerta>}
          {estado.ok && !estado.erro && <Alerta tipo="sucesso">Categoria criada.</Alerta>}
        </div>
      </form>
    </Cartao>
  );
}

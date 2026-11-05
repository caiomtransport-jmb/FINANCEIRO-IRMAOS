"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarVeiculo, type EstadoVeiculo } from "./actions";
import { Alerta, Botao, Campo, Cartao, campo } from "@/components/ui";

const estadoInicial: EstadoVeiculo = { ok: false };

export function FormularioVeiculo() {
  const [estado, acao, pendente] = useActionState(criarVeiculo, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <Cartao titulo="Novo veículo" descricao="Depois você poderá vincular gastos de combustível, manutenção e pneus a cada um.">
      <form ref={formRef} action={acao} className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Placa *" dica="Formato antigo (ABC-1234) ou Mercosul (ABC1D23).">
          <input name="placa" required maxLength={8} placeholder="ABC1D23" className={`${campo} uppercase`} />
        </Campo>
        <Campo rotulo="Propriedade *">
          <select name="propriedade" defaultValue="proprio" className={campo}>
            <option value="proprio">Próprio</option>
            <option value="arrendado">Arrendado</option>
            <option value="terceiro">De terceiro</option>
          </select>
        </Campo>
        <Campo rotulo="Descrição *" className="sm:col-span-2">
          <input name="descricao" required placeholder="Ex.: Caminhão cegonha Volvo FH 2019" className={campo} />
        </Campo>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Botao type="submit" disabled={pendente}>
            {pendente ? "Salvando..." : "Salvar veículo"}
          </Botao>
          {estado.erro && <Alerta tipo="erro">{estado.erro}</Alerta>}
          {estado.ok && !estado.erro && <Alerta tipo="sucesso">Veículo salvo.</Alerta>}
        </div>
      </form>
    </Cartao>
  );
}

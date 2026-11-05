"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarMotorista, type EstadoMotorista } from "./actions";
import { Alerta, Botao, Campo, Cartao, campo } from "@/components/ui";

const estadoInicial: EstadoMotorista = { ok: false };

export function FormularioMotorista() {
  const [estado, acao, pendente] = useActionState(criarMotorista, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <Cartao titulo="Novo motorista" descricao="Depois de cadastrado, o motorista pode ser vinculado a um veículo na tela de Veículos.">
      <form ref={formRef} action={acao} className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome *" className="sm:col-span-2">
          <input name="nome" required placeholder="Nome completo" className={campo} />
        </Campo>
        <Campo rotulo="CPF" dica="Opcional. Só números.">
          <input name="documento" inputMode="numeric" className={campo} />
        </Campo>
        <Campo rotulo="CNH">
          <input name="cnh" maxLength={20} className={`${campo} uppercase`} />
        </Campo>
        <Campo rotulo="Telefone">
          <input name="telefone" inputMode="tel" placeholder="(11) 90000-0000" className={campo} />
        </Campo>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Botao type="submit" disabled={pendente}>
            {pendente ? "Salvando..." : "Salvar motorista"}
          </Botao>
          {estado.erro && <Alerta tipo="erro">{estado.erro}</Alerta>}
          {estado.ok && !estado.erro && <Alerta tipo="sucesso">Motorista salvo.</Alerta>}
        </div>
      </form>
    </Cartao>
  );
}

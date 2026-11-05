"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarContaBancaria, type EstadoConta } from "./actions";
import { Alerta, Botao, Campo, Cartao, campo } from "@/components/ui";

const estadoInicial: EstadoConta = { ok: false };

export function FormularioContaBancaria() {
  const [estado, acao, pendente] = useActionState(criarContaBancaria, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  // Limpa o formulário depois de salvar com sucesso.
  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <Cartao titulo="Nova conta" descricao="Cadastre cada conta onde o dinheiro circula.">
      <form ref={formRef} action={acao} className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome da conta *" className="sm:col-span-2">
          <input name="nome" required placeholder="Ex.: Itaú corrente, Caixa da oficina" className={campo} />
        </Campo>
        <Campo rotulo="Banco">
          <input name="banco" placeholder="Ex.: Itaú" className={campo} />
        </Campo>
        <div className="grid grid-cols-2 gap-4">
          <Campo rotulo="Agência">
            <input name="agencia" className={campo} />
          </Campo>
          <Campo rotulo="Conta">
            <input name="numeroConta" className={campo} />
          </Campo>
        </div>
        <Campo
          rotulo="Saldo inicial (R$)"
          dica="Pode ser negativo, por exemplo -320,50 para conta no vermelho."
          className="sm:col-span-2"
        >
          <input name="saldoInicial" inputMode="decimal" placeholder="0,00" className={campo} />
        </Campo>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Botao type="submit" disabled={pendente}>
            {pendente ? "Salvando..." : "Salvar conta"}
          </Botao>
          {estado.erro && <Alerta tipo="erro">{estado.erro}</Alerta>}
          {estado.ok && !estado.erro && <Alerta tipo="sucesso">Conta salva.</Alerta>}
        </div>
      </form>
    </Cartao>
  );
}

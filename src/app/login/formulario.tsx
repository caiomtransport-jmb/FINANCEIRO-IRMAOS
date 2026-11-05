"use client";

import { useActionState } from "react";
import { entrar, type EstadoLogin } from "./actions";
import { Alerta, Botao, Campo, campo } from "@/components/ui";

const estadoInicial: EstadoLogin = {};

export function FormularioLogin() {
  const [estado, acao, pendente] = useActionState(entrar, estadoInicial);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <Campo rotulo="E-mail">
        <input name="email" type="email" autoComplete="username" required className={campo} />
      </Campo>
      <Campo rotulo="Senha">
        <input name="senha" type="password" autoComplete="current-password" required className={campo} />
      </Campo>

      {estado.erro && <Alerta tipo="erro">{estado.erro}</Alerta>}

      <Botao type="submit" disabled={pendente} className="mt-2 w-full py-2.5">
        {pendente ? "Entrando..." : "Entrar"}
      </Botao>
    </form>
  );
}

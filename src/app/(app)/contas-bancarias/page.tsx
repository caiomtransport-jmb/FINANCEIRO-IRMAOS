import { Suspense } from "react";
import { connection } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { contasBancarias } from "@/db/schema";
import { lerSessao } from "@/lib/auth";
import { Cartao, Pagina, Vazio } from "@/components/ui";
import { FormularioContaBancaria } from "./formulario";
import { ListaContas } from "./lista";

export default function ContasBancariasPage() {
  return (
    <Pagina titulo="Contas bancárias" descricao="Onde o dinheiro da empresa circula, com o saldo de partida de cada uma.">
      <FormularioContaBancaria />

      <Suspense fallback={<p className="text-sm text-zinc-500">Carregando contas...</p>}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}

async function Conteudo() {
  await connection();

  const [contas, sessao] = await Promise.all([
    db.select().from(contasBancarias).orderBy(asc(contasBancarias.nome)),
    lerSessao(),
  ]);

  if (contas.length === 0) {
    return <Vazio titulo="Nenhuma conta cadastrada" descricao="Cadastre a primeira conta acima para começar." />;
  }

  return (
    <Cartao titulo={`Contas cadastradas (${contas.length})`}>
      <ListaContas contas={contas} podeExcluir={sessao?.perfil === "administrador"} />
    </Cartao>
  );
}

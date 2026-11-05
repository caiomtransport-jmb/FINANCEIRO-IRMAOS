import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { count, asc } from "drizzle-orm";
import { db } from "@/db";
import { papeis, parceiroPapeis } from "@/db/schema";
import { lerSessao } from "@/lib/auth";
import { Pagina, Vazio } from "@/components/ui";
import { GestaoPapeis, type PapelLinha } from "./gestao";

export default function PapeisPage() {
  return (
    <Pagina
      titulo="Papéis de parceiros"
      descricao="Somente o administrador cadastra e exclui papéis. Eles aparecem na lista de parceiros."
      acao={
        <Link href="/parceiros" className="text-sm font-medium text-marca hover:underline">
          ← Voltar a parceiros
        </Link>
      }
    >
      <Suspense fallback={<p className="text-sm text-zinc-500">Carregando papéis...</p>}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}

async function Conteudo() {
  await connection();

  const sessao = await lerSessao();
  if (sessao?.perfil !== "administrador") {
    return <Vazio titulo="Acesso restrito" descricao="Apenas administradores gerenciam os papéis de parceiros." />;
  }

  const lista = await db.select({ id: papeis.id, nome: papeis.nome }).from(papeis).orderBy(asc(papeis.nome));
  const usos = await db
    .select({ papelId: parceiroPapeis.papelId, total: count() })
    .from(parceiroPapeis)
    .groupBy(parceiroPapeis.papelId);

  const linhas: PapelLinha[] = lista.map((p) => ({
    id: p.id,
    nome: p.nome,
    emUso: usos.find((u) => u.papelId === p.id)?.total ?? 0,
  }));

  return <GestaoPapeis papeis={linhas} />;
}

import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { papeis, parceiroPapeis, parceiros } from "@/db/schema";
import { lerSessao } from "@/lib/auth";
import { Botao, Cartao, Etiqueta, Pagina, Vazio } from "@/components/ui";
import { FormularioParceiro } from "./formulario";

export default function ParceirosPage() {
  return (
    <Pagina
      titulo="Parceiros"
      descricao="Fornecedores e clientes em um só cadastro."
      acao={
        <Suspense fallback={null}>
          <AtalhoPapeis />
        </Suspense>
      }
    >
      <Suspense fallback={<p className="text-sm text-zinc-500">Carregando...</p>}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}

async function AtalhoPapeis() {
  await connection();
  const sessao = await lerSessao();
  if (sessao?.perfil !== "administrador") return null;
  return (
    <Link href="/parceiros/papeis">
      <Botao variante="secundario">Gerenciar papéis</Botao>
    </Link>
  );
}

async function Conteudo() {
  await connection();

  const [catalogo, lista, vinculos, sessao] = await Promise.all([
    db.select({ id: papeis.id, nome: papeis.nome }).from(papeis).orderBy(asc(papeis.nome)),
    db.select().from(parceiros).orderBy(asc(parceiros.nome)),
    db
      .select({ parceiroId: parceiroPapeis.parceiroId, nome: papeis.nome })
      .from(parceiroPapeis)
      .innerJoin(papeis, eq(parceiroPapeis.papelId, papeis.id)),
    lerSessao(),
  ]);

  return (
    <>
      <FormularioParceiro papeis={catalogo} podeGerenciarPapeis={sessao?.perfil === "administrador"} />

      {lista.length === 0 ? (
        <Vazio titulo="Nenhum parceiro cadastrado" descricao="Cadastre o primeiro acima." />
      ) : (
        <Cartao titulo={`Parceiros (${lista.length})`}>
          <ul className="divide-y divide-zinc-100">
            {lista.map((p) => {
              const nomesPapeis = vinculos.filter((v) => v.parceiroId === p.id).map((v) => v.nome);
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-zinc-900">{p.nome}</p>
                    <p className="text-sm text-zinc-500">
                      {p.documento ? formatarDocumento(p.documento) : "Sem CPF/CNPJ"} · tolerância de {p.limiarInadimplenciaDias} dia(s)
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {nomesPapeis.map((nome) => (
                        <Etiqueta key={nome} tom="azul">
                          {nome}
                        </Etiqueta>
                      ))}
                    </div>
                  </div>
                  <Etiqueta tom={p.status === "ativo" ? "verde" : "neutro"}>{p.status === "ativo" ? "Ativo" : "Inativo"}</Etiqueta>
                </li>
              );
            })}
          </ul>
        </Cartao>
      )}
    </>
  );
}

function formatarDocumento(d: string): string {
  if (d.length === 11) return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  if (d.length === 14) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  return d;
}

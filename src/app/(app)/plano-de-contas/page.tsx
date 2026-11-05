import { Suspense } from "react";
import { connection } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categorias } from "@/db/schema";
import { Cartao, Etiqueta, Pagina, Vazio } from "@/components/ui";
import { FormularioCategoria, type OpcaoDestino } from "./formulario";

const GRUPOS = [
  { id: "receita", rotulo: "Receitas", tom: "verde" as const },
  { id: "custo", rotulo: "Custos", tom: "azul" as const },
  { id: "despesa", rotulo: "Despesas", tom: "ambar" as const },
];

type Categoria = typeof categorias.$inferSelect;

export default function PlanoDeContasPage() {
  return (
    <Pagina titulo="Plano de contas" descricao="Como os lançamentos são classificados. Os três grupos são fixos; dentro deles você cria as subcategorias.">
      <Suspense fallback={<p className="text-sm text-zinc-500">Carregando plano de contas...</p>}>
        <Conteudo />
      </Suspense>
    </Pagina>
  );
}

async function Conteudo() {
  await connection();

  const todas = await db.select().from(categorias).orderBy(asc(categorias.nome));

  const opcoes: OpcaoDestino[] = [
    ...GRUPOS.map((g) => ({ valor: `g:${g.id}`, rotulo: `${g.rotulo} (grupo)` })),
    ...todas.map((c) => ({ valor: `c:${c.id}`, rotulo: `${c.nome}` })),
  ];

  return (
    <>
      <FormularioCategoria opcoes={opcoes} />

      {GRUPOS.map((g) => {
        const raizes = todas.filter((c) => c.grupo === g.id && c.paiId === null);
        return (
          <Cartao key={g.id} titulo={g.rotulo}>
            {raizes.length === 0 ? (
              <Vazio titulo={`Nenhuma subcategoria em ${g.rotulo.toLowerCase()}`} descricao="Use o formulário acima para criar a primeira." />
            ) : (
              <ul className="space-y-2">
                {raizes.map((r) => (
                  <Arvore key={r.id} categoria={r} todas={todas} nivel={0} tom={g.tom} />
                ))}
              </ul>
            )}
          </Cartao>
        );
      })}
    </>
  );
}

function Arvore({
  categoria,
  todas,
  nivel,
  tom,
}: {
  categoria: Categoria;
  todas: Categoria[];
  nivel: number;
  tom: "verde" | "azul" | "ambar";
}) {
  const filhas = todas.filter((c) => c.paiId === categoria.id);
  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-zinc-50"
        style={{ marginLeft: nivel * 20 }}
      >
        {nivel > 0 && <span className="text-zinc-300">└</span>}
        <span className="text-sm font-medium text-zinc-900">{categoria.nome}</span>
        {nivel === 0 && <Etiqueta tom={tom}>grupo</Etiqueta>}
      </div>
      {filhas.length > 0 && (
        <ul className="mt-1 space-y-1">
          {filhas.map((f) => (
            <Arvore key={f.id} categoria={f} todas={todas} nivel={nivel + 1} tom={tom} />
          ))}
        </ul>
      )}
    </li>
  );
}

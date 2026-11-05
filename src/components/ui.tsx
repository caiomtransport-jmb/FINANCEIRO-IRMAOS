import type { ButtonHTMLAttributes, ReactNode } from "react";
import { formatarReais, ehNegativo } from "@/lib/dinheiro";

// Peças visuais compartilhadas por todas as telas. Mantém um só padrão de espaçamento, cor e foco.

export const campo =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-marca focus:ring-2 focus:ring-marca/20 disabled:bg-zinc-100";

export function Pagina({
  titulo,
  descricao,
  acao,
  children,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{titulo}</h1>
          {descricao && <p className="mt-1 text-sm text-zinc-500">{descricao}</p>}
        </div>
        {acao}
      </div>
      <div className="grid gap-6">{children}</div>
    </main>
  );
}

export function Cartao({
  titulo,
  descricao,
  children,
  className = "",
}: {
  titulo?: string;
  descricao?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {titulo && <h2 className="text-base font-semibold text-zinc-900">{titulo}</h2>}
      {descricao && <p className="mt-0.5 text-sm text-zinc-500">{descricao}</p>}
      {(titulo || descricao) && <div className="mt-4" />}
      {children}
    </section>
  );
}

export function Campo({
  rotulo,
  dica,
  className = "",
  children,
}: {
  rotulo: string;
  dica?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium text-zinc-700 ${className}`}>
      <span>{rotulo}</span>
      {children}
      {dica && <span className="text-xs font-normal text-zinc-500">{dica}</span>}
    </label>
  );
}

export function Botao({
  variante = "primario",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "primario" | "secundario" }) {
  const estilo =
    variante === "primario"
      ? "bg-marca text-white hover:bg-teal-800"
      : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50";
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${estilo} ${className}`}
    />
  );
}

export function Alerta({ tipo, children }: { tipo: "erro" | "sucesso"; children: ReactNode }) {
  const estilo =
    tipo === "erro"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
  return <p className={`rounded-lg border px-3 py-2 text-sm ${estilo}`}>{children}</p>;
}

export function Vazio({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center">
      <p className="font-medium text-zinc-700">{titulo}</p>
      <p className="mt-1 text-sm text-zinc-500">{descricao}</p>
    </div>
  );
}

const TONS = {
  neutro: "bg-zinc-100 text-zinc-700",
  verde: "bg-emerald-100 text-emerald-800",
  vermelho: "bg-red-100 text-red-800",
  ambar: "bg-amber-100 text-amber-800",
  azul: "bg-sky-100 text-sky-800",
} as const;

export function Etiqueta({ tom = "neutro", children }: { tom?: keyof typeof TONS; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONS[tom]}`}>
      {children}
    </span>
  );
}

export function Dinheiro({ valor }: { valor: string | number }) {
  return (
    <span className={`tabular-nums font-medium ${ehNegativo(valor) ? "text-red-600" : "text-zinc-900"}`}>
      {formatarReais(valor)}
    </span>
  );
}

export function ListaCartoes({ children }: { children: ReactNode }) {
  return <ul className="grid gap-3">{children}</ul>;
}

import Link from "next/link";
import { sair } from "@/app/login/actions";
import type { Perfil } from "@/lib/auth";
import { Botao } from "@/components/ui";

const LINKS = [
  { href: "/", rotulo: "Início" },
  { href: "/contas-bancarias", rotulo: "Contas" },
  { href: "/plano-de-contas", rotulo: "Plano de contas" },
  { href: "/parceiros", rotulo: "Parceiros" },
  { href: "/veiculos", rotulo: "Veículos" },
  { href: "/motoristas", rotulo: "Motoristas" },
];

export function Cabecalho({ nome, perfil }: { nome: string; perfil: Perfil }) {
  const rotuloPerfil = perfil === "administrador" ? "Administrador" : "Operador";
  const iniciais = nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-marca text-xs text-white">IM</span>
            Irmãos Miranda
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                {l.rotulo}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-marca-suave text-xs font-semibold text-marca">
              {iniciais || "?"}
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="font-medium text-zinc-900">{nome}</span>
              <span className="text-xs text-zinc-500">{rotuloPerfil}</span>
            </span>
          </div>
          <form action={sair}>
            <Botao type="submit" variante="secundario" className="px-3 py-1.5">
              Sair
            </Botao>
          </form>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { Pagina } from "@/components/ui";

// Módulos da V1. `pronto: false` aparece como "Em breve".
const MODULOS = [
  { href: "/contas-bancarias", titulo: "Contas bancárias", descricao: "Contas e saldos de partida", pronto: true },
  { href: "/plano-de-contas", titulo: "Plano de contas", descricao: "Receitas, custos e despesas", pronto: true },
  { href: "/parceiros", titulo: "Parceiros", descricao: "Fornecedores e clientes, com seus papéis", pronto: true },
  { href: "/veiculos", titulo: "Veículos", descricao: "Frota, propriedade e motorista atual", pronto: true },
  { href: "/motoristas", titulo: "Motoristas", descricao: "Cadastro e vínculo com os veículos", pronto: true },
  { href: "#", titulo: "Contas a pagar", descricao: "Títulos, boletos e vencimentos", pronto: false },
  { href: "#", titulo: "Contas a receber", descricao: "Recebimentos e inadimplência", pronto: false },
  { href: "#", titulo: "Financiamentos", descricao: "Contratos e parcelas", pronto: false },
  { href: "#", titulo: "Fluxo de caixa", descricao: "Movimentação por data, mês a mês", pronto: false },
];

export default function InicioPage() {
  return (
    <Pagina titulo="Início" descricao="Escolha um módulo para começar.">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULOS.map((m) => (
          <li key={m.titulo}>
            {m.pronto ? (
              <Link
                href={m.href}
                className="group block h-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-marca/40 hover:shadow-md"
              >
                <p className="font-semibold text-zinc-900 group-hover:text-marca">{m.titulo}</p>
                <p className="mt-1 text-sm text-zinc-500">{m.descricao}</p>
                <p className="mt-4 text-sm font-medium text-marca">Abrir →</p>
              </Link>
            ) : (
              <div className="h-full rounded-2xl border border-dashed border-zinc-300 p-5">
                <p className="font-semibold text-zinc-500">{m.titulo}</p>
                <p className="mt-1 text-sm text-zinc-400">{m.descricao}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-400">Em breve</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Pagina>
  );
}

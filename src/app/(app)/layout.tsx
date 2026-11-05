import { Suspense } from "react";
import { redirect } from "next/navigation";
import { lerSessao, type Sessao } from "@/lib/auth";
import { Cabecalho } from "@/components/cabecalho";

// Todas as rotas dentro de (app) exigem sessão válida.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-14 border-b border-zinc-200 dark:border-zinc-800" />}>
      <AreaAutenticada>{children}</AreaAutenticada>
    </Suspense>
  );
}

async function AreaAutenticada({ children }: { children: React.ReactNode }) {
  const sessao: Sessao | null = await lerSessao();
  if (!sessao) redirect("/login");

  return (
    <>
      <Cabecalho nome={sessao.nome} perfil={sessao.perfil} />
      {children}
    </>
  );
}

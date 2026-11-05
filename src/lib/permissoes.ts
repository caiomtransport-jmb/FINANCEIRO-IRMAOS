import { lerSessao, type Sessao } from "@/lib/auth";

// Conferência de sessão e perfil para server actions. Toda ação de gravação passa por aqui.
// Operador lança e consulta; exclusões e decisões de cadastro-base são do administrador (Q15).

type Resultado = { ok: true; sessao: Sessao } | { ok: false; erro: string };

export async function exigirSessao(): Promise<Resultado> {
  const sessao = await lerSessao();
  if (!sessao) return { ok: false, erro: "Sessão expirada. Entre novamente." };
  return { ok: true, sessao };
}

export async function exigirAdministrador(): Promise<Resultado> {
  const r = await exigirSessao();
  if (!r.ok) return r;
  if (r.sessao.perfil !== "administrador") {
    return { ok: false, erro: "Apenas administradores podem fazer isso." };
  }
  return r;
}

// Código de violação de chave estrangeira do Postgres (registro ainda em uso).
export function ehErroDeVinculo(erro: unknown): boolean {
  return typeof erro === "object" && erro !== null && "code" in erro && (erro as { code: string }).code === "23503";
}

// Código de violação de unicidade do Postgres.
export function ehErroDeDuplicidade(erro: unknown): boolean {
  return typeof erro === "object" && erro !== null && "code" in erro && (erro as { code: string }).code === "23505";
}

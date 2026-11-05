import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// Sessão em cookie httpOnly com JWT assinado (stateless). Ver ADR 0004 e docs de auth do Next.
export const NOME_COOKIE = "sessao";
const DURACAO_SEGUNDOS = 60 * 60 * 8; // 8 horas

export type Perfil = "administrador" | "operador";

export type Sessao = {
  usuarioId: string;
  nome: string;
  perfil: Perfil;
};

function chave(): Uint8Array {
  const segredo = process.env.AUTH_SECRET;
  if (!segredo || segredo.length < 32) {
    throw new Error("AUTH_SECRET ausente ou curta demais (mínimo 32 caracteres). Veja .env.example.");
  }
  return new TextEncoder().encode(segredo);
}

export function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export async function criarSessao(sessao: Sessao): Promise<void> {
  const token = await new SignJWT({ ...sessao })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SEGUNDOS}s`)
    .sign(chave());

  (await cookies()).set(NOME_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
}

// Retorna a sessão válida ou null. Não redireciona: quem chama decide o que fazer.
export async function lerSessao(): Promise<Sessao | null> {
  const token = (await cookies()).get(NOME_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, chave(), { algorithms: ["HS256"] });
    return {
      usuarioId: String(payload.usuarioId),
      nome: String(payload.nome),
      perfil: payload.perfil as Perfil,
    };
  } catch {
    return null;
  }
}

export async function encerrarSessao(): Promise<void> {
  (await cookies()).delete(NOME_COOKIE);
}

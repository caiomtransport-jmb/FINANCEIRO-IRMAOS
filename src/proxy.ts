import { NextResponse, type NextRequest } from "next/server";

// Verificação otimista: só checa se o cookie existe. A validade da sessão é conferida
// de verdade nas páginas (src/app/(app)/layout.tsx) e em cada server action.
const NOME_COOKIE = "sessao"; // mesmo valor de NOME_COOKIE em src/lib/auth.ts
const ROTAS_PUBLICAS = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ROTAS_PUBLICAS.includes(pathname)) return NextResponse.next();

  if (!request.cookies.has(NOME_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { criarSessao, encerrarSessao, verificarSenha } from "@/lib/auth";

export type EstadoLogin = { erro?: string };

export async function entrar(_estadoAnterior: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) return { erro: "Informe e-mail e senha." };

  const [usuario] = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);

  // Mesma mensagem para e-mail inexistente e senha errada, para não revelar quem tem conta.
  const senhaConfere = usuario ? await verificarSenha(senha, usuario.senhaHash) : false;
  if (!usuario || !senhaConfere) return { erro: "E-mail ou senha inválidos." };

  await criarSessao({ usuarioId: usuario.id, nome: usuario.nome, perfil: usuario.perfil });
  redirect("/");
}

export async function sair(): Promise<void> {
  await encerrarSessao();
  redirect("/login");
}

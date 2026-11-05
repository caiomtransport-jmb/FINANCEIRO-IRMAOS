import { FormularioLogin } from "./formulario";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-marca-suave/60 to-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-marca text-base font-semibold text-white shadow-sm">
            IM
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900">Gestão Financeira</h1>
          <p className="text-sm text-zinc-500">Irmãos Miranda</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <FormularioLogin />
        </div>
      </div>
    </main>
  );
}

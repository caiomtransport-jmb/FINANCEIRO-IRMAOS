// Utilitários de valor monetário. Banco guarda numeric(14,2) como string; a tela mostra em reais.

// Aceita "1500", "1500,00", "1.500,00", "-250,5" e "R$ -1.500,00".
// Retorna a string no formato do banco ("-1500.00") ou null se o texto não for um valor.
export function normalizarValor(bruto: string): string | null {
  let s = bruto.trim().replace(/\s/g, "").replace(/^R\$/i, "");
  if (s === "") return "0";
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  if (!/^-?\d{1,12}(\.\d{1,2})?$/.test(s)) return null;
  return s;
}

export function formatarReais(valor: string | number): string {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ehNegativo(valor: string | number): boolean {
  return Number(valor) < 0;
}

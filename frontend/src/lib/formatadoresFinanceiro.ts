export function valorValido(valor: number): boolean {
  return Number.isFinite(valor);
}

export function formatarMoeda(valor: number): string {
  if (!valorValido(valor)) return "--";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatarInteiro(valor: number): string {
  if (!valorValido(valor)) return "--";

  return new Intl.NumberFormat("pt-BR").format(valor);
}

/** Input masks (pt-BR). Each takes raw user input and returns the masked string. */

const digits = (v: string): string => v.replace(/\D/g, '');

export function maskCpf(value: string): string {
  return digits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskCnpj(value: string): string {
  return digits(value)
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/** (11) 9 8765-4321 — supports 10 or 11 digits. */
export function maskPhone(value: string): string {
  const d = digits(value).slice(0, 11);
  if (d.length <= 2) return d.replace(/(\d{0,2})/, '($1');
  if (d.length <= 6) return d.replace(/(\d{2})(\d{0,4})/, '($1) $2');
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{1})(\d{4})(\d{0,4})/, '($1) $2 $3-$4');
}

/** 12/05/2026 from typed digits. */
export function maskDate(value: string): string {
  return digits(value)
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}

/** Currency mask: keeps digits, formats as R$ 1.234,56 (cents from the last 2 digits). */
export function maskCurrency(value: string): string {
  const d = digits(value).slice(0, 12);
  if (!d) return '';
  const cents = (Number(d) / 100).toFixed(2);
  const [intPart, decPart] = cents.split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${withThousands},${decPart}`;
}

/** Groups integer digits with thousands dots: "12000" → "12.000". */
export function maskThousands(value: string): string {
  const d = digits(value).slice(0, 9);
  if (!d) return '';
  return Number(d).toLocaleString('pt-BR');
}

/** Extracts only digits — handy when persisting masked fields. */
export function unmask(value: string): string {
  return digits(value);
}

/** Parses a masked currency string back to a number in reais. */
export function parseCurrency(value: string): number {
  return Number(digits(value)) / 100;
}

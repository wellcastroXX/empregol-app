/** Brazilian document + form validators. All work on digit-only or raw strings. */

const onlyDigits = (value: string): string => value.replace(/\D/g, '');

/** Validates a CPF using the official check-digit algorithm. */
export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (sliceLen: number): number => {
    let sum = 0;
    for (let i = 0; i < sliceLen; i++) {
      sum += Number(cpf[i]) * (sliceLen + 1 - i);
    }
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };

  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

/** Validates a CNPJ using the official check-digit algorithm. */
export function isValidCnpj(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calc = (length: number): number => {
    const weights =
      length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(cnpj[i]) * weights[i];
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13]);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Brazilian mobile: 10 or 11 digits (with DDD). */
export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value);
  return digits.length === 10 || digits.length === 11;
}

/** Password: at least 8 chars, with a letter and a number. */
export function isValidPassword(value: string): boolean {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

export function isNonEmpty(value: string | undefined | null): boolean {
  return !!value && value.trim().length > 0;
}

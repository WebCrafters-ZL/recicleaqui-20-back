// Validações de formato e algorítmicas para CPF e CNPJ
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function onlyDigits(value) {
  return String(value).replace(/\D+/g, "");
}

function isValidCPF(cpf) {
  const s = onlyDigits(cpf);
  if (!/^[0-9]{11}$/.test(s)) return false;
  // rejeita CPFs óbvios
  if (/^(\d)\1{10}$/.test(s)) return false;

  const calc = (digits) => {
    let sum = 0;
    // eslint-disable-next-line security/detect-object-injection -- digits is sanitized and comes from regex match
    for (let i = 0; i < digits.length; i++) sum += Number(digits[i]) * (digits.length + 1 - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  const base = s.slice(0, 9);
  const d1 = calc(base);
  const d2 = calc(base + d1);
  return s === base + String(d1) + String(d2);
}

function isValidCNPJ(cnpj) {
  const s = onlyDigits(cnpj);
  if (!/^[0-9]{14}$/.test(s)) return false;
  if (/^(\d)\1{13}$/.test(s)) return false;

  const calc = (digits, weights) => {
    let sum = 0;
    // eslint-disable-next-line security/detect-object-injection -- digits/weights derived from sanitized input
    for (let i = 0; i < digits.length; i++) sum += Number(digits[i]) * weights[i];
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };

  const base = s.slice(0, 12);
  const weights1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const d1 = calc(base, weights1);
  const weights2 = [6].concat(weights1);
  const d2 = calc(base + d1, weights2);
  return s === base + String(d1) + String(d2);
}

export { isValidEmail, isValidCPF, isValidCNPJ, onlyDigits };

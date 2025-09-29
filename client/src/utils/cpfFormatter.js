/**
 * Formata um CPF conforme o usuário digita
 * @param {string} value - Valor atual do input
 * @returns {string} - CPF formatado
 */
export function formatCPF(value) {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a formatação conforme o número de dígitos
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`;
  } else if (limitedNumbers.length <= 9) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`;
  } else {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`;
  }
}

/**
 * Remove a formatação do CPF, retornando apenas os números
 * @param {string} cpf - CPF formatado
 * @returns {string} - CPF apenas com números
 */
export function unformatCPF(cpf) {
  return cpf.replace(/\D/g, '');
}

/**
 * Valida se um CPF está no formato correto (11 dígitos)
 * @param {string} cpf - CPF para validar
 * @returns {boolean} - True se o CPF tem 11 dígitos
 */
export function isValidCPFLength(cpf) {
  const numbers = unformatCPF(cpf);
  return numbers.length === 11;
}

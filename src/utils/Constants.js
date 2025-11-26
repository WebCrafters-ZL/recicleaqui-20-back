/**
 * Constants - Constantes da aplicação
 * Centraliza valores constantes usados em múltiplos módulos
 */

/**
 * Linhas de material aceitas para coleta
 */
export const MATERIAL_LINES = ['VERDE', 'MARROM', 'AZUL', 'BRANCA'];

/**
 * Descrições das linhas de material
 */
export const MATERIAL_DESCRIPTIONS = {
  VERDE: 'Vidro',
  MARROM: 'Orgânico',
  AZUL: 'Papel/Papelão',
  BRANCA: 'Metal/Plástico'
};

/**
 * Configurações de segurança
 */
export const SECURITY = {
  SALT_ROUNDS: 10,
  MIN_PASSWORD_LENGTH: 6,
  TOKEN_EXPIRY: '1d',
  RESET_TOKEN_VALIDITY_HOURS: 1
};

/**
 * Configurações de geocodificação
 */
export const GEOCODING = {
  NOMINATIM_BASE_URL: 'https://nominatim.openstreetmap.org/search',
  USER_AGENT: 'RecicleAqui/2.0',
  REQUEST_DELAY_MS: 1000,
  COUNTRY_CODE: 'br'
};

/**
 * Tipos de cliente
 */
export const CLIENT_TYPES = {
  RESIDENTIAL: 'RESIDENTIAL',
  COMMERCIAL: 'COMMERCIAL'
};

/**
 * Tipos de coleta
 */
export const COLLECTION_TYPES = {
  MOBILE: 'MOBILE',
  FIXED: 'FIXED',
  BOTH: 'BOTH'
};

/**
 * Roles de usuário
 */
export const USER_ROLES = {
  CLIENT: 'CLIENT',
  COLLECTOR: 'COLLECTOR',
  ADMIN: 'ADMIN'
};

/**
 * Status de descarte
 */
export const DISCARD_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  COLLECTED: 'COLLECTED',
  CANCELLED: 'CANCELLED'
};

/**
 * Expressões regulares úteis
 */
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ONLY_DIGITS: /\D+/g,
  CPF: /^[0-9]{11}$/,
  CNPJ: /^[0-9]{14}$/,
  PHONE: /^[0-9]{10,11}$/,
  CEP: /^[0-9]{8}$/,
  REPEATED_DIGITS: /^(\d)\1+$/
};

export default {
  MATERIAL_LINES,
  MATERIAL_DESCRIPTIONS,
  SECURITY,
  GEOCODING,
  CLIENT_TYPES,
  COLLECTION_TYPES,
  USER_ROLES,
  DISCARD_STATUS,
  REGEX
};

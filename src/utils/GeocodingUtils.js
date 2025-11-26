import logger from './Logger.js';

/**
 * GeocodingUtils - Utilitários para geocodificação de endereços
 * Utiliza a API Nominatim do OpenStreetMap
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'RecicleAqui/2.0'; // Identificação da aplicação conforme políticas do Nominatim

/**
 * Aguarda um tempo especificado
 * @param {number} ms - Milissegundos para aguardar
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Formata um endereço para a query de geocodificação
 * @param {Object} address - Objeto de endereço
 * @returns {string} Endereço formatado
 */
function formatAddressForQuery(address) {
  const parts = [];
  
  if (address.addressName) parts.push(address.addressName);
  if (address.number) parts.push(address.number);
  if (address.neighborhood) parts.push(address.neighborhood);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postalCode) parts.push(address.postalCode);
  
  return parts.join(', ');
}

/**
 * Geocodifica um endereço usando a API Nominatim
 * @param {Object} address - Objeto de endereço com campos: addressName, number, neighborhood, city, state, postalCode
 * @returns {Promise<Object|null>} Objeto com latitude e longitude ou null se não encontrado
 */
export async function geocodeAddress(address) {
  // Se o endereço já possui coordenadas, retorna elas
  if (address.latitude && address.longitude) {
    logger.info('Endereço já possui coordenadas');
    return {
      latitude: address.latitude,
      longitude: address.longitude
    };
  }

  try {
    const query = formatAddressForQuery(address);
    
    if (!query) {
      logger.warn('Endereço vazio ou inválido para geocodificação');
      return null;
    }

    logger.info(`Geocodificando endereço: ${query}`);

    // Adiciona delay de 1 segundo entre requisições para respeitar política de uso do Nominatim
    await sleep(1000);

    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      countrycodes: 'br', // Restringe busca ao Brasil
      addressdetails: '1'
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      logger.error(`Erro na API Nominatim: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      logger.warn(`Nenhuma coordenada encontrada para: ${query}`);
      return null;
    }

    const result = data[0];
    const coordinates = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    };

    logger.info(`Coordenadas encontradas: lat=${coordinates.latitude}, lon=${coordinates.longitude}`);
    
    return coordinates;

  } catch (error) {
    logger.error(`Erro ao geocodificar endereço: ${error.message}`);
    return null;
  }
}

/**
 * Enriquece um objeto de endereço com coordenadas geográficas
 * @param {Object} address - Objeto de endereço
 * @returns {Promise<Object>} Objeto de endereço com latitude e longitude adicionados
 */
export async function enrichAddressWithCoordinates(address) {
  if (!address) {
    return null;
  }

  const coordinates = await geocodeAddress(address);
  
  if (coordinates) {
    return {
      ...address,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    };
  }

  // Se não conseguir geocodificar, retorna o endereço sem coordenadas
  logger.warn('Não foi possível geocodificar o endereço. Salvando sem coordenadas.');
  return address;
}

export default {
  geocodeAddress,
  enrichAddressWithCoordinates
};

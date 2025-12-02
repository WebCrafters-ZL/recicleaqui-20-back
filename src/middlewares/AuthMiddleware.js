import JwtUtils from '../utils/JwtUtils.js';

/**
 * AuthMiddleware - Valida tokens JWT nas requisições
 * Pode ser expandido para incluir roles, permissions, etc.
 */
class AuthMiddleware {
  /**
   * Middleware que valida o token JWT e adiciona o usuário decodificado em req.user
   */
  required = (req, res, next) => {
    const token = JwtUtils.extractFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    try {
      const decoded = JwtUtils.verify(token);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  };

  /**
   * Middleware que verifica se o usuário tem uma role específica
   */
  hasRole = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      next();
    };
  };
}

// Instância singleton
const authMiddleware = new AuthMiddleware();

// Export da função middleware para compatibilidade
export default authMiddleware.required;

// Export da classe para uso avançado
export const hasRole = authMiddleware.hasRole;
export { AuthMiddleware, authMiddleware };

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * AuthMiddleware - Valida tokens JWT nas requisições
 * Pode ser expandido para incluir roles, permissions, etc.
 */
class AuthMiddleware {
  constructor(jwtSecret = JWT_SECRET) {
    this.jwtSecret = jwtSecret;
  }

  /**
   * Middleware que valida o token JWT e adiciona o usuário decodificado em req.user
   */
  required = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
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

// Instância singleton para compatibilidade com código existente
const authMiddleware = new AuthMiddleware();

// Export da função middleware para compatibilidade
export default authMiddleware.required;

// Export da classe para uso avançado
export { AuthMiddleware, authMiddleware };

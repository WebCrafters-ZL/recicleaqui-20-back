import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const AVATAR_DIR = path.resolve(UPLOADS_DIR, 'avatars');

/* eslint-disable security/detect-non-literal-fs-filename */
function ensureDir(dirPath) {
  // Usa apenas caminhos conhecidos/literais
  if (dirPath !== UPLOADS_DIR && dirPath !== AVATAR_DIR) {
    throw new Error('Diretório de upload inválido');
  }
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch {
    throw new Error('Falha ao preparar diretório de upload');
  }
}
/* eslint-enable security/detect-non-literal-fs-filename */

// Usamos memoryStorage para processar imagem com sharp antes de salvar
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

export const uploadAvatarSingle = upload.single('avatar');
export { AVATAR_DIR, ensureDir };

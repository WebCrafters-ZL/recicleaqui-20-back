import multer from 'multer';
import path from 'path';
import fs from 'fs';

const AVATAR_DIR = path.resolve(process.cwd(), 'uploads', 'avatars');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

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

import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, "../../uploads");

const EXTENSOES_PERMITIDAS = [".pdf", ".jpg", ".jpeg", ".png"];
const MIME_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"];

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nome = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, nome);
  },
});

function arquivoPermitido(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  return EXTENSOES_PERMITIDAS.includes(ext) && MIME_PERMITIDOS.includes(file.mimetype);
}

export const uploadMultiplos = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (arquivoPermitido(file)) {
      cb(null, true);
    } else {
      cb(new Error("Formato não permitido. Envie PDF, JPG ou PNG."));
    }
  },
});

export const uploadUnico = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (arquivoPermitido(file)) {
      cb(null, true);
    } else {
      cb(new Error("Formato não permitido. Envie PDF, JPG ou PNG."));
    }
  },
});

export function extensaoParaTipo(extensao) {
  const ext = extensao.toLowerCase().replace(".", "");
  if (ext === "jpeg") return "jpg";
  if (["pdf", "jpg", "png"].includes(ext)) return ext;
  return null;
}

export function removerArquivo(caminho) {
  if (!caminho) return;
  const arquivo = path.join(UPLOAD_DIR, caminho);
  if (fs.existsSync(arquivo)) {
    fs.unlinkSync(arquivo);
  }
}

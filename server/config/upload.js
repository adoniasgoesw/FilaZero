// server/config/upload.js - Configuração de upload para desenvolvimento e produção
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Função para garantir que a pasta uploads existe
const ensureUploadsDirectory = () => {
  const uploadPath = path.join(__dirname, '..', 'uploads');
  console.log('📁 Verificando pasta de uploads:', uploadPath);
  
  if (!fs.existsSync(uploadPath)) {
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('✅ Pasta uploads criada com sucesso:', uploadPath);
    } catch (error) {
      console.error('❌ Erro ao criar pasta uploads:', error);
      throw new Error('Não foi possível criar a pasta de uploads');
    }
  } else {
    console.log('✅ Pasta uploads já existe:', uploadPath);
  }
  
  return uploadPath;
};

// Configuração do storage do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const uploadPath = ensureUploadsDirectory();
      console.log('📁 Salvando arquivo em:', uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      console.error('❌ Erro na configuração do destino:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      // Gerar nome único para o arquivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = 'categoria-' + uniqueSuffix + path.extname(file.originalname);
      console.log('📄 Nome do arquivo gerado:', filename);
      cb(null, filename);
    } catch (error) {
      console.error('❌ Erro ao gerar nome do arquivo:', error);
      cb(error);
    }
  }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  console.log('🔍 Validando arquivo:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    userAgent: req.get('User-Agent'),
    isMobile: /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent'))
  });
  
  // Aceitar apenas imagens
  if (file.mimetype.startsWith('image/')) {
    console.log('✅ Arquivo de imagem válido');
    cb(null, true);
  } else {
    console.log('❌ Tipo de arquivo não permitido:', file.mimetype);
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

// Configuração do Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

// Middleware personalizado para capturar erros do Multer
const uploadMiddleware = (fieldName = 'imagem') => {
  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName);
    
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('❌ Erro do Multer:', {
          code: err.code,
          message: err.message,
          field: err.field,
          userAgent: req.get('User-Agent'),
          isMobile: /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent'))
        });
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Arquivo muito grande. Tamanho máximo: 5MB'
          });
        }
        
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Campo de arquivo inesperado'
          });
        }
        
        return res.status(400).json({
          success: false,
          message: 'Erro no upload do arquivo: ' + err.message
        });
      } else if (err) {
        console.error('❌ Erro no upload:', {
          message: err.message,
          stack: err.stack,
          userAgent: req.get('User-Agent'),
          isMobile: /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent'))
        });
        
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      console.log('✅ Upload processado com sucesso para:', fieldName);
      next();
    });
  };
};

export { uploadMiddleware, ensureUploadsDirectory };

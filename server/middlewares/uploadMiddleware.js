// server/middlewares/uploadMiddleware.js
import multer from 'multer';
import path from 'path';

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'categoria-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Aceitar apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

// Configuração principal do Multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
    files: 1 // Máximo 1 arquivo
  }
});

// Middleware para capturar erros do Multer
export const handleMulterError = (err, req, res, next) => {
  console.log('🔍 Erro do Multer capturado:', err.message);
  
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'Arquivo muito grande. Tamanho máximo: 5MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Muitos arquivos enviados. Máximo: 1 arquivo'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Campo de arquivo inesperado'
        });
      case 'LIMIT_PART_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Muitas partes no formulário'
        });
      case 'LIMIT_FIELD_KEY':
        return res.status(400).json({
          success: false,
          message: 'Nome do campo muito longo'
        });
      case 'LIMIT_FIELD_VALUE':
        return res.status(400).json({
          success: false,
          message: 'Valor do campo muito longo'
        });
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Muitos campos no formulário'
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Erro no upload: ${err.message}`
        });
    }
  }
  
  // Para outros erros específicos
  if (err.message === 'Apenas imagens são permitidas!') {
    return res.status(400).json({
      success: false,
      message: 'Apenas arquivos de imagem são permitidos'
    });
  }
  
  // Para o erro específico "Unexpected end of form"
  if (err.message === 'Unexpected end of form') {
    return res.status(400).json({
      success: false,
      message: 'Erro no envio do formulário. Verifique se todos os campos estão preenchidos corretamente e tente novamente.'
    });
  }
  
  // Para outros erros não tratados
  console.error('❌ Erro não tratado do Multer:', err);
  next(err);
};

// Middleware para validar se o upload foi bem-sucedido
export const validateUpload = (req, res, next) => {
  if (!req.file) {
    console.log('⚠️ Nenhum arquivo enviado');
    // Não é erro, apenas log
  } else {
    console.log('✅ Arquivo recebido com sucesso:', req.file.filename);
  }
  
  // Verificar se o body tem os campos necessários
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados do formulário não recebidos corretamente'
    });
  }
  
  next();
};

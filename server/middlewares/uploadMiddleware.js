// server/middlewares/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import { uploadImage } from '../config/cloudinary.js';

// Configuração do Multer para upload de imagens (apenas para processar o arquivo)
const storage = multer.memoryStorage(); // Usar memory storage para enviar para Cloudinary

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

// Middleware para fazer upload para Cloudinary
export const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(); // Se não há arquivo, continuar
    }
    
    console.log('☁️ Processando arquivo para Cloudinary...');
    
    // Fazer upload para Cloudinary
    const result = await uploadImage(req.file.buffer, {
      mimetype: req.file.mimetype,
      filename: req.file.originalname
    });
    
    if (result.success) {
      // Substituir informações do arquivo local pelas do Cloudinary
      req.file.cloudinary = {
        url: result.url,
        public_id: result.public_id,
        format: result.format,
        size: result.size
      };
      
      console.log('✅ Arquivo processado para Cloudinary:', req.file.cloudinary);
      next();
    } else {
      console.error('❌ Falha no upload para Cloudinary:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload da imagem para o servidor'
      });
    }
  } catch (error) {
    console.error('❌ Erro no middleware uploadToCloudinary:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar imagem'
    });
  }
};

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
  
  // Para outros erros
  console.error('❌ Erro não tratado no Multer:', err);
  return res.status(500).json({
    success: false,
    message: 'Erro interno no servidor'
  });
};

// Middleware para validar upload
export const validateUpload = (req, res, next) => {
  // Se não há arquivo, continuar (upload é opcional)
  if (!req.file) {
    return next();
  }
  
  // Verificar se o upload para Cloudinary foi bem-sucedido
  if (!req.file.cloudinary || !req.file.cloudinary.url) {
    return res.status(500).json({
      success: false,
      message: 'Erro no processamento da imagem'
    });
  }
  
  next();
};

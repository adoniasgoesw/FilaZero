// server/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Função para fazer upload de imagem
export const uploadImage = async (fileBuffer, options = {}) => {
  try {
    console.log('☁️ Iniciando upload para Cloudinary...');
    
    // Converter buffer para base64
    const base64Image = fileBuffer.toString('base64');
    const dataURI = `data:${options.mimetype || 'image/jpeg'};base64,${base64Image}`;
    
    // Configurações padrão
    const uploadOptions = {
      folder: 'filazero',
      resource_type: 'auto',
      ...options
    };
    
    console.log('📤 Opções de upload:', uploadOptions);
    
    // Fazer upload
    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
    
    console.log('✅ Upload para Cloudinary realizado com sucesso:', {
      public_id: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes
    });
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('❌ Erro no upload para Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para deletar imagem
export const deleteImage = async (publicId) => {
  try {
    console.log('🗑️ Deletando imagem do Cloudinary:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    console.log('✅ Imagem deletada do Cloudinary:', result);
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('❌ Erro ao deletar imagem do Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para obter URL de imagem
export const getImageUrl = (publicId, options = {}) => {
  if (!publicId) return null;
  
  try {
    // Se já é uma URL completa, retornar como está
    if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
      return publicId;
    }
    
    // Construir URL do Cloudinary
    const url = cloudinary.url(publicId, {
      secure: true,
      ...options
    });
    
    return url;
  } catch (error) {
    console.error('❌ Erro ao construir URL do Cloudinary:', error);
    return null;
  }
};

export default cloudinary;

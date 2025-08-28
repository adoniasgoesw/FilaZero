import express from 'express';
import {
  criarItemComplemento,
  criarMultiplosItensComplemento,
  buscarItensPorCategoria,
  buscarItensPorProduto,
  deletarItemComplemento,
  deletarItensPorCategoria
} from '../controllers/itensComplementos.js';

const router = express.Router();

// Criar um item de complemento
router.post('/', criarItemComplemento);

// Criar múltiplos itens de complemento de uma vez
router.post('/multiplos', criarMultiplosItensComplemento);

// Buscar itens de complemento por categoria
router.get('/categoria/:categoria_id', buscarItensPorCategoria);

// Buscar itens de complemento por produto (todas as categorias)
router.get('/produto/:produto_id', buscarItensPorProduto);

// Deletar um item de complemento específico
router.delete('/:id', deletarItemComplemento);

// Deletar todos os itens de uma categoria
router.delete('/categoria/:categoria_id', deletarItensPorCategoria);

export default router;

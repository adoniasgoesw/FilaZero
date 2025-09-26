import pool from '../config/db.js';

const pagamentosController = {
  // Cadastrar forma de pagamento
  async cadastrar(req, res) {
    try {
      const { 
        estabelecimento_id, 
        nome, 
        tipo, 
        taxa = 0, 
        conta_bancaria = null
      } = req.body;

      // Validações obrigatórias
      if (!estabelecimento_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'estabelecimento_id é obrigatório' 
        });
      }

      if (!nome || nome.trim().length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres' 
        });
      }

      if (!tipo || tipo.trim().length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tipo é obrigatório e deve ter pelo menos 2 caracteres' 
        });
      }

      // Verificar se já existe forma de pagamento com mesmo nome no estabelecimento
      const nomeExists = await pool.query(
        'SELECT id FROM pagamentos WHERE estabelecimento_id = $1 AND nome = $2 AND status = true',
        [estabelecimento_id, nome.trim()]
      );
      if (nomeExists.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Já existe uma forma de pagamento cadastrada com este nome' 
        });
      }

      // Inserir forma de pagamento
      const result = await pool.query(
        `INSERT INTO pagamentos (
          estabelecimento_id, nome, tipo, taxa, conta_bancaria
        ) VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,
        [
          estabelecimento_id,
          nome.trim(),
          tipo.trim(),
          parseFloat(taxa) || 0,
          conta_bancaria ? conta_bancaria.trim() : null
        ]
      );

      res.json({ 
        success: true, 
        message: 'Forma de pagamento cadastrada com sucesso',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao cadastrar forma de pagamento:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Listar formas de pagamento por estabelecimento
  async listarPorEstabelecimento(req, res) {
    try {
      const { estabelecimento_id } = req.params;

      if (!estabelecimento_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'estabelecimento_id é obrigatório' 
        });
      }

      // Verificar se já existem formas de pagamento para este estabelecimento
      const existingPayments = await pool.query(
        'SELECT COUNT(*) as count FROM pagamentos WHERE estabelecimento_id = $1',
        [estabelecimento_id]
      );

      // Se não existem formas de pagamento, criar as 4 padrão
      if (parseInt(existingPayments.rows[0].count) === 0) {
        const defaultPayments = [
          { nome: 'Dinheiro', tipo: 'Dinheiro', taxa: 0, conta_bancaria: null },
          { nome: 'PIX', tipo: 'PIX', taxa: 0, conta_bancaria: null },
          { nome: 'Débito', tipo: 'Cartão', taxa: 0, conta_bancaria: null },
          { nome: 'Crédito', tipo: 'Cartão', taxa: 0, conta_bancaria: null }
        ];

        for (const payment of defaultPayments) {
          await pool.query(
            `INSERT INTO pagamentos (
              estabelecimento_id, nome, tipo, taxa, conta_bancaria
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
              estabelecimento_id,
              payment.nome,
              payment.tipo,
              payment.taxa,
              payment.conta_bancaria
            ]
          );
        }
      }

      // Buscar todas as formas de pagamento do estabelecimento
      const result = await pool.query(
        `SELECT * FROM pagamentos 
         WHERE estabelecimento_id = $1 
         ORDER BY nome ASC`,
        [estabelecimento_id]
      );

      res.json({ 
        success: true, 
        data: result.rows 
      });

    } catch (error) {
      console.error('Erro ao listar formas de pagamento:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Editar forma de pagamento
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { 
        nome, 
        tipo, 
        taxa = 0, 
        conta_bancaria = null
      } = req.body;

      // Validações obrigatórias
      if (!nome || nome.trim().length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres' 
        });
      }

      if (!tipo || tipo.trim().length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tipo é obrigatório e deve ter pelo menos 2 caracteres' 
        });
      }

      // Verificar se já existe outra forma de pagamento com mesmo nome no estabelecimento
      const pagamentoAtual = await pool.query(
        'SELECT estabelecimento_id FROM pagamentos WHERE id = $1',
        [id]
      );

      if (pagamentoAtual.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Forma de pagamento não encontrada' 
        });
      }

      const estabelecimento_id = pagamentoAtual.rows[0].estabelecimento_id;

      const nomeExists = await pool.query(
        'SELECT id FROM pagamentos WHERE estabelecimento_id = $1 AND nome = $2 AND id != $3 AND status = true',
        [estabelecimento_id, nome.trim(), id]
      );
      if (nomeExists.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Já existe outra forma de pagamento cadastrada com este nome' 
        });
      }

      // Atualizar forma de pagamento
      const result = await pool.query(
        `UPDATE pagamentos SET 
          nome = $1, tipo = $2, taxa = $3, conta_bancaria = $4, 
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $5 
         RETURNING *`,
        [
          nome.trim(),
          tipo.trim(),
          parseFloat(taxa) || 0,
          conta_bancaria ? conta_bancaria.trim() : null,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Forma de pagamento não encontrada' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Forma de pagamento atualizada com sucesso',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao editar forma de pagamento:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Deletar forma de pagamento
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM pagamentos WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Forma de pagamento não encontrada' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Forma de pagamento deletada com sucesso' 
      });

    } catch (error) {
      console.error('Erro ao deletar forma de pagamento:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Alterar status da forma de pagamento
  async alterarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (typeof status !== 'boolean') {
        return res.status(400).json({ 
          success: false, 
          message: 'Status deve ser true ou false' 
        });
      }

      const result = await pool.query(
        'UPDATE pagamentos SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Forma de pagamento não encontrada' 
        });
      }

      res.json({ 
        success: true, 
        message: `Forma de pagamento ${status ? 'ativada' : 'desativada'} com sucesso`,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao alterar status da forma de pagamento:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Buscar pagamentos de um pedido específico
  async buscarPagamentosPorPedido(req, res) {
    try {
      const { pedido_id } = req.params;

      if (!pedido_id || isNaN(parseInt(pedido_id))) {
        return res.status(400).json({ 
          success: false, 
          message: 'pedido_id é obrigatório e deve ser um número válido' 
        });
      }

      // Buscar pagamentos do pedido com informações do método de pagamento
      const result = await pool.query(
        `SELECT 
          pp.id,
          pp.pedido_id,
          pp.pagamento_id,
          pp.valor_pago,
          pp.criado_em,
          p.nome as pagamento_nome,
          p.tipo as pagamento_tipo,
          p.taxa as pagamento_taxa,
          p.conta_bancaria as pagamento_conta_bancaria
         FROM pedidos_pagamentos pp
         INNER JOIN pagamentos p ON pp.pagamento_id = p.id
         WHERE pp.pedido_id = $1
         ORDER BY pp.criado_em ASC`,
        [pedido_id]
      );

      res.json({ 
        success: true, 
        data: result.rows 
      });

    } catch (error) {
      console.error('Erro ao buscar pagamentos do pedido:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Excluir pagamento específico de um pedido
  async excluirPagamentoDoPedido(req, res) {
    try {
      const { pedido_id, pagamento_id } = req.params;

      if (!pedido_id || isNaN(parseInt(pedido_id))) {
        return res.status(400).json({ 
          success: false, 
          message: 'pedido_id é obrigatório e deve ser um número válido' 
        });
      }

      if (!pagamento_id || isNaN(parseInt(pagamento_id))) {
        return res.status(400).json({ 
          success: false, 
          message: 'pagamento_id é obrigatório e deve ser um número válido' 
        });
      }

      // Excluir o pagamento específico do pedido
      const result = await pool.query(
        'DELETE FROM pedidos_pagamentos WHERE pedido_id = $1 AND pagamento_id = $2 RETURNING *',
        [pedido_id, pagamento_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Pagamento não encontrado para este pedido' 
        });
      }

      // Recalcular valores do pedido
      await this.recalcularValoresPedido(pedido_id);

      res.json({ 
        success: true, 
        message: 'Pagamento excluído com sucesso',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao excluir pagamento do pedido:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Atualizar valor de pagamento específico de um pedido
  async atualizarPagamentoDoPedido(req, res) {
    try {
      const { pedido_id, pagamento_id } = req.params;
      const { valor_pago } = req.body;

      if (!pedido_id || isNaN(parseInt(pedido_id))) {
        return res.status(400).json({ 
          success: false, 
          message: 'pedido_id é obrigatório e deve ser um número válido' 
        });
      }

      if (!pagamento_id || isNaN(parseInt(pagamento_id))) {
        return res.status(400).json({ 
          success: false, 
          message: 'pagamento_id é obrigatório e deve ser um número válido' 
        });
      }

      if (valor_pago === undefined || valor_pago === null || isNaN(parseFloat(valor_pago))) {
        return res.status(400).json({ 
          success: false, 
          message: 'valor_pago é obrigatório e deve ser um número válido' 
        });
      }

      const valorPago = parseFloat(valor_pago);

      if (valorPago < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'valor_pago não pode ser negativo' 
        });
      }

      // Atualizar o valor do pagamento
      const result = await pool.query(
        'UPDATE pedidos_pagamentos SET valor_pago = $1 WHERE pedido_id = $2 AND pagamento_id = $3 RETURNING *',
        [valorPago, pedido_id, pagamento_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Pagamento não encontrado para este pedido' 
        });
      }

      // Recalcular valores do pedido
      await this.recalcularValoresPedido(pedido_id);

      res.json({ 
        success: true, 
        message: 'Valor do pagamento atualizado com sucesso',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar pagamento do pedido:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Listar histórico de pagamentos por caixa
  async listarHistoricoPorCaixa(req, res) {
    try {
      const { caixa_id } = req.params;
      const { estabelecimento_id } = req.query;

      if (!caixa_id || !estabelecimento_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'caixa_id e estabelecimento_id são obrigatórios' 
        });
      }

      // Verificar se o caixa pertence ao estabelecimento
      const caixaExiste = await pool.query(
        'SELECT id FROM caixas WHERE id = $1 AND estabelecimento_id = $2',
        [caixa_id, estabelecimento_id]
      );

      if (caixaExiste.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Caixa não encontrado para este estabelecimento' 
        });
      }

      // Buscar pagamentos históricos do caixa
      const pagamentos = await pool.query(
        `SELECT 
           pph.id,
           pph.pedido_id,
           pph.pagamento_id,
           pph.valor_pago,
           pph.criado_em,
           pph.finalizado_em,
           pph.caixa_id,
           p.nome as pagamento_nome,
           p.tipo as pagamento_tipo,
           p.taxa as pagamento_taxa,
           ph.codigo as pedido_codigo,
           ph.valor_total as pedido_valor_total,
           ph.finalizado_em as pedido_finalizado_em
         FROM pedidos_pagamentos_historico pph
         INNER JOIN pagamentos p ON pph.pagamento_id = p.id
         INNER JOIN pedidos_historico ph ON pph.pedido_id = ph.pedido_id
         WHERE pph.caixa_id = $1
         ORDER BY pph.finalizado_em DESC`,
        [caixa_id]
      );

      // Calcular totais por forma de pagamento
      const totaisPorPagamento = {};
      let totalGeral = 0;

      pagamentos.rows.forEach(pagamento => {
        const pagamentoId = pagamento.pagamento_id;
        const valor = parseFloat(pagamento.valor_pago || 0);
        
        if (!totaisPorPagamento[pagamentoId]) {
          totaisPorPagamento[pagamentoId] = {
            pagamento_id: pagamentoId,
            pagamento_nome: pagamento.pagamento_nome,
            pagamento_tipo: pagamento.pagamento_tipo,
            total: 0,
            quantidade: 0
          };
        }
        
        totaisPorPagamento[pagamentoId].total += valor;
        totaisPorPagamento[pagamentoId].quantidade += 1;
        totalGeral += valor;
      });

      // Converter para array e ordenar por total
      const resumoPagamentos = Object.values(totaisPorPagamento)
        .sort((a, b) => b.total - a.total);

      res.json({ 
        success: true, 
        data: {
          pagamentos: pagamentos.rows,
          resumo: resumoPagamentos,
          total_geral: totalGeral,
          total_pagamentos: pagamentos.rows.length
        }
      });

    } catch (error) {
      console.error('Erro ao listar histórico de pagamentos por caixa:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Função auxiliar para recalcular valores do pedido
  async recalcularValoresPedido(pedido_id) {
    try {
      // Buscar todos os pagamentos do pedido
      const pagamentos = await pool.query(
        'SELECT valor_pago FROM pedidos_pagamentos WHERE pedido_id = $1',
        [pedido_id]
      );

      // Calcular total pago
      const totalPago = pagamentos.rows.reduce((acc, pag) => acc + parseFloat(pag.valor_pago || 0), 0);

      // Buscar dados do pedido para calcular valor restante
      const pedido = await pool.query(
        'SELECT subtotal, desconto, acrescimos FROM pedidos WHERE id = $1',
        [pedido_id]
      );

      if (pedido.rows.length > 0) {
        const pedidoData = pedido.rows[0];
        const subtotal = parseFloat(pedidoData.subtotal || 0);
        const desconto = parseFloat(pedidoData.desconto || 0);
        const acrescimos = parseFloat(pedidoData.acrescimos || 0);
        
        const totalFinal = Math.max(0, subtotal + acrescimos - desconto);
        const valorRestante = Math.max(0, totalFinal - totalPago);

        // Atualizar valores no pedido
        await pool.query(
          'UPDATE pedidos SET valor_pago = $1, valor_restante = $2 WHERE id = $3',
          [totalPago, valorRestante, pedido_id]
        );
      }
    } catch (error) {
      console.error('Erro ao recalcular valores do pedido:', error);
    }
  }
};

export default pagamentosController;


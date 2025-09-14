import pool from '../config/db.js';

const caixasController = {
  // Abrir um caixa
  async abrir(req, res) {
    try {
      const { estabelecimento_id, valor_abertura } = req.body;
      const usuario_id = req.usuario?.id; // ID do usuário logado

      if (!estabelecimento_id || !valor_abertura) {
        return res.status(400).json({ success: false, message: 'estabelecimento_id e valor_abertura são obrigatórios' });
      }

      if (!usuario_id) {
        return res.status(400).json({ success: false, message: 'Usuário não identificado' });
      }

      const valor = Number.parseFloat(valor_abertura);
      if (Number.isNaN(valor) || valor <= 0) {
        return res.status(400).json({ success: false, message: 'valor_abertura inválido' });
      }

      const query = `
        INSERT INTO caixas (
          estabelecimento_id,
          valor_abertura,
          data_abertura,
          entradas,
          saidas,
          status,
          aberto_por
        ) VALUES ($1, $2, CURRENT_TIMESTAMP, 0, 0, true, $3)
        RETURNING id, estabelecimento_id, valor_abertura, data_abertura, entradas, saidas, status, aberto_por, criado_em, updated_at
      `;

      const result = await pool.query(query, [estabelecimento_id, valor, usuario_id]);
      return res.status(201).json({ success: true, message: 'Caixa aberto com sucesso', data: result.rows[0] });
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  },

  // Adicionar entrada ao caixa aberto
  async adicionarEntrada(req, res) {
    try {
      const { estabelecimento_id, valor } = req.body;
      const estId = Number(estabelecimento_id);
      const v = Number(valor);
      if (!estId || Number.isNaN(v) || v <= 0) {
        return res.status(400).json({ success: false, message: 'estabelecimento_id e valor (>0) são obrigatórios' });
      }
      const sel = await pool.query(
        `SELECT * FROM caixas WHERE estabelecimento_id = $1 AND status = true ORDER BY data_abertura DESC LIMIT 1`,
        [estId]
      );
      if (sel.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Nenhum caixa aberto' });
      }
      const aberto = sel.rows[0];
      const upd = await pool.query(
        `UPDATE caixas
            SET entradas = COALESCE(entradas, 0) + $1,
                updated_at = NOW()
          WHERE id = $2
          RETURNING *`,
        [v, aberto.id]
      );
      return res.json({ success: true, data: upd.rows[0] });
    } catch (error) {
      console.error('Erro ao adicionar entrada:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  },

  // Adicionar saída ao caixa aberto
  async adicionarSaida(req, res) {
    try {
      const { estabelecimento_id, valor } = req.body;
      const estId = Number(estabelecimento_id);
      const v = Number(valor);
      if (!estId || Number.isNaN(v) || v <= 0) {
        return res.status(400).json({ success: false, message: 'estabelecimento_id e valor (>0) são obrigatórios' });
      }
      const sel = await pool.query(
        `SELECT * FROM caixas WHERE estabelecimento_id = $1 AND status = true ORDER BY data_abertura DESC LIMIT 1`,
        [estId]
      );
      if (sel.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Nenhum caixa aberto' });
      }
      const aberto = sel.rows[0];
      const upd = await pool.query(
        `UPDATE caixas
            SET saidas = COALESCE(saidas, 0) + $1,
                updated_at = NOW()
          WHERE id = $2
          RETURNING *`,
        [v, aberto.id]
      );
      return res.json({ success: true, data: upd.rows[0] });
    } catch (error) {
      console.error('Erro ao adicionar saída:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  },

  // Obter caixa aberto e agregados (acréscimos, retiradas, total de vendas)
  async getAberto(req, res) {
    try {
      const { estabelecimento_id } = req.params;
      // caixa aberto = status true e sem data_fechamento
      const sel = await pool.query(
        `SELECT *, 
                (valor_abertura + COALESCE(entradas, 0) - COALESCE(saidas, 0)) AS saldo_total
         FROM caixas 
         WHERE estabelecimento_id = $1 AND status = true 
         ORDER BY data_abertura DESC LIMIT 1`,
        [estabelecimento_id]
      );
      const aberto = sel.rows[0] || null;
      if (!aberto) {
        return res.json({ success: true, data: null });
      }

      // Agregados: somas do próprio caixa e total de vendas no período
      const entradas = Number(aberto.entradas || 0);
      const saidas = Number(aberto.saidas || 0);
      const saldo_total = Number(aberto.saldo_total || 0);

      const vendasSum = await pool.query(
        `SELECT COALESCE(SUM(p.valor_total), 0) AS total_vendas
           FROM pedidos p
          WHERE p.caixa_id = $1
            AND LOWER(p.status) = 'finalizado'`,
        [aberto.id]
      );
      const total_vendas = Number(vendasSum.rows[0].total_vendas || 0);

      return res.json({ success: true, data: { caixa: aberto, entradas, saidas, total_vendas, saldo_total } });
    } catch (error) {
      console.error('Erro ao obter caixa aberto:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  },

  // Fechar caixa (opcionalmente recebendo valor_fechamento)
  async fechar(req, res) {
    try {
      const { estabelecimento_id, valor_fechamento, valor_cedulas } = req.body;
      const usuario_id = req.usuario?.id; // ID do usuário logado

      if (!estabelecimento_id) {
        return res.status(400).json({ success: false, message: 'estabelecimento_id é obrigatório' });
      }

      if (!usuario_id) {
        return res.status(400).json({ success: false, message: 'Usuário não identificado' });
      }

      const sel = await pool.query(
        `SELECT * FROM caixas WHERE estabelecimento_id = $1 AND status = true ORDER BY data_abertura DESC LIMIT 1`,
        [estabelecimento_id]
      );
      if (sel.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Nenhum caixa aberto' });
      }
      const aberto = sel.rows[0];

      // Calcular saldo total (valor_abertura + entradas - saidas)
      const saldo_total = Number(aberto.valor_abertura || 0) + Number(aberto.entradas || 0) - Number(aberto.saidas || 0);

      // Calcular valor total de fechamento (valor_fechamento + valor_cedulas)
      const vf = valor_fechamento !== undefined && valor_fechamento !== null ? Number(valor_fechamento) : 0;
      const vc = valor_cedulas !== undefined && valor_cedulas !== null ? Number(valor_cedulas) : 0;
      const valor_total_fechamento = vf + vc;

      // Calcular diferença (valor_total_fechamento - saldo_total)
      const diferenca = valor_total_fechamento - saldo_total;

      // total vendas no período
      const vendasSum = await pool.query(
        `SELECT COALESCE(SUM(p.valor_total), 0) AS total_vendas
           FROM pedidos p
          WHERE p.caixa_id = $1
            AND LOWER(p.status) = 'finalizado'`,
        [aberto.id]
      );
      const total_vendas = Number(vendasSum.rows[0].total_vendas || 0);

      const upd = await pool.query(
        `UPDATE caixas 
            SET status = false,
                data_fechamento = NOW(),
                valor_fechamento = $1,
                diferenca = $2,
                total_vendas = $3,
                fechado_por = $4,
                updated_at = NOW()
          WHERE id = $5
          RETURNING *`,
        [valor_total_fechamento, diferenca, total_vendas, usuario_id, aberto.id]
      );

      return res.json({ 
        success: true, 
        message: 'Caixa fechado com sucesso', 
        data: { 
          caixa: upd.rows[0], 
          saldo_total, 
          valor_total_fechamento, 
          diferenca,
          total_vendas
        } 
      });
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  },
  // Listar caixas por estabelecimento (histórico)
  async listarPorEstabelecimento(req, res) {
    try {
      const { estabelecimento_id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const pageNum = Number.parseInt(page, 10) || 1;
      const pageSize = Number.parseInt(limit, 10) || 10;
      const offset = (pageNum - 1) * pageSize;

      const countQuery = `
        SELECT COUNT(*) AS total
          FROM caixas c
         WHERE c.estabelecimento_id = $1
      `;

      const listQuery = `
        SELECT 
          c.id,
          c.estabelecimento_id,
          c.valor_abertura,
          c.data_abertura,
          COALESCE(c.entradas, 0) AS entradas,
          COALESCE(c.saidas, 0) AS saidas,
          c.valor_fechamento,
          c.data_fechamento,
          COALESCE(c.diferenca, 0) AS diferenca,
          c.status,
          c.aberto_por,
          c.fechado_por,
          c.saldo_total,
          c.criado_em,
          c.updated_at
        FROM caixas c
        WHERE c.estabelecimento_id = $1
        ORDER BY c.data_abertura DESC NULLS LAST, c.id DESC
        LIMIT $2 OFFSET $3
      `;

      const client = await pool.connect();
      let total = 0;
      let rows = [];
      try {
        const countResult = await client.query(countQuery, [estabelecimento_id]);
        total = Number.parseInt(countResult.rows[0].total, 10) || 0;
        const listResult = await client.query(listQuery, [estabelecimento_id, pageSize, offset]);
        rows = listResult.rows;
      } finally {
        client.release();
      }

      const totalPages = Math.ceil(total / pageSize);
      return res.status(200).json({
        success: true,
        data: {
          caixas: rows,
          total,
          page: pageNum,
          totalPages,
          hasMore: pageNum < totalPages
        }
      });
    } catch (error) {
      console.error('Erro ao listar caixas:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  },
};

export default caixasController;



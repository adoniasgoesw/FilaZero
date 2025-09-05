import pool from '../config/db.js';

const DEFAULT_CONFIG = {
  mesasEnabled: true,
  comandasEnabled: false,
  quantidadeMesas: 4,
  quantidadeComandas: 0,
  prefixoComanda: ''
};

function toCamelConfig(row) {
  if (!row) return null;
  return {
    mesasEnabled: !!row.atendimento_mesas,
    comandasEnabled: !!row.atendimento_comandas,
    quantidadeMesas: Number(row.quantidade_mesas ?? 0),
    quantidadeComandas: Number(row.quantidade_comandas ?? 0),
    prefixoComanda: row.prefixo_comanda || ''
  };
}

async function ensureExists(estabelecimentoId) {
  const select = await pool.query(
    'SELECT id FROM pontos_atendimento WHERE estabelecimento_id = $1 LIMIT 1',
    [estabelecimentoId]
  );
  if (select.rows.length > 0) return select.rows[0].id;

  const insert = await pool.query(
    `INSERT INTO pontos_atendimento (
      estabelecimento_id,
      atendimento_mesas,
      atendimento_comandas,
      quantidade_mesas,
      quantidade_comandas,
      prefixo_comanda
    ) VALUES ($1, true, false, 4, 0, '') RETURNING id`,
    [estabelecimentoId]
  );
  return insert.rows[0].id;
}

const pontosConfigController = {
  async getConfig(req, res) {
    try {
      const estabelecimentoId = Number(req.params.estabelecimento_id);
      if (!estabelecimentoId || Number.isNaN(estabelecimentoId)) {
        return res.status(400).json({ success: false, error: 'estabelecimento_id inválido' });
      }

      const result = await pool.query(
        `SELECT atendimento_mesas, atendimento_comandas, quantidade_mesas, quantidade_comandas, prefixo_comanda
         FROM pontos_atendimento
         WHERE estabelecimento_id = $1
         LIMIT 1`,
        [estabelecimentoId]
      );

      if (result.rows.length === 0) {
        return res.json({ success: true, data: null });
      }

      return res.json({ success: true, data: toCamelConfig(result.rows[0]) });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Erro ao obter configuração' });
    }
  },

  async listPoints(req, res) {
    try {
      const estabelecimentoId = Number(req.params.estabelecimento_id);
      if (!estabelecimentoId || Number.isNaN(estabelecimentoId)) {
        return res.status(400).json({ success: false, error: 'estabelecimento_id inválido' });
      }

      const result = await pool.query(
        `SELECT atendimento_mesas, atendimento_comandas, quantidade_mesas, quantidade_comandas, prefixo_comanda
         FROM pontos_atendimento WHERE estabelecimento_id = $1 LIMIT 1`,
        [estabelecimentoId]
      );

      if (result.rows.length === 0) {
        return res.json({ success: true, data: [] });
      }

      // Buscar atendimentos existentes para preencher status/tempo
      const atendRows = await pool.query(
        `SELECT identificador, status, criado_em, atualizado_em, id, nome_ponto
         FROM atendimentos WHERE estabelecimento_id = $1`,
        [estabelecimentoId]
      );
      const idToAtt = new Map();
      const attIdByIdent = new Map();
      atendRows.rows.forEach((row) => {
        const key = String(row.identificador).toLowerCase();
        idToAtt.set(key, {
          status: row.status || 'disponivel',
          criadoEm: row.criado_em,
          atualizadoEm: row.atualizado_em,
          nomePonto: row.nome_ponto || '',
        });
        attIdByIdent.set(key, row.id);
      });

      // Totais por atendimento (último pedido)
      const totals = new Map();
      if (atendRows.rows.length > 0) {
        const ids = atendRows.rows.map(r => r.id);
        const totalsQuery = await pool.query(
          `SELECT p.atendimento_id, p.valor_total
           FROM pedidos p
           INNER JOIN (
             SELECT atendimento_id, MAX(criado_em) AS max_created
             FROM pedidos
             WHERE atendimento_id = ANY($1)
             GROUP BY atendimento_id
           ) last ON last.atendimento_id = p.atendimento_id AND last.max_created = p.criado_em`,
          [ids]
        );
        totalsQuery.rows.forEach((row) => {
          totals.set(row.atendimento_id, Number(row.valor_total) || 0);
        });
      }

      function elapsedLabel(fromDate) {
        try {
          if (!fromDate) return '—';
          const start = new Date(fromDate);
          const now = new Date();
          const ms = Math.max(0, now - start);
          const mins = Math.floor(ms / 60000);
          if (mins < 1) return 'Iniciado agora';
          if (mins < 60) return `${mins} min`;
          const hrs = Math.floor(mins / 60);
          const rem = mins % 60;
          return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
        } catch {
          return '—';
        }
      }

      const cfg = toCamelConfig(result.rows[0]);
      const items = [];
      if (cfg.mesasEnabled) {
        for (let i = 1; i <= cfg.quantidadeMesas; i += 1) {
          const key = `mesa-${i}`;
          const att = idToAtt.get(key);
          const total = totals.get(attIdByIdent.get(key)) || 0;
          const status = att?.status || 'disponivel';
          const tempo = status === 'ocupada'
            ? elapsedLabel(att?.atualizadoEm || att?.criadoEm)
            : (status === 'aberto' ? 'Aberto agora' : '—');
          items.push({
            id: key,
            identificacao: `Mesa ${i}`,
            status,
            tempo,
            nomePedido: att?.nomePonto || '',
            total,
          });
        }
      }
      if (cfg.comandasEnabled) {
        for (let i = 1; i <= cfg.quantidadeComandas; i += 1) {
          const label = cfg.prefixoComanda && cfg.prefixoComanda.trim() ? `${cfg.prefixoComanda.trim()} ${i}` : `Comanda ${i}`;
          const key = `comanda-${i}`;
          const att = idToAtt.get(key);
          const total = totals.get(attIdByIdent.get(key)) || 0;
          const status = att?.status || 'disponivel';
          const tempo = status === 'ocupada'
            ? elapsedLabel(att?.atualizadoEm || att?.criadoEm)
            : (status === 'aberto' ? 'Aberto agora' : '—');
          items.push({
            id: key,
            identificacao: label,
            status,
            tempo,
            nomePedido: att?.nomePonto || '',
            total,
          });
        }
      }

      return res.json({ success: true, data: items });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Erro ao listar pontos de atendimento' });
    }
  },

  async createOrEnsureDefaults(req, res) {
    try {
      const estabelecimentoId = Number(req.params.estabelecimento_id);
      if (!estabelecimentoId || Number.isNaN(estabelecimentoId)) {
        return res.status(400).json({ success: false, error: 'estabelecimento_id inválido' });
      }

      await ensureExists(estabelecimentoId);

      const read = await pool.query(
        `SELECT atendimento_mesas, atendimento_comandas, quantidade_mesas, quantidade_comandas, prefixo_comanda
         FROM pontos_atendimento WHERE estabelecimento_id = $1 LIMIT 1`,
        [estabelecimentoId]
      );

      return res.json({ success: true, data: toCamelConfig(read.rows[0]) });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Erro ao criar configuração' });
    }
  },

  async updateConfig(req, res) {
    try {
      const estabelecimentoId = Number(req.params.estabelecimento_id);
      if (!estabelecimentoId || Number.isNaN(estabelecimentoId)) {
        return res.status(400).json({ success: false, error: 'estabelecimento_id inválido' });
      }

      const payload = req.body || {};
      const mesasEnabled = !!payload.mesasEnabled;
      const comandasEnabled = !!payload.comandasEnabled;

      if (!mesasEnabled && !comandasEnabled) {
        return res.status(400).json({
          success: false,
          error: 'Pelo menos Mesas ou Comandas deve estar habilitado.'
        });
      }

      const quantidadeMesas = Math.max(1, Number(payload.quantidadeMesas ?? DEFAULT_CONFIG.quantidadeMesas));
      const quantidadeComandas = comandasEnabled
        ? Math.max(1, Number(payload.quantidadeComandas ?? 1))
        : 0;
      const prefixoComanda = String(payload.prefixoComanda ?? DEFAULT_CONFIG.prefixoComanda);

      await ensureExists(estabelecimentoId);

      const update = await pool.query(
        `UPDATE pontos_atendimento
         SET 
           atendimento_mesas = $1,
           atendimento_comandas = $2,
           quantidade_mesas = $3,
           quantidade_comandas = $4,
           prefixo_comanda = $5,
           atualizado_em = NOW()
         WHERE estabelecimento_id = $6
         RETURNING atendimento_mesas, atendimento_comandas, quantidade_mesas, quantidade_comandas, prefixo_comanda`,
        [mesasEnabled, comandasEnabled, quantidadeMesas, quantidadeComandas, prefixoComanda, estabelecimentoId]
      );

      return res.json({ success: true, data: toCamelConfig(update.rows[0]) });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Erro ao atualizar configuração' });
    }
  },

  async deleteConfig(req, res) {
    try {
      const estabelecimentoId = Number(req.params.estabelecimento_id);
      if (!estabelecimentoId || Number.isNaN(estabelecimentoId)) {
        return res.status(400).json({ success: false, error: 'estabelecimento_id inválido' });
      }
      const del = await pool.query('DELETE FROM pontos_atendimento WHERE estabelecimento_id = $1 RETURNING id', [estabelecimentoId]);
      return res.json({ success: true, deleted: del.rows.length > 0 });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Erro ao deletar configuração' });
    }
  }
};

export default pontosConfigController;
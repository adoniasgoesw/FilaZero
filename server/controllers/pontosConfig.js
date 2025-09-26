import pool from '../config/db.js';

const DEFAULT_CONFIG = {
  mesasEnabled: true,
  comandasEnabled: false,
  balcaoEnabled: false,
  quantidadeMesas: 4,
  quantidadeComandas: 0,
  quantidadeBalcao: 0,
  prefixoComanda: ''
};

function toCamelConfig(row) {
  if (!row) return null;
  return {
    mesasEnabled: !!row.atendimento_mesas,
    comandasEnabled: !!row.atendimento_comandas,
    balcaoEnabled: !!row.atendimento_balcao,
    quantidadeMesas: Number(row.quantidade_mesas ?? 0),
    quantidadeComandas: Number(row.quantidade_comandas ?? 0),
    quantidadeBalcao: Number(row.quantidade_balcao ?? 0),
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
      atendimento_balcao,
      quantidade_mesas,
      quantidade_comandas,
      quantidade_balcao,
      prefixo_comanda
    ) VALUES ($1, true, false, false, 4, 0, 0, '') RETURNING id`,
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
        `SELECT atendimento_mesas, atendimento_comandas, atendimento_balcao, quantidade_mesas, quantidade_comandas, quantidade_balcao, prefixo_comanda
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
        `SELECT atendimento_mesas, atendimento_comandas, atendimento_balcao, quantidade_mesas, quantidade_comandas, quantidade_balcao, prefixo_comanda
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

      // Totais por atendimento (último pedido) - usando valor_total da tabela pedidos
      const totals = new Map();
      if (atendRows.rows.length > 0) {
        const ids = atendRows.rows.map(r => r.id);
        
        const totalsQuery = await pool.query(
          `SELECT DISTINCT ON (p.atendimento_id) 
             p.atendimento_id, 
             COALESCE(p.valor_total, 0) AS total
           FROM pedidos p
           WHERE p.atendimento_id = ANY($1)
           ORDER BY p.atendimento_id, p.criado_em DESC`,
          [ids]
        );
        totalsQuery.rows.forEach((row) => {
          totals.set(row.atendimento_id, Number(row.total) || 0);
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
      
      // Balcões primeiro (topo da lista)
      if (cfg.balcaoEnabled) {
        for (let i = 1; i <= cfg.quantidadeBalcao; i += 1) {
          const key = `balcao-${i}`;
          const att = idToAtt.get(key);
          const total = totals.get(attIdByIdent.get(key)) || 0;
          items.push({
            id: key,
            identificacao: `Balcão ${i}`,
            status: '', // Balcão não tem status
            tempo: '', // Balcão não tem tempo
            nomePedido: '', // Balcão não tem nome do pedido
            total,
          });
        }
      }
      
      // Mesas
      if (cfg.mesasEnabled) {
        for (let i = 1; i <= cfg.quantidadeMesas; i += 1) {
          const key = `mesa-${i}`;
          const att = idToAtt.get(key);
          const attId = attIdByIdent.get(key);
          const total = totals.get(attId) || 0;
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
      
      // Comandas
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
        `SELECT atendimento_mesas, atendimento_comandas, atendimento_balcao, quantidade_mesas, quantidade_comandas, quantidade_balcao, prefixo_comanda
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
      const balcaoEnabled = !!payload.balcaoEnabled;

      if (!mesasEnabled && !comandasEnabled && !balcaoEnabled) {
        return res.status(400).json({
          success: false,
          error: 'Pelo menos um tipo de atendimento deve estar habilitado.'
        });
      }

      const quantidadeMesas = Math.max(1, Number(payload.quantidadeMesas ?? DEFAULT_CONFIG.quantidadeMesas));
      const quantidadeComandas = comandasEnabled
        ? Math.max(1, Number(payload.quantidadeComandas ?? 1))
        : 0;
      const quantidadeBalcao = balcaoEnabled
        ? Math.max(1, Number(payload.quantidadeBalcao ?? 1))
        : 0;
      const prefixoComanda = String(payload.prefixoComanda ?? DEFAULT_CONFIG.prefixoComanda);

      await ensureExists(estabelecimentoId);

      // Buscar configuração atual para comparar mudanças
      const currentConfig = await pool.query(
        'SELECT atendimento_mesas, atendimento_comandas, atendimento_balcao FROM pontos_atendimento WHERE estabelecimento_id = $1',
        [estabelecimentoId]
      );

      const currentMesasEnabled = currentConfig.rows[0]?.atendimento_mesas || false;
      const currentComandasEnabled = currentConfig.rows[0]?.atendimento_comandas || false;
      const currentBalcaoEnabled = currentConfig.rows[0]?.atendimento_balcao || false;

      // Se desabilitou balcões, deletar todos os atendimentos de balcões
      if (currentBalcaoEnabled && !balcaoEnabled) {
        console.log('🗑️ Desabilitando balcões - deletando atendimentos de balcões');
        await pool.query(
          `DELETE FROM atendimentos 
           WHERE estabelecimento_id = $1 
           AND identificador LIKE 'balcao-%'`,
          [estabelecimentoId]
        );
      }

      // Se desabilitou mesas, deletar todos os atendimentos de mesas
      if (currentMesasEnabled && !mesasEnabled) {
        console.log('🗑️ Desabilitando mesas - deletando atendimentos de mesas');
        await pool.query(
          `DELETE FROM atendimentos 
           WHERE estabelecimento_id = $1 
           AND identificador LIKE 'mesa-%'`,
          [estabelecimentoId]
        );
      }

      // Se desabilitou comandas, deletar todos os atendimentos de comandas
      if (currentComandasEnabled && !comandasEnabled) {
        console.log('🗑️ Desabilitando comandas - deletando atendimentos de comandas');
        await pool.query(
          `DELETE FROM atendimentos 
           WHERE estabelecimento_id = $1 
           AND identificador LIKE 'comanda-%'`,
          [estabelecimentoId]
        );
      }

      const update = await pool.query(
        `UPDATE pontos_atendimento
         SET 
           atendimento_mesas = $1,
           atendimento_comandas = $2,
           atendimento_balcao = $3,
           quantidade_mesas = $4,
           quantidade_comandas = $5,
           quantidade_balcao = $6,
           prefixo_comanda = $7,
           atualizado_em = NOW()
         WHERE estabelecimento_id = $8
         RETURNING atendimento_mesas, atendimento_comandas, atendimento_balcao, quantidade_mesas, quantidade_comandas, quantidade_balcao, prefixo_comanda`,
        [mesasEnabled, comandasEnabled, balcaoEnabled, quantidadeMesas, quantidadeComandas, quantidadeBalcao, prefixoComanda, estabelecimentoId]
      );

      console.log('✅ Configuração atualizada:', {
        mesasEnabled,
        comandasEnabled,
        balcaoEnabled,
        quantidadeMesas,
        quantidadeComandas,
        quantidadeBalcao
      });

      return res.json({ success: true, data: toCamelConfig(update.rows[0]) });
    } catch (err) {
      console.error('❌ Erro ao atualizar configuração:', err);
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
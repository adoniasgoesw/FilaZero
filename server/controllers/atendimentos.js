import pool from '../config/db.js';

export const ensureAtendimento = async (req, res) => {
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    let identificador = String(req.params.identificador || '').trim();
    const nomePonto = (req.body?.nome_ponto === undefined || req.body?.nome_ponto === null)
      ? ''
      : String(req.body?.nome_ponto);
    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    identificador = identificador.toLowerCase();

    // Tenta inserir apenas se não existir. Sem UNIQUE constraint ainda pode haver corrida,
    // mas reduz muito a chance de duplicidade em chamadas simultâneas.
    const insert = await pool.query(
      `INSERT INTO atendimentos (estabelecimento_id, identificador, status, nome_ponto)
       SELECT $1, CAST($2 AS VARCHAR(50)), 'aberto', CAST($3 AS VARCHAR(100))
       WHERE NOT EXISTS (
         SELECT 1 FROM atendimentos WHERE estabelecimento_id = $1 AND identificador = CAST($2 AS VARCHAR(50))
       )
       RETURNING id, status, nome_ponto`,
      [estabelecimentoId, identificador, nomePonto]
    );

    if (insert.rows.length > 0) {
      return res.json({ success: true, data: insert.rows[0], created: true });
    }

    const existing = await pool.query(
      'SELECT id, status, nome_ponto FROM atendimentos WHERE estabelecimento_id = $1 AND identificador = $2 LIMIT 1',
      [estabelecimentoId, identificador]
    );
    return res.json({ success: true, data: existing.rows[0], created: false });
  } catch (err) {
    console.error('Erro ao garantir atendimento:', err);
    return res.status(500).json({ success: false, message: 'Erro ao garantir atendimento' });
  }
};

export const updateNomePonto = async (req, res) => {
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    let identificador = String(req.params.identificador || '').trim().toLowerCase();
    const nomePonto = (req.body?.nome_ponto === undefined || req.body?.nome_ponto === null)
      ? ''
      : String(req.body?.nome_ponto);
    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }
    const upd = await pool.query(
      `UPDATE atendimentos SET nome_ponto = $1, atualizado_em = NOW()
       WHERE estabelecimento_id = $2 AND identificador = $3 RETURNING id, status, nome_ponto`,
      [nomePonto, estabelecimentoId, identificador]
    );
    if (upd.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Atendimento não encontrado' });
    }
    return res.json({ success: true, data: upd.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar nome_ponto do atendimento:', err);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar atendimento' });
  }
};

export const getStatus = async (req, res) => {
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();
    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }
    const row = await pool.query(
      'SELECT status, criado_em FROM atendimentos WHERE estabelecimento_id = $1 AND identificador = $2 LIMIT 1',
      [estabelecimentoId, identificador]
    );
    if (row.rows.length === 0) {
      return res.json({ success: true, data: { status: 'disponivel' } });
    }
    return res.json({ success: true, data: { status: row.rows[0].status, criado_em: row.rows[0].criado_em } });
  } catch (err) {
    console.error('Erro ao obter status do atendimento:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter status' });
  }
};

export const setStatus = async (req, res) => {
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();
    const status = String(req.body?.status || '').trim().toLowerCase();
    if (Number.isNaN(estabelecimentoId) || !identificador || !status) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }
    const upd = await pool.query(
      `UPDATE atendimentos SET status = $1, atualizado_em = NOW()
       WHERE estabelecimento_id = $2 AND identificador = $3 RETURNING id, status`,
      [status, estabelecimentoId, identificador]
    );
    if (upd.rows.length === 0) {
      // Se não existe ainda, cria já com o status informado
      const ins = await pool.query(
        `INSERT INTO atendimentos (estabelecimento_id, identificador, status, nome_ponto)
         VALUES ($1, $2, $3, '') RETURNING id, status`,
        [estabelecimentoId, identificador, status]
      );
      return res.json({ success: true, data: ins.rows[0], created: true });
    }
    return res.json({ success: true, data: upd.rows[0], created: false });
  } catch (err) {
    console.error('Erro ao atualizar status do atendimento:', err);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
  }
};



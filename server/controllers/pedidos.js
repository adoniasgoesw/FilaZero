import pool from '../config/db.js';

async function ensureAtendimentoId(estabelecimentoId, identificador) {
  const sel = await pool.query(
    'SELECT id FROM atendimentos WHERE estabelecimento_id = $1 AND identificador = $2 LIMIT 1',
    [estabelecimentoId, identificador]
  );
  if (sel.rows.length > 0) return sel.rows[0].id;
  const ins = await pool.query(
    `INSERT INTO atendimentos (estabelecimento_id, identificador, status, nome_ponto)
     VALUES ($1, $2, 'aberto', '') RETURNING id`,
    [estabelecimentoId, identificador]
  );
  return ins.rows[0].id;
}

export const upsertPedido = async (req, res) => {
  const client = await pool.connect();
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();
    const body = req.body || {};
    const nomePonto = body.nome_ponto ? String(body.nome_ponto) : '';
    const itens = Array.isArray(body.itens) ? body.itens : [];
    const valorTotal = Number(body.valor_total || 0);
    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    await client.query('BEGIN');

    const atendimentoId = await ensureAtendimentoId(estabelecimentoId, identificador);

    // Atualiza nome_ponto e status
    await client.query(
      `UPDATE atendimentos SET nome_ponto = $1, status = 'ocupada', atualizado_em = NOW()
       WHERE id = $2`,
      [nomePonto, atendimentoId]
    );

    // Verifica se já existe um pedido para este atendimento (usa o mais recente)
    const pedSel = await client.query(
      `SELECT id FROM pedidos WHERE atendimento_id = $1 ORDER BY criado_em DESC LIMIT 1`,
      [atendimentoId]
    );

    let pedidoId;
    if (pedSel.rows.length > 0) {
      pedidoId = pedSel.rows[0].id;
      // Vamos mesclar itens: somar quantidades por produto
    } else {
      const pedIns = await client.query(
        `INSERT INTO pedidos (atendimento_id, valor_total)
         VALUES ($1, $2) RETURNING id, valor_total, criado_em`,
        [atendimentoId, valorTotal]
      );
      pedidoId = pedIns.rows[0].id;
    }

    // Mesclar: para cada item informado, define quantidade igual à informada; se não existir, cria
    for (const it of itens) {
      const produtoId = Number(it.produto_id || it.id);
      const quantidade = Math.max(1, Number(it.quantidade || it.qty || 1));
      const valorUnitario = Number(it.valor_unitario || it.unitPrice || 0);
      // Primeiro tenta atualizar a linha existente (mesmo produto)
      const upd = await client.query(
        `UPDATE itens_pedido
         SET quantidade = $3, valor_unitario = $4
         WHERE pedido_id = $1 AND produto_id = $2
         RETURNING id`,
        [pedidoId, produtoId, quantidade, valorUnitario]
      );
      if (upd.rows.length === 0) {
        // Se não existia, cria nova linha
        await client.query(
          `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, valor_unitario)
           VALUES ($1, $2, $3, $4)`,
          [pedidoId, produtoId, quantidade, valorUnitario]
        );
      }
    }

    // Apagar itens que não vieram no payload (tratando casos de quantidade zerada/removida)
    const payloadProdutoIds = itens.map((it) => Number(it.produto_id || it.id)).filter((v) => !Number.isNaN(v));
    await client.query(
      `DELETE FROM itens_pedido 
       WHERE pedido_id = $1 
         AND (${payloadProdutoIds.length > 0 ? 'NOT (produto_id = ANY($2))' : 'TRUE'})`,
      payloadProdutoIds.length > 0 ? [pedidoId, payloadProdutoIds] : [pedidoId]
    );

    // Recalcula o total a partir dos itens
    const sum = await client.query(
      'SELECT COALESCE(SUM(valor_total),0) AS total FROM itens_pedido WHERE pedido_id = $1',
      [pedidoId]
    );
    const newTotal = Number(sum.rows[0].total) || 0;
    await client.query('UPDATE pedidos SET valor_total = $1 WHERE id = $2', [newTotal, pedidoId]);

    await client.query('COMMIT');
    return res.json({ success: true, data: { pedido_id: pedidoId, valor_total: newTotal }, created: pedSel.rows.length === 0 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao salvar pedido:', err);
    return res.status(500).json({ success: false, message: 'Erro ao salvar pedido' });
  } finally {
    client.release();
  }
};

export const getPedido = async (req, res) => {
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();
    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }
    const att = await pool.query(
      'SELECT id, nome_ponto FROM atendimentos WHERE estabelecimento_id = $1 AND identificador = $2 LIMIT 1',
      [estabelecimentoId, identificador]
    );
    if (att.rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    const atendimentoId = att.rows[0].id;
    const ped = await pool.query(
      `SELECT id, valor_total, criado_em
       FROM pedidos WHERE atendimento_id = $1
       ORDER BY criado_em DESC LIMIT 1`,
      [atendimentoId]
    );
    if (ped.rows.length === 0) {
      return res.json({ success: true, data: { atendimento_id: atendimentoId, nome_ponto: att.rows[0].nome_ponto, pedido: null, itens: [] } });
    }
    const pedido = ped.rows[0];
    const itens = await pool.query(
      `SELECT ip.id, ip.produto_id, ip.quantidade, ip.valor_unitario, ip.valor_total, p.nome AS produto_nome
       FROM itens_pedido ip
       LEFT JOIN produtos p ON p.id = ip.produto_id
       WHERE ip.pedido_id = $1
       ORDER BY ip.id ASC`,
      [pedido.id]
    );
    return res.json({ success: true, data: { atendimento_id: atendimentoId, nome_ponto: att.rows[0].nome_ponto, pedido, itens: itens.rows } });
  } catch (err) {
    console.error('Erro ao obter pedido:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter pedido' });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.item_id, 10);
    if (Number.isNaN(itemId)) {
      return res.status(400).json({ success: false, message: 'item_id inválido' });
    }
    // Descobre o pedido para recalcular
    const sel = await pool.query('SELECT pedido_id FROM itens_pedido WHERE id = $1', [itemId]);
    if (sel.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item não encontrado' });
    }
    const pedidoId = sel.rows[0].pedido_id;
    await pool.query('DELETE FROM itens_pedido WHERE id = $1', [itemId]);
    // Recalcula total do pedido
    const sum = await pool.query('SELECT COALESCE(SUM(valor_total),0) AS total FROM itens_pedido WHERE pedido_id = $1', [pedidoId]);
    await pool.query('UPDATE pedidos SET valor_total = $1 WHERE id = $2', [sum.rows[0].total, pedidoId]);
    return res.json({ success: true, data: { pedido_id: pedidoId, valor_total: sum.rows[0].total } });
  } catch (err) {
    console.error('Erro ao deletar item do pedido:', err);
    return res.status(500).json({ success: false, message: 'Erro ao deletar item do pedido' });
  }
};

export const deletePedido = async (req, res) => {
  const client = await pool.connect();
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();
    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    await client.query('BEGIN');

    const att = await client.query(
      'SELECT id FROM atendimentos WHERE estabelecimento_id = $1 AND identificador = $2 LIMIT 1',
      [estabelecimentoId, identificador]
    );
    if (att.rows.length === 0) {
      await client.query('COMMIT');
      return res.json({ success: true, deleted: false });
    }
    const atendimentoId = att.rows[0].id;

    const pedidos = await client.query('SELECT id FROM pedidos WHERE atendimento_id = $1', [atendimentoId]);
    const pedidoIds = pedidos.rows.map((r) => r.id);
    if (pedidoIds.length > 0) {
      await client.query('DELETE FROM itens_pedido WHERE pedido_id = ANY($1)', [pedidoIds]);
      await client.query('DELETE FROM pedidos WHERE id = ANY($1)', [pedidoIds]);
    }

    await client.query(
      `UPDATE atendimentos 
       SET status = 'disponivel', nome_ponto = '', criado_em = NULL, atualizado_em = NOW()
       WHERE id = $1`,
      [atendimentoId]
    );

    await client.query('COMMIT');
    return res.json({ success: true, deleted: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao deletar pedido do atendimento:', err);
    return res.status(500).json({ success: false, message: 'Erro ao deletar pedido' });
  } finally {
    client.release();
  }
};



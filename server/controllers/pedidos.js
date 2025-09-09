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
      // Limpa itens e complementos existentes para regravar conforme o payload
      await client.query(
        `DELETE FROM complementos_itens_pedido 
         WHERE item_pedido_id IN (SELECT id FROM itens_pedido WHERE pedido_id = $1)`,
        [pedidoId]
      );
      await client.query(`DELETE FROM itens_pedido WHERE pedido_id = $1`, [pedidoId]);
    } else {
      const pedIns = await client.query(
        `INSERT INTO pedidos (atendimento_id, valor_total)
         VALUES ($1, $2) RETURNING id, valor_total, criado_em`,
        [atendimentoId, valorTotal]
      );
      pedidoId = pedIns.rows[0].id;
    }

    // Regrava: para cada item informado, cria uma linha nova; complementos diferentes => linhas diferentes
    for (const it of itens) {
      const produtoId = Number(it.produto_id || it.id);
      const quantidade = Math.max(1, Number(it.quantidade || it.qty || 1));
      const valorUnitario = Number(it.valor_unitario || it.unitPrice || 0);
      const complementos = Array.isArray(it.complementos) ? it.complementos : [];
      if (Number.isNaN(produtoId)) continue;

      const ins = await client.query(
        `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, valor_unitario)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [pedidoId, produtoId, quantidade, valorUnitario]
      );
      const itemPedidoId = ins.rows[0].id;

      // Persistir complementos (se enviados no payload)
      for (const comp of complementos) {
        if (!comp || typeof comp !== 'object') continue;
        const complementoId = Number(comp.complemento_id || comp.id);
        const nomeComplemento = String(comp.nome_complemento || comp.nome || '').trim();
        const compQtd = Math.max(1, Number(comp.quantidade || comp.qty || 1));
        const compVU = Number(comp.valor_unitario || comp.unitPrice || 0);
        const compStatus = comp.status ? String(comp.status) : 'pendente';
        const compDesc = comp.descricao ? String(comp.descricao) : null;
        if (Number.isNaN(complementoId) || !nomeComplemento) continue;

        await client.query(
          `INSERT INTO complementos_itens_pedido
             (item_pedido_id, complemento_id, nome_complemento, quantidade, valor_unitario, status, descricao)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [itemPedidoId, complementoId, nomeComplemento, compQtd, compVU, compStatus, compDesc]
        );
      }
    }

    // Não é necessário apagar itens aqui, pois regravamos todos acima

    // Recalcula o total a partir dos itens + complementos
    const sum = await client.query(
      `SELECT 
         COALESCE((SELECT SUM(valor_total) FROM itens_pedido WHERE pedido_id = $1), 0)
       + COALESCE((
           SELECT SUM((c.quantidade)::numeric * c.valor_unitario)
             FROM complementos_itens_pedido c
             JOIN itens_pedido ip ON ip.id = c.item_pedido_id
            WHERE ip.pedido_id = $1
         ), 0) AS total`,
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

    // Busca todos os complementos destes itens de uma só vez
    const itemIds = itens.rows.map((r) => r.id);
    let complementosByItemId = new Map();
    if (itemIds.length > 0) {
      const comps = await pool.query(
        `SELECT id, item_pedido_id, complemento_id, nome_complemento, quantidade, valor_unitario
           FROM complementos_itens_pedido
          WHERE item_pedido_id = ANY($1)
          ORDER BY id ASC`,
        [itemIds]
      );
      complementosByItemId = comps.rows.reduce((map, row) => {
        const arr = map.get(row.item_pedido_id) || [];
        arr.push(row);
        map.set(row.item_pedido_id, arr);
        return map;
      }, new Map());
    }

    // Monta lista para exibição: 1 linha por item, com todos os complementos agregados
    const itensExibicao = [];
    for (const it of itens.rows) {
      const compls = complementosByItemId.get(it.id) || [];
      // Agregar complementos por id somando quantidades
      const byId = new Map();
      for (const c of compls) {
        const cid = Number(c.complemento_id);
        const q = Math.max(1, Number(c.quantidade) || 0);
        const name = String(c.nome_complemento || '');
        const vu = Number(c.valor_unitario) || 0;
        if (!cid) continue;
        if (!byId.has(cid)) byId.set(cid, { complemento_id: cid, nome_complemento: name, quantidade: q, valor_unitario: vu });
        else {
          const cur = byId.get(cid);
          byId.set(cid, { ...cur, quantidade: (Number(cur.quantidade) || 0) + q });
        }
      }
      itensExibicao.push({
        produto_id: it.produto_id,
        produto_nome: it.produto_nome,
        quantidade: it.quantidade,
        valor_unitario: it.valor_unitario,
        complementos: Array.from(byId.values())
      });
    }

    return res.json({ success: true, data: { atendimento_id: atendimentoId, nome_ponto: att.rows[0].nome_ponto, pedido, itens: itens.rows, itens_exibicao: itensExibicao } });
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
    // Recalcula total do pedido (itens + complementos)
    const sum = await pool.query(
      `SELECT 
         COALESCE((SELECT SUM(valor_total) FROM itens_pedido WHERE pedido_id = $1), 0)
       + COALESCE((
           SELECT SUM((c.quantidade)::numeric * c.valor_unitario)
             FROM complementos_itens_pedido c
             JOIN itens_pedido ip ON ip.id = c.item_pedido_id
            WHERE ip.pedido_id = $1
         ), 0) AS total`,
      [pedidoId]
    );
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


// ===== COMPLEMENTOS DE ITENS DO PEDIDO =====

export const addItemComplementos = async (req, res) => {
  const client = await pool.connect();
  try {
    const itemPedidoId = parseInt(req.params.item_pedido_id, 10);
    if (Number.isNaN(itemPedidoId)) {
      return res.status(400).json({ success: false, message: 'item_pedido_id inválido' });
    }

    // Verifica se o item de pedido existe
    const itemSel = await client.query('SELECT id, pedido_id FROM itens_pedido WHERE id = $1', [itemPedidoId]);
    if (itemSel.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item do pedido não encontrado' });
    }
    const pedidoId = itemSel.rows[0].pedido_id;

    const body = req.body || {};
    const complementos = Array.isArray(body.complementos) ? body.complementos : [body];

    await client.query('BEGIN');

    const results = [];
    for (const comp of complementos) {
      if (!comp || comp === null || typeof comp !== 'object') continue;
      const complementoId = Number(comp.complemento_id);
      const nomeComplemento = String(comp.nome_complemento || comp.nome || '').trim();
      const quantidade = Math.max(1, Number(comp.quantidade || 1));
      const valorUnitario = Number(comp.valor_unitario || comp.unitPrice || 0);
      const status = comp.status ? String(comp.status) : 'pendente';
      const descricao = comp.descricao ? String(comp.descricao) : null;

      if (Number.isNaN(complementoId) || !nomeComplemento) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Dados de complemento inválidos' });
      }

      // Tenta somar à mesma linha (mesmo complemento) se já existir
      const existing = await client.query(
        `SELECT id, quantidade FROM complementos_itens_pedido
         WHERE item_pedido_id = $1 AND complemento_id = $2
         ORDER BY id ASC LIMIT 1`,
        [itemPedidoId, complementoId]
      );

      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        const updated = await client.query(
          `UPDATE complementos_itens_pedido
           SET quantidade = $1, valor_unitario = $2, nome_complemento = COALESCE($3, nome_complemento),
               descricao = COALESCE($4, descricao), status = COALESCE($5, status)
           WHERE id = $6
           RETURNING id, item_pedido_id, complemento_id, nome_complemento, quantidade, valor_unitario, valor_total, status, descricao`,
          [Number(row.quantidade) + quantidade, valorUnitario, nomeComplemento || null, descricao, status, row.id]
        );
        results.push(updated.rows[0]);
      } else {
        const inserted = await client.query(
          `INSERT INTO complementos_itens_pedido
             (item_pedido_id, complemento_id, nome_complemento, quantidade, valor_unitario, status, descricao)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, item_pedido_id, complemento_id, nome_complemento, quantidade, valor_unitario, valor_total, status, descricao`,
          [itemPedidoId, complementoId, nomeComplemento, quantidade, valorUnitario, status, descricao]
        );
        results.push(inserted.rows[0]);
      }
    }

    await client.query('COMMIT');
    // Recalcula total do pedido após alterar complementos
    if (pedidoId) {
      const sum = await pool.query(
        `SELECT 
           COALESCE((SELECT SUM(valor_total) FROM itens_pedido WHERE pedido_id = $1), 0)
         + COALESCE((
             SELECT SUM((c.quantidade)::numeric * c.valor_unitario)
               FROM complementos_itens_pedido c
               JOIN itens_pedido ip ON ip.id = c.item_pedido_id
              WHERE ip.pedido_id = $1
           ), 0) AS total`,
        [pedidoId]
      );
      await pool.query('UPDATE pedidos SET valor_total = $1 WHERE id = $2', [sum.rows[0].total, pedidoId]);
    }
    return res.json({ success: true, data: results });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao adicionar complementos no item do pedido:', err);
    return res.status(500).json({ success: false, message: 'Erro ao adicionar complementos' });
  } finally {
    client.release();
  }
};

export const listItemComplementos = async (req, res) => {
  try {
    const itemPedidoId = parseInt(req.params.item_pedido_id, 10);
    if (Number.isNaN(itemPedidoId)) {
      return res.status(400).json({ success: false, message: 'item_pedido_id inválido' });
    }

    const rows = await pool.query(
      `SELECT id, item_pedido_id, complemento_id, nome_complemento, quantidade, valor_unitario,
              valor_total, status, descricao
         FROM complementos_itens_pedido
        WHERE item_pedido_id = $1
        ORDER BY id ASC`,
      [itemPedidoId]
    );
    return res.json({ success: true, data: rows.rows });
  } catch (err) {
    console.error('Erro ao listar complementos do item do pedido:', err);
    return res.status(500).json({ success: false, message: 'Erro ao listar complementos' });
  }
};


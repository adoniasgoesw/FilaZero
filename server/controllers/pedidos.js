import pool from '../config/db.js';
import jwt from 'jsonwebtoken';

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
    const clienteId = Number(body.cliente_id || 0); // padrão 0 quando não informado
    const pagamentoId = Number(body.pagamento_id || 0); // padrão 0 quando não informado
    // Captura do usuário via token (se houver)
    let usuarioId = 0;
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_aqui');
        usuarioId = Number(decoded?.id || 0) || 0;
      }
    } catch {}
    const canal = body.canal ? String(body.canal) : 'PDV';
    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    await client.query('BEGIN');

    // Localiza o caixa aberto para este estabelecimento (se existir)
    const caixaSel = await client.query(
      `SELECT id FROM caixas 
        WHERE estabelecimento_id = $1 AND status = true 
        ORDER BY data_abertura DESC LIMIT 1`,
      [estabelecimentoId]
    );
    const caixaId = caixaSel.rows.length > 0 ? caixaSel.rows[0].id : null;

    const atendimentoId = await ensureAtendimentoId(estabelecimentoId, identificador);

    // Atualiza nome_ponto e status
    await client.query(
      `UPDATE atendimentos SET nome_ponto = $1, status = 'ocupada', atualizado_em = NOW()
       WHERE id = $2`,
      [nomePonto, atendimentoId]
    );

    // Verifica se já existe um pedido para este atendimento (usa o mais recente)
    const pedSel = await client.query(
      `SELECT id, status FROM pedidos WHERE atendimento_id = $1 ORDER BY criado_em DESC LIMIT 1`,
      [atendimentoId]
    );

    let pedidoId;
    if (pedSel.rows.length > 0 && String(pedSel.rows[0].status || '').toLowerCase() === 'pendente') {
      pedidoId = pedSel.rows[0].id;
      // Reutiliza apenas se o último pedido está pendente
      await client.query(
        `UPDATE pedidos 
            SET caixa_id = COALESCE(caixa_id, $1),
                status = 'pendente',
                cliente_id = COALESCE($2, cliente_id),
                pagamento_id = COALESCE($3, pagamento_id),
                usuario_id = COALESCE($4, usuario_id),
                canal = COALESCE($5, canal)
          WHERE id = $6`,
        [caixaId, clienteId || 0, pagamentoId || 0, usuarioId || null, canal, pedidoId]
      );
      // Limpa itens e complementos existentes para regravar conforme o payload
      await client.query(
        `DELETE FROM complementos_itens_pedido 
         WHERE item_pedido_id IN (SELECT id FROM itens_pedido WHERE pedido_id = $1)`,
        [pedidoId]
      );
      await client.query(`DELETE FROM itens_pedido WHERE pedido_id = $1`, [pedidoId]);
    } else {
      // Gerar código sequencial do pedido para o caixa atual
      let codigoPedido = '01';
      if (caixaId) {
        // Verificar último código na tabela pedidos_historico (pedidos finalizados)
        const ultimoPedidoHistorico = await client.query(
          `SELECT codigo FROM pedidos_historico 
           WHERE caixa_id = $1 
           ORDER BY finalizado_em DESC LIMIT 1`,
          [caixaId]
        );
        
        // Verificar também na tabela pedidos (pedidos ativos)
        const ultimoPedidoAtivo = await client.query(
          `SELECT codigo FROM pedidos 
           WHERE caixa_id = $1 
           ORDER BY criado_em DESC LIMIT 1`,
          [caixaId]
        );
        
        // Pegar o maior código entre histórico e ativos
        let ultimoCodigo = 0;
        if (ultimoPedidoHistorico.rows.length > 0 && ultimoPedidoHistorico.rows[0].codigo) {
          ultimoCodigo = Math.max(ultimoCodigo, parseInt(ultimoPedidoHistorico.rows[0].codigo) || 0);
        }
        if (ultimoPedidoAtivo.rows.length > 0 && ultimoPedidoAtivo.rows[0].codigo) {
          ultimoCodigo = Math.max(ultimoCodigo, parseInt(ultimoPedidoAtivo.rows[0].codigo) || 0);
        }
        
        if (ultimoCodigo > 0) {
          codigoPedido = String(ultimoCodigo + 1).padStart(2, '0');
        }
      }

      const pedIns = await client.query(
        `INSERT INTO pedidos (atendimento_id, valor_total, caixa_id, status, cliente_id, pagamento_id, usuario_id, canal, codigo)
         VALUES ($1, $2, $3, COALESCE($4, 'pendente'), COALESCE($5, 0), COALESCE($6, 0), $7, $8, $9)
         RETURNING id, valor_total, criado_em, codigo`,
        [atendimentoId, valorTotal, caixaId, body.status, clienteId, pagamentoId, usuarioId || null, canal, codigoPedido]
      );
      pedidoId = pedIns.rows[0].id;
    }

    // Agrupar itens por produto_id e somar quantidades
    const itensAgrupados = new Map();
    
    for (const it of itens) {
      const produtoId = Number(it.produto_id || it.id);
      const quantidade = Math.max(1, Number(it.quantidade || it.qty || 1));
      const valorUnitario = Number(it.valor_unitario || it.unitPrice || 0);
      const complementos = Array.isArray(it.complementos) ? it.complementos : [];
      
      if (Number.isNaN(produtoId)) continue;

      if (itensAgrupados.has(produtoId)) {
        // Se o produto já existe, somar a quantidade
        const itemExistente = itensAgrupados.get(produtoId);
        itemExistente.quantidade += quantidade;
        itemExistente.complementos.push(...complementos);
      } else {
        // Se é um produto novo, criar entrada
        itensAgrupados.set(produtoId, {
          produto_id: produtoId,
          quantidade: quantidade,
          valor_unitario: valorUnitario,
          complementos: complementos
        });
      }
    }

    // Inserir itens agrupados
    for (const [produtoId, item] of itensAgrupados) {
      const ins = await client.query(
        `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, valor_unitario)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [pedidoId, item.produto_id, item.quantidade, item.valor_unitario]
      );
      const itemPedidoId = ins.rows[0].id;

      // Persistir complementos (se enviados no payload)
      for (const comp of item.complementos) {
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

    // Deleta apenas o pedido atual (pendente) mais recente deste atendimento
    const pedSel = await client.query(
      `SELECT id FROM pedidos 
         WHERE atendimento_id = $1 AND LOWER(status) = 'pendente' 
         ORDER BY criado_em DESC LIMIT 1`,
      [atendimentoId]
    );

    let deleted = false;
    if (pedSel.rows.length > 0) {
      const pedidoId = pedSel.rows[0].id;
      // Remover complementos ligados aos itens deste pedido
      await client.query(
        `DELETE FROM complementos_itens_pedido 
           WHERE item_pedido_id IN (SELECT id FROM itens_pedido WHERE pedido_id = $1)`,
        [pedidoId]
      );
      // Remover itens do pedido e o pedido em si
      await client.query('DELETE FROM itens_pedido WHERE pedido_id = $1', [pedidoId]);
      await client.query('DELETE FROM pedidos WHERE id = $1', [pedidoId]);
      deleted = true;
    }

    // Liberar o ponto de atendimento, sem apagar registros históricos
    await client.query(
      `UPDATE atendimentos 
         SET status = 'disponivel', nome_ponto = '', criado_em = NULL, atualizado_em = NOW()
       WHERE id = $1`,
      [atendimentoId]
    );

    await client.query('COMMIT');
    return res.json({ success: true, deleted });
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

// ===== FINALIZAR PEDIDO =====
export const finalizarPedido = async (req, res) => {
  const client = await pool.connect();
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();
    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    await client.query('BEGIN');

    // Encontrar atendimento
    const att = await client.query(
      'SELECT id FROM atendimentos WHERE estabelecimento_id = $1 AND identificador = $2 LIMIT 1',
      [estabelecimentoId, identificador]
    );
    if (att.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Atendimento não encontrado' });
    }
    const atendimentoId = att.rows[0].id;

    // Seleciona pedido mais recente deste atendimento
    const pedSel = await client.query(
      `SELECT id FROM pedidos WHERE atendimento_id = $1 ORDER BY criado_em DESC LIMIT 1`,
      [atendimentoId]
    );
    if (pedSel.rows.length === 0) {
      await client.query('COMMIT');
      return res.json({ success: true, message: 'Nada para finalizar' });
    }
    const pedidoId = pedSel.rows[0].id;

    // 1. Copiar dados do pedido para o histórico
    const pedidoHistorico = await client.query(
      `INSERT INTO pedidos_historico 
       (pedido_id, atendimento_id, valor_total, criado_em, finalizado_em, status, 
        cliente_id, pagamento_id, caixa_id, usuario_id, canal, codigo, situacao)
       SELECT id, atendimento_id, valor_total, criado_em, NOW(), status,
              cliente_id, pagamento_id, caixa_id, usuario_id, canal, codigo, 'encerrado'
       FROM pedidos WHERE id = $1
       RETURNING id`,
      [pedidoId]
    );
    
    const pedidoHistoricoId = pedidoHistorico.rows[0].id;

    // 2. Copiar itens do pedido para o histórico (agrupados por produto_id)
    const itensHistorico = await client.query(
      `INSERT INTO itens_pedido_historico 
       (pedido_historico_id, produto_id, quantidade, valor_unitario, valor_total, status)
       SELECT $1, produto_id, SUM(quantidade) as quantidade, valor_unitario, 
              SUM(valor_total) as valor_total, 'finalizado'
       FROM itens_pedido 
       WHERE pedido_id = $2
       GROUP BY produto_id, valor_unitario
       RETURNING id`,
      [pedidoHistoricoId, pedidoId]
    );

    // 3. Copiar complementos dos itens para o histórico (agrupados)
    if (itensHistorico.rows.length > 0) {
      // Buscar os IDs originais dos itens agrupados por produto_id
      const itensOriginais = await client.query(
        `SELECT produto_id, array_agg(id) as item_ids 
         FROM itens_pedido 
         WHERE pedido_id = $1 
         GROUP BY produto_id`,
        [pedidoId]
      );

      // Mapear produto_id para novo item_id do histórico
      const mapeamentoProduto = {};
      itensOriginais.rows.forEach((item, index) => {
        mapeamentoProduto[item.produto_id] = itensHistorico.rows[index].id;
      });

      // Copiar complementos agrupados por complemento_id
      for (const itemOriginal of itensOriginais.rows) {
        const novoItemId = mapeamentoProduto[itemOriginal.produto_id];
        
        await client.query(
          `INSERT INTO complementos_itens_pedido_historico 
           (item_pedido_historico_id, complemento_id, nome_complemento, quantidade, 
            valor_unitario, valor_total, status)
           SELECT $1, complemento_id, nome_complemento, SUM(quantidade) as quantidade,
                  valor_unitario, SUM(valor_unitario * quantidade) as valor_total, 'finalizado'
           FROM complementos_itens_pedido 
           WHERE item_pedido_id = ANY($2)
           GROUP BY complemento_id, nome_complemento, valor_unitario`,
          [novoItemId, itemOriginal.item_ids]
        );
      }
    }

    // 4. Limpar dados das tabelas ativas
    await client.query(
      `DELETE FROM complementos_itens_pedido 
       WHERE item_pedido_id IN (SELECT id FROM itens_pedido WHERE pedido_id = $1)`,
      [pedidoId]
    );
    await client.query(`DELETE FROM itens_pedido WHERE pedido_id = $1`, [pedidoId]);
    await client.query(`DELETE FROM pedidos WHERE id = $1`, [pedidoId]);

    // Libera o ponto de atendimento (status disponivel), zera nome e limpa criado_em
    await client.query(
      `UPDATE atendimentos 
          SET status = 'disponivel', 
              nome_ponto = '', 
              criado_em = NULL,
              atualizado_em = NOW() 
        WHERE id = $1`,
      [atendimentoId]
    );

    await client.query('COMMIT');
    return res.json({ success: true, message: 'Pedido finalizado, dados copiados para histórico e ponto de atendimento liberado' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao finalizar pedido:', err);
    return res.status(500).json({ success: false, message: 'Erro ao finalizar pedido' });
  } finally {
    client.release();
  }
};
// ===== HISTÓRICO DE PEDIDOS =====
export const listarHistorico = async (req, res) => {
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    if (Number.isNaN(estabelecimentoId)) {
      return res.status(400).json({ success: false, message: 'estabelecimento_id inválido' });
    }

    // Filtrar por caixa_id finalizado (obrigatório)
    const caixaId = req.query.caixa_id ? parseInt(req.query.caixa_id, 10) : null;
    if (Number.isNaN(caixaId) || caixaId === null) {
      return res.status(400).json({ success: false, message: 'caixa_id é obrigatório' });
    }

    const rows = await pool.query(
      `SELECT 
         ph.id,
         ph.pedido_id,
         ph.codigo,
         ph.valor_total,
         ph.criado_em,
         ph.finalizado_em,
         a.nome_ponto AS cliente_nome,
         NULL::text AS forma_pagamento,
         COALESCE(ph.canal, 'PDV') AS canal,
         u.nome_completo AS vendido_por,
         ph.situacao
       FROM pedidos_historico ph
       JOIN atendimentos a ON a.id = ph.atendimento_id
       LEFT JOIN usuarios u ON u.id = ph.usuario_id
      WHERE a.estabelecimento_id = $1 AND ph.caixa_id = $2
      ORDER BY ph.finalizado_em DESC
      LIMIT 200`,
      [estabelecimentoId, caixaId]
    );

    return res.json({ success: true, data: rows.rows });
  } catch (err) {
    console.error('Erro ao listar histórico de pedidos:', err);
    return res.status(500).json({ success: false, message: 'Erro ao listar histórico de pedidos' });
  }
};

// ===== DETALHES DO PEDIDO =====
export const getDetalhesPedido = async (req, res) => {
  try {
    const pedidoId = parseInt(req.params.pedido_id, 10);
    
    if (!pedidoId || pedidoId <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do pedido inválido'
      });
    }

    // Buscar dados básicos do pedido no histórico
    const pedido = await pool.query(
      `SELECT 
         ph.id,
         ph.pedido_id,
         ph.codigo,
         ph.valor_total,
         ph.criado_em,
         ph.finalizado_em,
         ph.status,
         ph.canal,
         ph.situacao,
         a.nome_ponto AS cliente_nome,
         u.nome_completo AS vendido_por
       FROM pedidos_historico ph
       JOIN atendimentos a ON a.id = ph.atendimento_id
       LEFT JOIN usuarios u ON u.id = ph.usuario_id
      WHERE ph.pedido_id = $1`,
      [pedidoId]
    );

    if (pedido.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
    }

    const pedidoData = pedido.rows[0];

    // Buscar itens do pedido no histórico
    const pedidoHistoricoId = pedido.rows[0].id;
    const itens = await pool.query(
      `SELECT 
         iph.id,
         iph.quantidade,
         iph.valor_unitario,
         iph.valor_total,
         COALESCE(p.nome, 'Produto não encontrado') AS produto_nome,
         COALESCE(p.descricao, '') AS produto_descricao
       FROM itens_pedido_historico iph
       LEFT JOIN produtos p ON p.id = iph.produto_id
      WHERE iph.pedido_historico_id = $1
      ORDER BY iph.id ASC`,
      [pedidoHistoricoId]
    );

    // Buscar complementos dos itens no histórico
    const itemIds = itens.rows.map(item => item.id);
    let complementos = [];
    if (itemIds.length > 0) {
      const complementosResult = await pool.query(
        `SELECT 
           ciph.id,
           ciph.item_pedido_historico_id AS item_pedido_id,
           ciph.nome_complemento,
           ciph.quantidade,
           ciph.valor_unitario,
           ciph.valor_total
         FROM complementos_itens_pedido_historico ciph
        WHERE ciph.item_pedido_historico_id = ANY($1)
        ORDER BY ciph.item_pedido_historico_id, ciph.id`,
        [itemIds]
      );
      complementos = complementosResult.rows;
    }

    // Organizar complementos por item
    const complementosPorItem = {};
    complementos.forEach(comp => {
      if (!complementosPorItem[comp.item_pedido_id]) {
        complementosPorItem[comp.item_pedido_id] = [];
      }
      complementosPorItem[comp.item_pedido_id].push(comp);
    });

    // Adicionar complementos aos itens
    const itensComComplementos = itens.rows.map(item => ({
      ...item,
      complementos: complementosPorItem[item.id] || []
    }));

    return res.json({
      success: true,
      data: {
        pedido: pedidoData,
        itens: itensComComplementos
      }
    });
  } catch (err) {
    console.error('❌ Erro ao buscar detalhes do pedido:', err);
    return res.status(500).json({ success: false, message: 'Erro ao buscar detalhes do pedido' });
  }
};


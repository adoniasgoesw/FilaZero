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
    console.log('🚀 Iniciando upsertPedido...');
    console.log('📝 Parâmetros:', req.params);
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
    
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();
    const body = req.body || {};
    const nomePonto = body.nome_ponto ? String(body.nome_ponto) : '';
    const itens = Array.isArray(body.itens) ? body.itens : [];
    const valorTotal = Number(body.valor_total || 0);
    const clienteId = body.cliente_id ? Number(body.cliente_id) : null; // null quando não informado
    const pagamentoId = Number(body.pagamento_id || 0); // padrão 0 quando não informado
    
    console.log('🔍 Dados processados:', {
      estabelecimentoId,
      identificador,
      nomePonto,
      itensCount: itens.length,
      valorTotal,
      clienteId,
      pagamentoId
    });
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
      // Só atualiza cliente_id se foi fornecido no body
      if (clienteId !== null) {
        await client.query(
          `UPDATE pedidos 
              SET caixa_id = COALESCE(caixa_id, $1),
                  status = 'pendente',
                  cliente_id = $2,
                  pagamento_id = COALESCE($3, pagamento_id),
                  usuario_id = COALESCE($4, usuario_id),
                  canal = COALESCE($5, canal)
            WHERE id = $6`,
          [caixaId, clienteId, pagamentoId || 0, usuarioId || null, canal, pedidoId]
        );
      } else {
        await client.query(
          `UPDATE pedidos 
              SET caixa_id = COALESCE(caixa_id, $1),
                  status = 'pendente',
                  pagamento_id = COALESCE($2, pagamento_id),
                  usuario_id = COALESCE($3, usuario_id),
                  canal = COALESCE($4, canal)
            WHERE id = $5`,
          [caixaId, pagamentoId || 0, usuarioId || null, canal, pedidoId]
        );
      }
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
        `INSERT INTO pedidos (atendimento_id, caixa_id, status, cliente_id, pagamento_id, usuario_id, canal, codigo)
         VALUES ($1, $2, COALESCE($3, 'pendente'), COALESCE($4, 0), COALESCE($5, 0), $6, $7, $8)
         RETURNING id, valor_total, criado_em, codigo`,
        [atendimentoId, caixaId, body.status, clienteId || 0, pagamentoId, usuarioId || null, canal, codigoPedido]
      );
      pedidoId = pedIns.rows[0].id;
    }

    // Função para gerar assinatura única dos complementos considerando categorias
    const buildComplementSignature = async (complements, produtoId) => {
      const list = Array.isArray(complements) ? complements : [];
      if (list.length === 0) return 'none';
      
      // Buscar categorias dos complementos para este produto
      const categoriasResult = await client.query(`
        SELECT cc.id as categoria_id, cc.nome as categoria_nome, ic.complemento_id
        FROM categorias_complementos cc
        JOIN itens_complementos ic ON ic.categoria_id = cc.id
        WHERE cc.produto_id = $1 AND cc.status = true
      `, [produtoId]);
      
      const categoriasMap = new Map();
      categoriasResult.rows.forEach(row => {
        categoriasMap.set(row.complemento_id, {
          categoria_id: row.categoria_id,
          categoria_nome: row.categoria_nome
        });
      });
      
      const normalized = list
        .map((c) => {
          const complementoId = Number(c.complemento_id ?? c.id);
          const categoria = categoriasMap.get(complementoId);
          return {
            id: complementoId,
            qty: Number(c.quantidade ?? c.qty) > 0 ? Number(c.quantidade ?? c.qty) : 1,
            categoria_id: categoria?.categoria_id || 0,
            categoria_nome: categoria?.categoria_nome || 'sem_categoria'
          };
        })
        .filter((c) => c.id)
        .sort((a, b) => {
          // Ordenar primeiro por categoria, depois por ID
          if (a.categoria_id !== b.categoria_id) {
            return a.categoria_id - b.categoria_id;
          }
          return a.id - b.id;
        })
        .map((c) => `${c.categoria_id}:${c.id}x${c.qty}`);
      return normalized.length ? normalized.join(',') : 'none';
    };

    // Agrupar itens por produto_id + assinatura de complementos
    const itensAgrupados = new Map();
    
    for (const it of itens) {
      const produtoId = Number(it.produto_id || it.id);
      const quantidade = Math.max(1, Number(it.quantidade || it.qty || 1));
      const valorUnitario = Number(it.valor_unitario || it.unitPrice || 0);
      const complementos = Array.isArray(it.complementos) ? it.complementos : [];
      const signature = await buildComplementSignature(complementos, produtoId);
      const key = `${produtoId}|${signature}`;
      
      if (Number.isNaN(produtoId)) continue;

      if (itensAgrupados.has(key)) {
        // Se o produto + complementos já existe, somar a quantidade
        const itemExistente = itensAgrupados.get(key);
        itemExistente.quantidade += quantidade;
      } else {
        // Se é um produto + complementos novo, criar entrada
        itensAgrupados.set(key, {
          produto_id: produtoId,
          quantidade: quantidade,
          valor_unitario: valorUnitario,
          complementos: complementos
        });
      }
    }

    // Inserir itens agrupados
    for (const [key, item] of itensAgrupados) {
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

    // Calculate and update valor_total manually
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
    const itemsTotal = Number(sum.rows[0].total) || 0;
    
    // Get current desconto and acrescimos
    const pedidoData = await client.query(
      'SELECT COALESCE(desconto, 0) as desconto, COALESCE(acrescimos, 0) as acrescimos FROM pedidos WHERE id = $1',
      [pedidoId]
    );
    const descontoAtual = Number(pedidoData.rows[0].desconto) || 0;
    const acrescimosAtual = Number(pedidoData.rows[0].acrescimos) || 0;
    
    // Calculate final total: items + complements + surcharges - discounts
    const finalTotal = itemsTotal + acrescimosAtual - descontoAtual;
    
    console.log(`💰 Calculando valor_total para pedido ${pedidoId}:`);
    console.log(`  - Items total: R$ ${itemsTotal}`);
    console.log(`  - Acréscimos: R$ ${acrescimosAtual}`);
    console.log(`  - Desconto: R$ ${descontoAtual}`);
    console.log(`  - Total final: R$ ${finalTotal}`);
    
    // Update valor_total in the database
    await client.query('UPDATE pedidos SET valor_total = $1 WHERE id = $2', [finalTotal, pedidoId]);
    console.log(`✅ valor_total atualizado no banco de dados: R$ ${finalTotal}`);

    await client.query('COMMIT');
    console.log('✅ Pedido salvo com sucesso:', { pedido_id: pedidoId, valor_total: finalTotal });
    return res.json({ success: true, data: { pedido_id: pedidoId, valor_total: finalTotal }, created: pedSel.rows.length === 0 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao salvar pedido:', err);
    console.error('❌ Stack trace:', err.stack);
    console.error('❌ Parâmetros da requisição:', req.params);
    console.error('❌ Body da requisição:', req.body);
    return res.status(500).json({ success: false, message: 'Erro ao salvar pedido', error: err.message });
  } finally {
    client.release();
  }
};

// ===== CRIAR PEDIDO VAZIO =====
export const criarPedidoVazio = async (req, res) => {
  const client = await pool.connect();
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();
    const body = req.body || {};
    const nomePonto = body.nome_ponto ? String(body.nome_ponto) : '';
    
    // Captura do usuário via token (se houver)
    let usuarioId = null;
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_aqui');
        usuarioId = Number(decoded?.id || 0) || null;
      }
    } catch {}
    
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

    // Atualiza nome_ponto e status do atendimento
    await client.query(
      `UPDATE atendimentos SET nome_ponto = $1, status = 'aberto', atualizado_em = NOW()
       WHERE id = $2`,
      [nomePonto, atendimentoId]
    );

    // Verificar se já existe um pedido pendente para este atendimento
    const pedSel = await client.query(
      `SELECT id FROM pedidos WHERE atendimento_id = $1 AND LOWER(status) = 'pendente' ORDER BY criado_em DESC LIMIT 1`,
      [atendimentoId]
    );

    let pedidoId;
    let created = false;
    
    if (pedSel.rows.length > 0) {
      // Se já existe pedido pendente, usar o existente
      pedidoId = pedSel.rows[0].id;
      console.log(`📋 Usando pedido existente: ID ${pedidoId}`);
    } else {
      // Se não existe, criar um novo pedido
      console.log(`📝 Criando novo pedido para atendimento ${atendimentoId}`);
      
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

      // Criar novo pedido vazio
      const pedIns = await client.query(
        `INSERT INTO pedidos (atendimento_id, caixa_id, status, cliente_id, pagamento_id, usuario_id, canal, codigo, valor_total)
         VALUES ($1, $2, 'pendente', 0, 0, $4, 'PDV', $3, 0)
         RETURNING id, valor_total, criado_em, codigo`,
        [atendimentoId, caixaId, codigoPedido, usuarioId]
      );
      pedidoId = pedIns.rows[0].id;
      created = true;
      console.log(`✅ Novo pedido criado: ID ${pedidoId}`);
    }

    await client.query('COMMIT');
    
    console.log(`✅ Pedido processado: ID ${pedidoId} para atendimento ${atendimentoId} (criado: ${created})`);
    
    return res.json({ 
      success: true, 
      data: { 
        pedido_id: pedidoId, 
        atendimento_id: atendimentoId,
        valor_total: 0,
        created: created
      } 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar pedido vazio:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar pedido vazio' });
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
      `SELECT p.id, p.valor_total, p.criado_em, p.desconto, p.acrescimos, p.cliente_id,
              p.valor_pago, p.valor_restante, p.valor_troco, p.pagamento_id, p.codigo,
              c.nome AS cliente_nome, c.cpf, c.cnpj, c.endereco, c.whatsapp, c.email, c.taxa_entrega,
              pag.nome AS pagamento_nome, pag.tipo AS pagamento_tipo, pag.conta_bancaria AS pagamento_conta,
              u.nome_completo AS vendido_por
       FROM pedidos p
       LEFT JOIN clientes c ON c.id = p.cliente_id AND c.estabelecimento_id = $2 AND c.status = true
       LEFT JOIN pagamentos pag ON pag.id = p.pagamento_id AND pag.estabelecimento_id = $2 AND pag.status = true
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       WHERE p.atendimento_id = $1
       ORDER BY p.criado_em DESC LIMIT 1`,
      [atendimentoId, estabelecimentoId]
    );
    if (ped.rows.length === 0) {
      return res.json({ success: true, data: { atendimento_id: atendimentoId, nome_ponto: att.rows[0].nome_ponto, pedido: null, itens: [] } });
    }
    const pedido = ped.rows[0];
    
    // Buscar detalhes dos pagamentos
    const pagamentosDetalhes = await pool.query(
      `SELECT pp.pagamento_id, pp.valor_pago, pag.nome AS pagamento_nome, pag.tipo AS pagamento_tipo
       FROM pedidos_pagamentos pp
       LEFT JOIN pagamentos pag ON pag.id = pp.pagamento_id
       WHERE pp.pedido_id = $1
       ORDER BY pp.criado_em`,
      [pedido.id]
    );
    
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

    // Monta lista para exibição: 1 linha por item, mantendo complementos originais
    const itensExibicao = [];
    for (const it of itens.rows) {
      const compls = complementosByItemId.get(it.id) || [];
      // Manter complementos originais sem agregação
      const complementos = compls.map(c => ({
        complemento_id: Number(c.complemento_id),
        nome_complemento: String(c.nome_complemento || ''),
        quantidade: Math.max(1, Number(c.quantidade) || 0),
        valor_unitario: Number(c.valor_unitario) || 0
      }));
      
      itensExibicao.push({
        produto_id: it.produto_id,
        produto_nome: it.produto_nome,
        quantidade: it.quantidade,
        valor_unitario: it.valor_unitario,
        complementos: complementos
      });
    }

    // Preparar dados do cliente se existir
    const cliente = pedido.cliente_id ? {
      id: pedido.cliente_id,
      nome: pedido.cliente_nome,
      cpf: pedido.cpf,
      cnpj: pedido.cnpj,
      endereco: pedido.endereco,
      whatsapp: pedido.whatsapp,
      email: pedido.email,
      taxa_entrega: pedido.taxa_entrega
    } : null;

    return res.json({ 
      success: true, 
      data: { 
        atendimento_id: atendimentoId, 
        nome_ponto: att.rows[0].nome_ponto, 
        pedido: {
          id: pedido.id,
          codigo: pedido.codigo,
          valor_total: pedido.valor_total,
          criado_em: pedido.criado_em,
          desconto: pedido.desconto,
          acrescimos: pedido.acrescimos,
          cliente_id: pedido.cliente_id,
          valor_pago: pedido.valor_pago,
          valor_restante: pedido.valor_restante,
          valor_troco: pedido.valor_troco,
          pagamento_id: pedido.pagamento_id,
          pagamento_nome: pedido.pagamento_nome,
          pagamento_tipo: pedido.pagamento_tipo,
          pagamento_conta: pedido.pagamento_conta,
          vendido_por: pedido.vendido_por
        }, 
        cliente: cliente,
        itens: itens.rows, 
        itens_exibicao: itensExibicao,
        pagamentos_detalhes: pagamentosDetalhes.rows
      } 
    });
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
    // Calculate and update valor_total manually
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
    const itemsTotal = Number(sum.rows[0].total) || 0;
    
    // Get current desconto and acrescimos
    const pedidoData = await pool.query(
      'SELECT COALESCE(desconto, 0) as desconto, COALESCE(acrescimos, 0) as acrescimos FROM pedidos WHERE id = $1',
      [pedidoId]
    );
    const descontoAtual = Number(pedidoData.rows[0].desconto) || 0;
    const acrescimosAtual = Number(pedidoData.rows[0].acrescimos) || 0;
    
    // Calculate final total: items + complements + surcharges - discounts
    const finalTotal = itemsTotal + acrescimosAtual - descontoAtual;
    
    // valor_total é calculado automaticamente pelo banco (coluna gerada)
    // Não precisamos atualizá-lo manualmente
    
    return res.json({ success: true, data: { pedido_id: pedidoId, valor_total: finalTotal } });
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
    
    // Calculate and update valor_total manually
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
      const itemsTotal = Number(sum.rows[0].total) || 0;
      
      // Get current desconto and acrescimos
      const pedidoData = await pool.query(
        'SELECT COALESCE(desconto, 0) as desconto, COALESCE(acrescimos, 0) as acrescimos FROM pedidos WHERE id = $1',
        [pedidoId]
      );
      const descontoAtual = Number(pedidoData.rows[0].desconto) || 0;
      const acrescimosAtual = Number(pedidoData.rows[0].acrescimos) || 0;
      
      // Calculate final total: items + complements + surcharges - discounts
      const finalTotal = itemsTotal + acrescimosAtual - descontoAtual;
      
      // Update valor_total
      await pool.query('UPDATE pedidos SET valor_total = $1 WHERE id = $2', [finalTotal, pedidoId]);
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
        cliente_id, pagamento_id, caixa_id, usuario_id, canal, codigo, situacao,
        desconto, acrescimos)
       SELECT id, atendimento_id, valor_total, criado_em, NOW(), status,
              cliente_id, pagamento_id, caixa_id, usuario_id, canal, codigo, 'encerrado',
              COALESCE(desconto, 0), COALESCE(acrescimos, 0)
       FROM pedidos WHERE id = $1
       RETURNING id`,
      [pedidoId]
    );
    
    const pedidoHistoricoId = pedidoHistorico.rows[0].id;

    // Função para gerar assinatura única dos complementos considerando categorias (mesma do upsertPedido)
    const buildComplementSignature = async (complements, produtoId) => {
      const list = Array.isArray(complements) ? complements : [];
      if (list.length === 0) return 'none';
      
      // Buscar categorias dos complementos para este produto
      const categoriasResult = await client.query(`
        SELECT cc.id as categoria_id, cc.nome as categoria_nome, ic.complemento_id
        FROM categorias_complementos cc
        JOIN itens_complementos ic ON ic.categoria_id = cc.id
        WHERE cc.produto_id = $1 AND cc.status = true
      `, [produtoId]);
      
      const categoriasMap = new Map();
      categoriasResult.rows.forEach(row => {
        categoriasMap.set(row.complemento_id, {
          categoria_id: row.categoria_id,
          categoria_nome: row.categoria_nome
        });
      });
      
      const normalized = list
        .map((c) => {
          const complementoId = Number(c.complemento_id ?? c.id);
          const categoria = categoriasMap.get(complementoId);
          return {
            id: complementoId,
            qty: Number(c.quantidade ?? c.qty) > 0 ? Number(c.quantidade ?? c.qty) : 1,
            categoria_id: categoria?.categoria_id || 0,
            categoria_nome: categoria?.categoria_nome || 'sem_categoria'
          };
        })
        .filter((c) => c.id)
        .sort((a, b) => {
          // Ordenar primeiro por categoria, depois por ID
          if (a.categoria_id !== b.categoria_id) {
            return a.categoria_id - b.categoria_id;
          }
          return a.id - b.id;
        })
        .map((c) => `${c.categoria_id}:${c.id}x${c.qty}`);
      return normalized.length ? normalized.join(',') : 'none';
    };

    // 2. Buscar itens do pedido com complementos para agrupar corretamente
    const itensComComplementos = await client.query(
      `SELECT ip.id, ip.produto_id, ip.quantidade, ip.valor_unitario, ip.valor_total, p.nome AS produto_nome
       FROM itens_pedido ip
       LEFT JOIN produtos p ON p.id = ip.produto_id
       WHERE ip.pedido_id = $1
       ORDER BY ip.id ASC`,
      [pedidoId]
    );

    // Buscar complementos dos itens
    const itemIds = itensComComplementos.rows.map((r) => r.id);
    let complementosByItemId = new Map();
    if (itemIds.length > 0) {
      const comps = await client.query(
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

    // Agrupar itens por produto + assinatura de complementos (mesma lógica do upsertPedido)
    const itensAgrupados = new Map();
    
    for (const it of itensComComplementos.rows) {
      const produtoId = it.produto_id;
      const quantidade = Number(it.quantidade) || 0;
      const valorUnitario = Number(it.valor_unitario) || 0;
      const complementos = complementosByItemId.get(it.id) || [];
      const signature = await buildComplementSignature(complementos, produtoId);
      const key = `${produtoId}|${signature}`;
      
      if (itensAgrupados.has(key)) {
        // Se o produto + complementos já existe, somar a quantidade
        const itemExistente = itensAgrupados.get(key);
        itemExistente.quantidade += quantidade;
      } else {
        // Se é um produto + complementos novo, criar entrada
        itensAgrupados.set(key, {
          produto_id: produtoId,
          quantidade: quantidade,
          valor_unitario: valorUnitario,
          complementos: complementos
        });
      }
    }

    // 3. Inserir itens agrupados no histórico (mantendo grupos separados)
    const itensHistorico = [];
    for (const [key, item] of itensAgrupados) {
      const ins = await client.query(
        `INSERT INTO itens_pedido_historico 
         (pedido_historico_id, produto_id, quantidade, valor_unitario, valor_total, status)
         VALUES ($1, $2, $3, $4, $5, 'finalizado')
         RETURNING id`,
        [pedidoHistoricoId, item.produto_id, item.quantidade, item.valor_unitario, item.quantidade * item.valor_unitario]
      );
      const itemHistoricoId = ins.rows[0].id;
      itensHistorico.push({ id: itemHistoricoId, key, item });

      // Inserir complementos deste item específico
      for (const comp of item.complementos) {
        await client.query(
          `INSERT INTO complementos_itens_pedido_historico
           (item_pedido_historico_id, complemento_id, nome_complemento, quantidade, 
            valor_unitario, valor_total, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'finalizado')`,
          [itemHistoricoId, comp.complemento_id, comp.nome_complemento, comp.quantidade, 
           comp.valor_unitario, comp.quantidade * comp.valor_unitario]
        );
      }
    }

    // 4. Copiar pagamentos do pedido para o histórico
    await client.query(
      `INSERT INTO pedidos_pagamentos_historico 
       (pedido_id, pagamento_id, valor_pago, criado_em, finalizado_em, caixa_id)
       SELECT pedido_id, pagamento_id, valor_pago, criado_em, NOW(), caixa_id
       FROM pedidos_pagamentos 
       WHERE pedido_id = $1`,
      [pedidoId]
    );

    // 5. Limpar dados das tabelas ativas
    await client.query(
      `DELETE FROM complementos_itens_pedido 
       WHERE item_pedido_id IN (SELECT id FROM itens_pedido WHERE pedido_id = $1)`,
      [pedidoId]
    );
    await client.query(`DELETE FROM itens_pedido WHERE pedido_id = $1`, [pedidoId]);
    await client.query(`DELETE FROM pedidos_pagamentos WHERE pedido_id = $1`, [pedidoId]);
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

// ===== ATUALIZAR CLIENTE DO PEDIDO =====
export const atualizarClientePedido = async (req, res) => {
  const client = await pool.connect();
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();
    const { cliente_id } = req.body;

    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    if (!cliente_id || Number.isNaN(parseInt(cliente_id, 10))) {
      return res.status(400).json({ success: false, message: 'cliente_id inválido' });
    }

    await client.query('BEGIN');

    // Encontrar atendimento
    const atendimento = await client.query(
      'SELECT id FROM atendimentos WHERE estabelecimento_id = $1 AND identificador = $2 LIMIT 1',
      [estabelecimentoId, identificador]
    );
    
    if (atendimento.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Atendimento não encontrado' });
    }
    
    const atendimentoId = atendimento.rows[0].id;

    // Buscar pedido mais recente deste atendimento
    const pedido = await client.query(
      'SELECT id FROM pedidos WHERE atendimento_id = $1 ORDER BY criado_em DESC LIMIT 1',
      [atendimentoId]
    );
    
    if (pedido.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
    }
    
    const pedidoId = pedido.rows[0].id;

    // Verificar se o cliente existe e pertence ao estabelecimento
    const cliente = await client.query(
      'SELECT id, nome FROM clientes WHERE id = $1 AND estabelecimento_id = $2 AND status = true',
      [cliente_id, estabelecimentoId]
    );
    
    if (cliente.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Cliente não encontrado ou inativo' });
    }

    // Atualizar cliente_id do pedido
    await client.query(
      'UPDATE pedidos SET cliente_id = $1 WHERE id = $2',
      [cliente_id, pedidoId]
    );

    await client.query('COMMIT');
    
    console.log(`✅ Cliente ${cliente.rows[0].nome} (ID: ${cliente_id}) associado ao pedido ${pedidoId}`);
    
    return res.json({ 
      success: true, 
      message: 'Cliente atualizado com sucesso',
      data: {
        pedido_id: pedidoId,
        cliente_id: cliente_id,
        cliente_nome: cliente.rows[0].nome
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao atualizar cliente do pedido:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// ===== ATUALIZAR DESCONTO DO PEDIDO =====
export const atualizarDescontoPedido = async (req, res) => {
  const client = await pool.connect();
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();
    const { desconto } = req.body;

    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    if (desconto === undefined || desconto === null || Number.isNaN(parseFloat(desconto)) || parseFloat(desconto) < 0) {
      return res.status(400).json({ success: false, message: 'Valor de desconto inválido' });
    }

    await client.query('BEGIN');

    // Encontrar atendimento
    const atendimento = await client.query(
      'SELECT id FROM atendimentos WHERE estabelecimento_id = $1 AND identificador = $2 LIMIT 1',
      [estabelecimentoId, identificador]
    );
    
    if (atendimento.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Atendimento não encontrado' });
    }
    
    const atendimentoId = atendimento.rows[0].id;

    // Buscar pedido mais recente deste atendimento
    const pedido = await client.query(
      'SELECT id FROM pedidos WHERE atendimento_id = $1 ORDER BY criado_em DESC LIMIT 1',
      [atendimentoId]
    );
    
    if (pedido.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
    }
    
    const pedidoId = pedido.rows[0].id;

    // Atualizar desconto do pedido
    await client.query(
      'UPDATE pedidos SET desconto = $1 WHERE id = $2',
      [parseFloat(desconto), pedidoId]
    );

    // Calculate and update valor_total manually
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
    const itemsTotal = Number(sum.rows[0].total) || 0;
    
    // Get current desconto and acrescimos
    const pedidoData = await client.query(
      'SELECT COALESCE(desconto, 0) as desconto, COALESCE(acrescimos, 0) as acrescimos FROM pedidos WHERE id = $1',
      [pedidoId]
    );
    const descontoAtual = Number(pedidoData.rows[0].desconto) || 0;
    const acrescimosAtual = Number(pedidoData.rows[0].acrescimos) || 0;
    
    // Calculate final total: items + complements + surcharges - discounts
    const finalTotal = itemsTotal + acrescimosAtual - descontoAtual;
    
    // valor_total é calculado automaticamente pelo banco (coluna gerada)
    // Não precisamos atualizá-lo manualmente

    await client.query('COMMIT');
    
    console.log(`✅ Desconto R$ ${desconto} aplicado ao pedido ${pedidoId}`);
    
    return res.json({ 
      success: true, 
      message: 'Desconto aplicado com sucesso',
      data: {
        pedido_id: pedidoId,
        desconto: parseFloat(desconto)
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao aplicar desconto:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// ===== ATUALIZAR ACRÉSCIMO DO PEDIDO =====
export const atualizarAcrescimoPedido = async (req, res) => {
  const client = await pool.connect();
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();
    const { acrescimos } = req.body;

    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    if (acrescimos === undefined || acrescimos === null || Number.isNaN(parseFloat(acrescimos)) || parseFloat(acrescimos) < 0) {
      return res.status(400).json({ success: false, message: 'Valor de acréscimo inválido' });
    }

    await client.query('BEGIN');

    // Encontrar atendimento
    const atendimento = await client.query(
      'SELECT id FROM atendimentos WHERE estabelecimento_id = $1 AND identificador = $2 LIMIT 1',
      [estabelecimentoId, identificador]
    );
    
    if (atendimento.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Atendimento não encontrado' });
    }
    
    const atendimentoId = atendimento.rows[0].id;

    // Buscar pedido mais recente deste atendimento
    const pedido = await client.query(
      'SELECT id FROM pedidos WHERE atendimento_id = $1 ORDER BY criado_em DESC LIMIT 1',
      [atendimentoId]
    );
    
    if (pedido.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
    }
    
    const pedidoId = pedido.rows[0].id;

    // Atualizar acréscimo do pedido
    await client.query(
      'UPDATE pedidos SET acrescimos = $1 WHERE id = $2',
      [parseFloat(acrescimos), pedidoId]
    );

    // Calculate and update valor_total manually
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
    const itemsTotal = Number(sum.rows[0].total) || 0;
    
    // Get current desconto and acrescimos
    const pedidoData = await client.query(
      'SELECT COALESCE(desconto, 0) as desconto, COALESCE(acrescimos, 0) as acrescimos FROM pedidos WHERE id = $1',
      [pedidoId]
    );
    const descontoAtual = Number(pedidoData.rows[0].desconto) || 0;
    const acrescimosAtual = Number(pedidoData.rows[0].acrescimos) || 0;
    
    // Calculate final total: items + complements + surcharges - discounts
    const finalTotal = itemsTotal + acrescimosAtual - descontoAtual;
    
    // valor_total é calculado automaticamente pelo banco (coluna gerada)
    // Não precisamos atualizá-lo manualmente

    await client.query('COMMIT');
    
    console.log(`✅ Acréscimo R$ ${acrescimos} aplicado ao pedido ${pedidoId}`);
    
    return res.json({ 
      success: true, 
      message: 'Acréscimo aplicado com sucesso',
      data: {
        pedido_id: pedidoId,
        acrescimos: parseFloat(acrescimos)
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao aplicar acréscimo:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
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
         CASE 
           WHEN ph.cliente_id IS NOT NULL THEN c.nome
           ELSE 'Não informado'
         END AS cliente_nome,
         CASE 
           WHEN COUNT(DISTINCT pph.pagamento_id) > 1 THEN 'Composto'
           WHEN COUNT(DISTINCT pph.pagamento_id) = 1 THEN COALESCE(MAX(p.nome), 'Não informado')
           ELSE 'Não informado'
         END AS forma_pagamento,
         COALESCE(ph.canal, 'PDV') AS canal,
         u.nome_completo AS vendido_por,
         ph.situacao
       FROM pedidos_historico ph
       LEFT JOIN usuarios u ON u.id = ph.usuario_id
       LEFT JOIN clientes c ON c.id = ph.cliente_id
       LEFT JOIN pedidos_pagamentos_historico pph ON pph.pedido_id = ph.pedido_id
       LEFT JOIN pagamentos p ON p.id = pph.pagamento_id
      WHERE ph.caixa_id = $1
      GROUP BY ph.id, ph.pedido_id, ph.codigo, ph.valor_total, ph.criado_em, ph.finalizado_em, 
               ph.cliente_id, c.nome, ph.canal, u.nome_completo, ph.situacao
      ORDER BY ph.finalizado_em DESC
      LIMIT 200`,
      [caixaId]
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
         ph.cliente_id,
         ph.desconto,
         ph.acrescimos,
         CASE 
           WHEN ph.cliente_id IS NOT NULL THEN c.nome
           ELSE 'Não informado'
         END AS cliente_nome,
         c.cpf,
         c.cnpj,
         c.endereco,
         c.whatsapp,
         c.email,
         u.nome_completo AS vendido_por
       FROM pedidos_historico ph
       JOIN atendimentos a ON a.id = ph.atendimento_id
       LEFT JOIN usuarios u ON u.id = ph.usuario_id
       LEFT JOIN clientes c ON c.id = ph.cliente_id
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

    // Buscar todos os pagamentos do pedido no histórico
    const pagamentos = await pool.query(
      `SELECT 
         pph.pagamento_id,
         pph.valor_pago,
         pph.criado_em,
         pph.finalizado_em,
         p.nome AS pagamento_nome,
         p.tipo AS pagamento_tipo
       FROM pedidos_pagamentos_historico pph
       LEFT JOIN pagamentos p ON p.id = pph.pagamento_id
      WHERE pph.pedido_id = $1
      ORDER BY pph.criado_em`,
      [pedidoId]
    );

    // Preparar dados do cliente
    const cliente = pedidoData.cliente_id ? {
      id: pedidoData.cliente_id,
      nome: pedidoData.cliente_nome,
      cpf: pedidoData.cpf,
      cnpj: pedidoData.cnpj,
      endereco: pedidoData.endereco,
      whatsapp: pedidoData.whatsapp,
      email: pedidoData.email
    } : null;

    return res.json({
      success: true,
      data: {
        pedido: pedidoData,
        cliente: cliente,
        itens: itensComComplementos,
        pagamentos: pagamentos.rows
      }
    });
  } catch (err) {
    console.error('❌ Erro ao buscar detalhes do pedido:', err);
    return res.status(500).json({ success: false, message: 'Erro ao buscar detalhes do pedido' });
  }
};

// ===== CRIAR/OBTER PAGAMENTO COMPOSTO =====
export const criarOuObterPagamentoComposto = async (req, res) => {
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const { pagamentoIds } = req.body;

    if (Number.isNaN(estabelecimentoId) || !Array.isArray(pagamentoIds) || pagamentoIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    // Se apenas um pagamento, retornar o ID diretamente
    if (pagamentoIds.length === 1) {
      return res.json({ 
        success: true, 
        data: { pagamento_id: pagamentoIds[0] }
      });
    }

    // Para múltiplos pagamentos, criar/obter pagamento composto
    const pagamentoIdsStr = pagamentoIds.sort().join(',');
    
    // Verificar se já existe um pagamento composto com esses IDs
    const existingComposto = await pool.query(
      `SELECT id FROM pagamentos 
       WHERE estabelecimento_id = $1 
       AND nome = 'Pagamento Composto' 
       AND conta_bancaria = $2 
       AND status = true`,
      [estabelecimentoId, pagamentoIdsStr]
    );

    if (existingComposto.rows.length > 0) {
      return res.json({ 
        success: true, 
        data: { pagamento_id: existingComposto.rows[0].id }
      });
    }

    // Criar novo pagamento composto
    const novoComposto = await pool.query(
      `INSERT INTO pagamentos (estabelecimento_id, nome, tipo, taxa, conta_bancaria, status)
       VALUES ($1, 'Pagamento Composto', 'Composto', 0, $2, true)
       RETURNING id`,
      [estabelecimentoId, pagamentoIdsStr]
    );

    console.log('✅ Pagamento composto criado:', {
      id: novoComposto.rows[0].id,
      pagamentoIds: pagamentoIdsStr
    });

    return res.json({ 
      success: true, 
      data: { pagamento_id: novoComposto.rows[0].id }
    });

  } catch (error) {
    console.error('❌ Erro ao criar/obter pagamento composto:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// ===== CRIAR PAGAMENTO COMPOSTO PADRÃO =====
export const criarPagamentoCompostoPadrao = async (req, res) => {
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);

    if (Number.isNaN(estabelecimentoId)) {
      return res.status(400).json({ success: false, message: 'Estabelecimento inválido' });
    }

    // Verificar se já existe pagamento composto para este estabelecimento
    const existingComposto = await pool.query(
      `SELECT id FROM pagamentos 
       WHERE estabelecimento_id = $1 
       AND nome = 'Pagamento Composto' 
       AND tipo = 'Composto'`,
      [estabelecimentoId]
    );

    if (existingComposto.rows.length > 0) {
      return res.json({ 
        success: true, 
        data: { 
          message: 'Pagamento composto já existe',
          pagamento_id: existingComposto.rows[0].id
        }
      });
    }

    // Criar pagamento composto padrão
    const novoComposto = await pool.query(
      `INSERT INTO pagamentos (estabelecimento_id, nome, tipo, taxa, conta_bancaria, status)
       VALUES ($1, 'Pagamento Composto', 'Composto', 0, '', true)
       RETURNING id`,
      [estabelecimentoId]
    );

    console.log('✅ Pagamento composto padrão criado:', {
      id: novoComposto.rows[0].id,
      estabelecimentoId
    });

    return res.json({ 
      success: true, 
      data: { 
        message: 'Pagamento composto criado com sucesso',
        pagamento_id: novoComposto.rows[0].id
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar pagamento composto padrão:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// ===== ATUALIZAR VALORES DE PAGAMENTO E TROCO =====
export const atualizarValoresPagamento = async (req, res) => {
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();
    const { valor_pago, valor_troco, valor_restante, pagamento_id, pagamentos_detalhes } = req.body;

    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    // Encontrar atendimento
    const att = await pool.query(
      'SELECT id FROM atendimentos WHERE estabelecimento_id = $1 AND identificador = $2 LIMIT 1',
      [estabelecimentoId, identificador]
    );
    
    if (att.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Atendimento não encontrado' });
    }
    const atendimentoId = att.rows[0].id;

    // Buscar pedido mais recente com caixa_id
    const ped = await pool.query(
      'SELECT id, valor_total, caixa_id FROM pedidos WHERE atendimento_id = $1 ORDER BY criado_em DESC LIMIT 1',
      [atendimentoId]
    );
    
    if (ped.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
    }

    const pedidoId = ped.rows[0].id;
    const valorTotal = Number(ped.rows[0].valor_total) || 0;
    const caixaId = ped.rows[0].caixa_id;
    const valorPago = Number(valor_pago) || 0;
    const valorTroco = Number(valor_troco) || 0;
    const valorRestante = Number(valor_restante) !== undefined ? Number(valor_restante) : Math.max(0, valorTotal - valorPago);

    // Atualizar valores do pedido
    await pool.query(
      `UPDATE pedidos 
       SET valor_pago = $1, 
           valor_troco = $2, 
           valor_restante = $3,
           pagamento_id = $4
       WHERE id = $5`,
      [valorPago, valorTroco, valorRestante, pagamento_id || 0, pedidoId]
    );

    // Salvar detalhes dos pagamentos na tabela pedidos_pagamentos
    if (Array.isArray(pagamentos_detalhes) && pagamentos_detalhes.length > 0) {
      // Primeiro, remover todos os pagamentos existentes para evitar duplicação
      await pool.query(
        'DELETE FROM pedidos_pagamentos WHERE pedido_id = $1',
        [pedidoId]
      );
      
      // Inserir os novos detalhes de pagamento com caixa_id
      for (const pagamento of pagamentos_detalhes) {
        if (pagamento.pagamento_id && pagamento.valor_pago > 0) {
          await pool.query(
            `INSERT INTO pedidos_pagamentos (pedido_id, pagamento_id, valor_pago, caixa_id)
             VALUES ($1, $2, $3, $4)`,
            [pedidoId, pagamento.pagamento_id, pagamento.valor_pago, caixaId]
          );
        }
      }
      
      console.log('✅ Detalhes dos pagamentos atualizados com caixa_id:', pagamentos_detalhes, 'caixa_id:', caixaId);
    }

    console.log('✅ Valores de pagamento atualizados:', {
      pedidoId,
      valorTotal,
      valorPago,
      valorTroco,
      valorRestante
    });

    return res.json({ 
      success: true, 
      message: 'Valores de pagamento atualizados com sucesso',
      data: {
        valor_pago: valorPago,
        valor_troco: valorTroco,
        valor_restante: valorRestante
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar valores de pagamento:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// ===== BUSCAR PAGAMENTOS EXISTENTES DE UM PEDIDO =====
export const buscarPagamentosPedido = async (req, res) => {
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();

    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    // Primeiro, buscar o pedido para obter o pedido_id
    const pedidoQuery = `
      SELECT p.id as pedido_id, p.valor_pago, p.valor_restante, p.valor_troco
      FROM pedidos p
      JOIN atendimentos a ON p.atendimento_id = a.id
      WHERE a.estabelecimento_id = $1 AND a.identificador = $2
    `;
    const pedidoResult = await pool.query(pedidoQuery, [estabelecimentoId, identificador]);
    
    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }
    
    const pedido = pedidoResult.rows[0];
    
    // Buscar os pagamentos existentes do pedido
    const pagamentosQuery = `
      SELECT 
        pp.pagamento_id,
        pp.valor_pago,
        p.nome as pagamento_nome,
        p.tipo as pagamento_tipo
      FROM pedidos_pagamentos pp
      JOIN pagamentos p ON pp.pagamento_id = p.id
      WHERE pp.pedido_id = $1
      ORDER BY pp.criado_em ASC
    `;
    const pagamentosResult = await pool.query(pagamentosQuery, [pedido.pedido_id]);
    
    res.json({
      success: true,
      pedido: {
        id: pedido.pedido_id,
        valor_pago: pedido.valor_pago,
        valor_restante: pedido.valor_restante,
        valor_troco: pedido.valor_troco
      },
      pagamentos: pagamentosResult.rows
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar pagamentos do pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// ===== LISTAR ITENS DO PEDIDO COM COMPLEMENTOS =====
export const listarItensPedido = async (req, res) => {
  try {
    const estabelecimentoId = parseInt(req.params.estabelecimento_id, 10);
    const identificador = String(req.params.identificador || '').trim().toLowerCase();

    if (Number.isNaN(estabelecimentoId) || !identificador) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    // Buscar o pedido
    const pedidoQuery = `
      SELECT p.id as pedido_id, p.valor_total, p.criado_em, p.status, 
             p.desconto, p.acrescimos, p.valor_pago, p.valor_restante, p.valor_troco
      FROM pedidos p
      JOIN atendimentos a ON p.atendimento_id = a.id
      WHERE a.estabelecimento_id = $1 AND a.identificador = $2
      ORDER BY p.criado_em DESC LIMIT 1
    `;
    const pedidoResult = await pool.query(pedidoQuery, [estabelecimentoId, identificador]);
    
    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }
    
    const pedido = pedidoResult.rows[0];
    
    // Buscar itens do pedido
    const itensQuery = `
      SELECT 
        ip.id,
        ip.produto_id,
        ip.quantidade,
        ip.valor_unitario,
        ip.valor_total,
        ip.status,
        p.nome AS produto_nome,
        p.descricao AS produto_descricao
      FROM itens_pedido ip
      LEFT JOIN produtos p ON p.id = ip.produto_id
      WHERE ip.pedido_id = $1
      ORDER BY ip.id ASC
    `;
    const itensResult = await pool.query(itensQuery, [pedido.pedido_id]);
    
    // Buscar complementos dos itens
    const itemIds = itensResult.rows.map(item => item.id);
    let complementos = [];
    if (itemIds.length > 0) {
      const complementosQuery = `
        SELECT 
          cip.id,
          cip.item_pedido_id,
          cip.complemento_id,
          cip.nome_complemento,
          cip.quantidade,
          cip.valor_unitario,
          cip.valor_total,
          cip.status
        FROM complementos_itens_pedido cip
        WHERE cip.item_pedido_id = ANY($1)
        ORDER BY cip.item_pedido_id, cip.id
      `;
      const complementosResult = await pool.query(complementosQuery, [itemIds]);
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
    const itensComComplementos = itensResult.rows.map(item => ({
      ...item,
      complementos: complementosPorItem[item.id] || []
    }));
    
    console.log(`✅ Itens do pedido ${pedido.pedido_id} listados:`, {
      totalItens: itensComComplementos.length,
      totalComplementos: complementos.length
    });
    
    res.json({
      success: true,
      data: {
        pedido: {
          id: pedido.pedido_id,
          valor_total: pedido.valor_total,
          criado_em: pedido.criado_em,
          status: pedido.status,
          desconto: pedido.desconto,
          acrescimos: pedido.acrescimos,
          valor_pago: pedido.valor_pago,
          valor_restante: pedido.valor_restante,
          valor_troco: pedido.valor_troco
        },
        itens: itensComComplementos
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar itens do pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Função para listar pagamentos históricos por caixa
export const listarPagamentosHistorico = async (req, res) => {
  try {
    const { caixa_id } = req.params;
    const { estabelecimento_id } = req.query;

    if (!caixa_id || !estabelecimento_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Caixa ID e Estabelecimento ID são obrigatórios' 
      });
    }

    console.log('🔍 Buscando pagamentos históricos para caixa:', caixa_id, 'estabelecimento:', estabelecimento_id);

    // Buscar pagamentos históricos agrupados por pagamento_id
    const pagamentosQuery = `
      SELECT 
        pph.pagamento_id,
        p.nome as forma_pagamento,
        SUM(pph.valor_pago) as valor_total,
        COUNT(pph.id) as quantidade_pedidos
      FROM pedidos_pagamentos_historico pph
      INNER JOIN pedidos_historico ph ON ph.id = pph.pedido_id
      INNER JOIN caixas c ON c.id = ph.caixa_id
      INNER JOIN pagamentos p ON p.id = pph.pagamento_id
      WHERE c.estabelecimento_id = $1 
        AND ph.caixa_id = $2
        AND ph.status IN ('finalizado', 'pendente')
        AND pph.valor_pago > 0
      GROUP BY pph.pagamento_id, p.nome
      ORDER BY valor_total DESC
    `;

    console.log('🔍 Query executada:', pagamentosQuery);
    console.log('🔍 Parâmetros:', [estabelecimento_id, caixa_id]);

    const pagamentosResult = await pool.query(pagamentosQuery, [estabelecimento_id, caixa_id]);
    const pagamentos = pagamentosResult.rows;

    console.log('📊 Pagamentos encontrados:', pagamentos.length);
    console.log('📊 Dados dos pagamentos:', JSON.stringify(pagamentos, null, 2));

    // Calcular total geral
    const totalGeral = pagamentos.reduce((total, pagamento) => {
      return total + parseFloat(pagamento.valor_total || 0);
    }, 0);

    // Adicionar percentuais
    const pagamentosComPercentual = pagamentos.map(pagamento => ({
      ...pagamento,
      valor_total: parseFloat(pagamento.valor_total || 0),
      quantidade_pedidos: parseInt(pagamento.quantidade_pedidos || 0),
      percentual: totalGeral > 0 ? (parseFloat(pagamento.valor_total || 0) / totalGeral) * 100 : 0
    }));

    console.log('💰 Pagamentos agrupados:', pagamentosComPercentual.length, 'Total geral:', totalGeral);
    console.log('💰 Estrutura final dos dados:', JSON.stringify(pagamentosComPercentual, null, 2));

    return res.json({
      success: true,
      data: {
        pagamentos: pagamentosComPercentual,
        total_geral: totalGeral,
        total_formas_pagamento: pagamentosComPercentual.length
      }
    });

  } catch (error) {
    console.error('Erro ao listar pagamentos históricos:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};



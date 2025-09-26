import React from 'react';

const formatCurrency = (value) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const formatDate = (date) => {
  if (!date) return '-';
  try {
    return new Intl.DateTimeFormat('pt-BR', { 
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(date));
  } catch {
    return date;
  }
};

const formatDateOnly = (date) => {
  if (!date) return '-';
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(date));
  } catch {
    return date;
  }
};

const formatIdentificacao = (raw) => {
  const str = String(raw || '').toLowerCase();
  if (str.startsWith('balcao-')) {
    const n = String(parseInt(str.replace('balcao-', ''), 10) || '').padStart(2, '0');
    return `Balcão ${n}`;
  }
  if (str.startsWith('mesa-')) {
    const n = String(parseInt(str.replace('mesa-', ''), 10) || '').padStart(2, '0');
    return `Mesa ${n}`;
  }
  if (str.startsWith('comanda-')) {
    const n = String(parseInt(str.replace('comanda-', ''), 10) || '').padStart(2, '0');
    return `Comanda ${n}`;
  }
  // Fallback: capitalizar primeira letra apenas
  const [word, num] = String(raw || '').split(/\s*(\d+)\s*/).filter(Boolean);
  const wordFmt = word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '';
  return `${wordFmt}${num ? ` ${String(num).padStart(2, '0')}` : ''}`.trim();
};

const NotaCozinha = ({ pedido, itens, identificacao, nomePonto, vendedor, usuarioId, estabelecimento = null }) => {
  if (!pedido || !itens || itens.length === 0) return null;

  return (
    <div className="nota-cozinha-print">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        
        @media print {
          @page {
            size: 80mm 200mm;
            margin: 0;
            padding: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Courier Prime', monospace;
            font-size: 12px;
            line-height: 1.2;
            color: #000;
            background: white;
          }
          
          .nota-cozinha-print {
            width: 300px;
            margin: 0 auto;
            background: white;
            padding: 10px;
            border: 1px solid #000;
            font-family: 'Courier Prime', monospace;
            font-size: 12px;
            line-height: 1.2;
          }
          
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .line { border-bottom: 1px dashed #000; margin: 5px 0; }
          .small { font-size: 10px; }
          .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
          .addon { margin-left: 15px; font-size: 10px; }
        }
      `}</style>
      
      {/* Cabeçalho da Empresa */}
      <div className="center bold">
        <div style={{fontSize: '14px'}}>{estabelecimento?.nome || 'FILA ZERO'}</div>
        <div className="small">COZINHA</div>
        {estabelecimento?.rua && estabelecimento?.numero && estabelecimento?.bairro && (
          <div className="small">{estabelecimento.rua}, {estabelecimento.numero} - {estabelecimento.bairro}</div>
        )}
        {estabelecimento?.cidade && estabelecimento?.estado && (
          <div className="small">
            {estabelecimento.cidade} - {estabelecimento.estado}
            {estabelecimento?.cep && ` - CEP: ${estabelecimento.cep}`}
          </div>
        )}
        {estabelecimento?.cnpj && (
          <div className="small">CNPJ: {estabelecimento.cnpj}</div>
        )}
      </div>

      <div className="line"></div>

      {/* Código do Pedido - Centralizado, cinza, fonte grande */}
      <div className="center" style={{fontSize: '24px', fontWeight: '900', color: '#9CA3AF', margin: '10px 0'}}>
        {pedido.codigo || pedido.id}
      </div>

      <div className="line"></div>

      {/* Informações do Pedido */}
      <div className="small">
        <div><strong>Atendimento:</strong> {formatIdentificacao(identificacao)}</div>
        <div><strong>Pedido:</strong> {nomePonto || 'Sem nome'}</div>
        <div><strong>Vendedor:</strong> {vendedor || 'Sistema'}</div>
        <div><strong>Data:</strong> {formatDateOnly(pedido.criado_em)}</div>
      </div>

      <div className="line"></div>

      {/* Cabeçalho dos Itens */}
      <div className="bold small">
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <span>QTD | ITEM</span>
          <span>VALOR</span>
        </div>
      </div>

      <div style={{borderBottom: '1px solid #000', margin: '2px 0'}}></div>

      {/* Itens do Pedido */}
      <div className="small">
        {itens && itens.length > 0 ? (
          itens.map((item) => (
            <div key={item.id}>
              <div className="item-row">
                <span>{item.qty || item.quantidade}x {item.name || item.produto_nome}</span>
                <span>{formatCurrency(item.unitPrice || item.valor_unitario)}</span>
              </div>
              {item.complements && item.complements.length > 0 && (
                item.complements.map((complemento) => (
                  <div key={complemento.id} className="addon" style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span>+ {complemento.qty || complemento.quantidade}x {complemento.name || complemento.nome_complemento}</span>
                    <span>{formatCurrency(complemento.unitPrice || complemento.valor_unitario)}</span>
                  </div>
                ))
              )}
            </div>
          ))
        ) : (
          <div>Nenhum item encontrado</div>
        )}
      </div>

      <div className="line"></div>

      {/* Valor Total */}
      <div className="center bold" style={{fontSize: '14px', margin: '10px 0'}}>
        <div>TOTAL: {formatCurrency(itens.reduce((total, item) => {
          // Valor do item principal
          const itemValue = (Number(item.qty || item.quantidade) || 0) * (Number(item.unitPrice || item.valor_unitario) || 0);
          
          // Valor dos complementos
          const complementsValue = (item.complements || []).reduce((compTotal, comp) => {
            return compTotal + (Number(comp.qty || comp.quantidade) || 0) * (Number(comp.unitPrice || comp.valor_unitario) || 0);
          }, 0);
          
          return total + itemValue + complementsValue;
        }, 0))}</div>
      </div>

      <div className="line"></div>

      {/* Rodapé */}
      <div className="center small">
        <div className="bold">PEDIDO PARA COZINHA</div>
        <div className="bold">Prepare com carinho!</div>
      </div>

      <div style={{margin: '10px 0'}}></div>

      <div className="center small">
        <div>Data de impressão: {formatDate(new Date())}</div>
        <div>Nota de cozinha gerada automaticamente</div>
      </div>
    </div>
  );
};

export default NotaCozinha;

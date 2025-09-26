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

const NotaPedido = ({ pedido, itens, cliente, pagamentos, estabelecimento = null }) => {
  if (!pedido) return null;

  return (
    <div className="nota-pedido-print">
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
          
          .nota-pedido-print {
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

      {/* Número do Pedido */}
      <div className="center" style={{fontSize: '24px', fontWeight: '900', color: '#9CA3AF'}}>
        {pedido.codigo || pedido.id}
      </div>

      <div className="line"></div>

      {/* Informações do Pedido */}
      <div className="small">
        <div><strong>Data:</strong> {formatDateOnly(pedido.criado_em)}</div>
        <div><strong>Cliente:</strong> {cliente?.nome || pedido.cliente_nome || 'Não informado'}</div>
        <div><strong>Vendedor:</strong> {pedido.vendido_por || 'Sistema'}</div>
      </div>

      <div className="line"></div>

      {/* Cabeçalho dos Itens */}
      <div className="bold small">
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <span>QTD | DESCRIÇÃO</span>
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
                <span>{item.quantidade}x {item.produto_nome}</span>
                <span>{formatCurrency(item.valor_total || (item.quantidade * item.valor_unitario) || 0)}</span>
              </div>
              {item.complementos && item.complementos.length > 0 && (
                item.complementos.map((complemento) => (
                  <div key={complemento.id} className="addon" style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span>+ {complemento.quantidade}x {complemento.nome_complemento}</span>
                    <span>{formatCurrency(complemento.valor_total || (complemento.quantidade * complemento.valor_unitario) || 0)}</span>
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

      {/* Resumo Financeiro */}
      <div className="small">
        <div className="item-row">
          <span>Subtotal:</span>
          <span>{formatCurrency(pedido.valor_total)}</span>
        </div>
        <div className="item-row">
          <span>Desconto:</span>
          <span>- {formatCurrency(pedido.desconto || 0)}</span>
        </div>
        <div className="item-row">
          <span>Acréscimos:</span>
          <span>{formatCurrency(pedido.acrescimos || 0)}</span>
        </div>
      </div>

      <div style={{borderBottom: '2px solid #000', margin: '5px 0'}}></div>

      {/* Total */}
      <div className="bold">
        <div className="item-row" style={{fontSize: '14px'}}>
          <span>TOTAL:</span>
          <span>{formatCurrency(Number(pedido.valor_total) + Number(pedido.acrescimos || 0) - Number(pedido.desconto || 0))}</span>
        </div>
      </div>

      <div className="line"></div>

      {/* Forma de Pagamento */}
      <div className="center bold small">
        FORMA DE PAGAMENTO
      </div>
      <div className="center small">
        {pagamentos && pagamentos.length > 0 ? (
          pagamentos.map((pagamento, index) => (
            <div key={index}>
              {pagamento.pagamento_nome || 'Pagamento não informado'}: {formatCurrency(Math.min(pagamento.valor_pago, pedido.valor_total + Number(pedido.acrescimos || 0) - Number(pedido.desconto || 0)))}
            </div>
          ))
        ) : (
          'Não informado'
        )}
      </div>
      
      <div style={{margin: '5px 0'}}></div>
      
      <div className="center bold small">VALOR PAGO</div>
      <div className="center bold">
        {formatCurrency(pagamentos ? pagamentos.reduce((total, p) => total + Math.min(Number(p.valor_pago || 0), pedido.valor_total + Number(pedido.acrescimos || 0) - Number(pedido.desconto || 0)), 0) : pedido.valor_total)}
      </div>

      <div className="line"></div>

      {/* Rodapé */}
      <div className="center small">
        <div className="bold">Obrigado pela preferência!</div>
        <div className="bold">Volte sempre!</div>
      </div>

      <div style={{margin: '10px 0'}}></div>

      <div className="center small">
        <div>Data de impressão: {formatDate(new Date())}</div>
        <div>Nota fiscal gerada automaticamente pelo sistema</div>
      </div>
    </div>
  );
};

export default NotaPedido;









import React from 'react';

const NotaFiscal = ({ pedido, itens }) => {
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

  if (!pedido) return null;

  return (
    <div className="nota-fiscal-print">
      <style jsx>{`
        @media print {
          @page {
            size: 80mm 200mm;
            margin: 0;
            padding: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            color: #000;
            background: white;
          }
          
          .nota-fiscal-print {
            width: 80mm;
            max-width: 80mm;
            margin: 0;
            padding: 5mm;
            background: white;
            color: #000;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
          }
          
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 5mm;
            margin-bottom: 5mm;
          }
          
          .empresa-nome {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2mm;
          }
          
          .empresa-endereco {
            font-size: 10px;
            margin-bottom: 1mm;
          }
          
          .empresa-contato {
            font-size: 10px;
            margin-bottom: 2mm;
          }
          
          .cnpj {
            font-size: 10px;
            font-weight: bold;
          }
          
          .separator {
            border-bottom: 1px dashed #000;
            margin: 3mm 0;
          }
          
          .pedido-info {
            margin-bottom: 3mm;
          }
          
          .pedido-numero {
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 2mm;
          }
          
          .info-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
            font-size: 10px;
          }
          
          .info-label {
            font-weight: bold;
          }
          
          .itens-header {
            border-bottom: 1px solid #000;
            padding: 1mm 0;
            margin-bottom: 2mm;
            font-weight: bold;
            font-size: 10px;
          }
          
          .item-row {
            border-bottom: 1px dotted #ccc;
            padding: 1mm 0;
            font-size: 10px;
          }
          
          .item-nome {
            margin-bottom: 1mm;
            font-weight: bold;
          }
          
          .item-detalhes {
            margin-left: 2mm;
            font-size: 9px;
            color: #666;
          }
          
          .item-complemento {
            margin-left: 2mm;
            font-size: 9px;
            color: #666;
            margin-top: 1mm;
          }
          
          .item-valor {
            text-align: right;
            font-weight: bold;
          }
          
          .totais {
            margin-top: 3mm;
            border-top: 1px solid #000;
            padding-top: 2mm;
          }
          
          .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
            font-size: 11px;
          }
          
          .total-final {
            font-size: 14px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 1mm;
            margin-top: 2mm;
          }
          
          .pagamento {
            margin-top: 3mm;
            border-top: 1px dashed #000;
            padding-top: 2mm;
            text-align: center;
            font-size: 11px;
          }
          
          .footer {
            margin-top: 5mm;
            text-align: center;
            font-size: 9px;
            border-top: 1px dashed #000;
            padding-top: 2mm;
          }
        }
      `}</style>
      
      <div className="header">
        <div className="empresa-nome">FILA ZERO</div>
        <div className="empresa-endereco">Rua Exemplo, 123 - Centro</div>
        <div className="empresa-endereco">Cidade - Estado - CEP: 00000-000</div>
        <div className="empresa-contato">Tel: (00) 0000-0000 | Email: contato@filazero.com</div>
        <div className="cnpj">CNPJ: 00.000.000/0001-00</div>
      </div>
      
      <div className="separator"></div>
      
      <div className="pedido-info">
        <div className="pedido-numero">PEDIDO #{pedido.codigo || pedido.id}</div>
        <div className="info-line">
          <span className="info-label">Data/Hora:</span>
          <span>{formatDate(pedido.criado_em)}</span>
        </div>
        <div className="info-line">
          <span className="info-label">Cliente:</span>
          <span>{pedido.cliente_nome_real || pedido.cliente_nome || 'Consumidor Final'}</span>
        </div>
        <div className="info-line">
          <span className="info-label">Vendedor:</span>
          <span>{pedido.vendido_por || 'Sistema'}</span>
        </div>
      </div>
      
      <div className="separator"></div>
      
      <div className="itens-header">
        <div>QTD | DESCRIÇÃO | VALOR</div>
      </div>
      
      {itens && itens.length > 0 ? (
        itens.map((item) => (
          <div key={item.id} className="item-row">
            <div className="item-nome">
              {item.quantidade}x {item.produto_nome}
            </div>
            {item.produto_descricao && (
              <div className="item-detalhes">{item.produto_descricao}</div>
            )}
            {item.complementos && item.complementos.length > 0 && (
              <div className="item-complemento">
                {item.complementos.map((complemento) => (
                  <div key={complemento.id}>
                    + {complemento.quantidade}x {complemento.nome_complemento} - {formatCurrency(complemento.valor_total)}
                  </div>
                ))}
              </div>
            )}
            <div className="item-valor">{formatCurrency(item.valor_total)}</div>
          </div>
        ))
      ) : (
        <div>Nenhum item encontrado</div>
      )}
      
      <div className="totais">
        <div className="total-line">
          <span>Subtotal:</span>
          <span>{formatCurrency(pedido.valor_total)}</span>
        </div>
        <div className="total-line">
          <span>Desconto:</span>
          <span>- {formatCurrency(0)}</span>
        </div>
        <div className="total-line">
          <span>Acréscimos:</span>
          <span>{formatCurrency(0)}</span>
        </div>
        <div className="total-line total-final">
          <span>TOTAL:</span>
          <span>{formatCurrency(pedido.valor_total)}</span>
        </div>
      </div>
      
      <div className="pagamento">
        <div><strong>FORMA DE PAGAMENTO:</strong></div>
        <div>{pedido.forma_pagamento || 'Não informado'}</div>
        <div><strong>VALOR PAGO:</strong> {formatCurrency(pedido.valor_total)}</div>
      </div>
      
      <div className="footer">
        <div>Obrigado pela preferência!</div>
        <div>Volte sempre!</div>
        <div>Data de impressão: {formatDate(new Date())}</div>
      </div>
    </div>
  );
};

export default NotaFiscal;



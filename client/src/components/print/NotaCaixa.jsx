import React from 'react';

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  const num = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

const formatDateTime = (iso) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(d);
  } catch {
    return iso;
  }
};

const NotaCaixa = ({ caixa, movimentacoes = [], pagamentos = [], usuarioAbertura = null, usuarioFechamento = null, estabelecimento = null }) => {
  if (!caixa) return null;

  return (
    <div className="nota-caixa-print">
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
          
          .nota-caixa-print {
            width: 350px;
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
          .movement-row { display: flex; justify-content: space-between; align-items: center; margin: 2px 0; font-size: 10px; }
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

      {/* Título */}
      <div className="center bold" style={{fontSize: '14px'}}>
        DETALHES DO CAIXA
      </div>

      <div className="line"></div>


      {/* Resumo Financeiro */}
      <div className="small">
        <div className="item-row">
          <span>Valor de Abertura:</span>
          <span>{formatCurrency(caixa.valor_abertura)}</span>
        </div>
        <div className="item-row">
          <span>Entradas:</span>
          <span>{formatCurrency(caixa.entradas)}</span>
        </div>
        <div className="item-row">
          <span>Saídas:</span>
          <span>{formatCurrency(caixa.saidas)}</span>
        </div>
        <div className="item-row">
          <span>Fechamento:</span>
          <span>{formatCurrency(caixa.valor_fechamento)}</span>
        </div>
      </div>

      <div style={{borderBottom: '1px solid #000', margin: '5px 0'}}></div>

      <div className="small">
        <div className="item-row">
          <span>Saldo Total:</span>
          <span>{formatCurrency(caixa.saldo_total)}</span>
        </div>
        <div className="item-row bold">
          <span>Diferença:</span>
          <span>{formatCurrency(caixa.diferenca)}</span>
        </div>
      </div>

      <div className="line"></div>

      {/* Responsáveis */}
      <div className="small">
        <div className="bold">RESPONSÁVEIS</div>
        <div style={{margin: '3px 0'}}>
          <div><strong>Aberto por:</strong> {usuarioAbertura ? usuarioAbertura.nome : 'Usuário não encontrado'}</div>
          <div>{formatDateTime(caixa.data_abertura)}</div>
        </div>
        {caixa.data_fechamento && (
          <div style={{margin: '3px 0'}}>
            <div><strong>Fechado por:</strong> {usuarioFechamento ? usuarioFechamento.nome : 'Usuário não encontrado'}</div>
            <div>{formatDateTime(caixa.data_fechamento)}</div>
          </div>
        )}
      </div>

      <div className="line"></div>

      {/* Pagamentos */}
      <div className="small">
        <div className="bold">PAGAMENTOS</div>
        {pagamentos.length > 0 ? (
          pagamentos.map((pagamento, index) => (
            <div key={index} className="item-row">
              <span>{pagamento.forma_pagamento}:</span>
              <span>{formatCurrency(Math.min(pagamento.valor_pago, pagamento.valor_total))}</span>
            </div>
          ))
        ) : (
          <div className="item-row">
            <span>Nenhum pagamento registrado</span>
            <span>R$ 0,00</span>
          </div>
        )}
      </div>

      <div className="line"></div>

      {/* Movimentações */}
      <div className="small">
        <div className="bold">MOVIMENTAÇÕES</div>
        
        {movimentacoes.length > 0 ? (
          movimentacoes.map((mov) => (
            <div key={mov.id} className="movement-row">
              <div>
                <div>{mov.descricao}</div>
                <div style={{fontSize: '9px'}}>{formatDateTime(mov.criado_em)}</div>
              </div>
              <div className="bold">
                {mov.tipo === 'entrada' ? '+' : '-'}{formatCurrency(mov.valor)}
              </div>
            </div>
          ))
        ) : (
          <div className="movement-row">
            <div>
              <div>Nenhuma movimentação registrada</div>
              <div style={{fontSize: '9px'}}>-</div>
            </div>
            <div className="bold">R$ 0,00</div>
          </div>
        )}
      </div>

      <div className="line"></div>


      <div className="center small">
        <div>Data de impressão: {formatDateTime(new Date().toISOString())}</div>
        <div>Relatório gerado automaticamente pelo sistema</div>
      </div>
    </div>
  );
};

export default NotaCaixa;

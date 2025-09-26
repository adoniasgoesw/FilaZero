import React from 'react';
import { createRoot } from 'react-dom/client';
import NotaPedido from '../components/print/NotaPedido';
import NotaCaixa from '../components/print/NotaCaixa';
import NotaCozinha from '../components/print/NotaCozinha';

export const imprimirNotaFiscal = (pedido, itens, cliente, pagamentos, estabelecimento = null) => {
  // Criar um container temporário para renderizar a nota fiscal
  const printContainer = document.createElement('div');
  printContainer.style.position = 'absolute';
  printContainer.style.left = '-9999px';
  printContainer.style.top = '-9999px';
  document.body.appendChild(printContainer);

  // Renderizar o componente NotaPedido
  const root = createRoot(printContainer);
  root.render(React.createElement(NotaPedido, { pedido, itens, cliente, pagamentos, estabelecimento }));

  // Aguardar um momento para garantir que o componente foi renderizado
  setTimeout(() => {
    // Detectar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (isMobile) {
      // Para mobile, usar uma abordagem diferente
      const printContent = printContainer.innerHTML;
      
      // Criar um elemento temporário para impressão
      const printElement = document.createElement('div');
      printElement.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nota Fiscal - Pedido #${pedido?.codigo || pedido?.id || 'N/A'}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 14px;
              line-height: 1.4;
              color: #000;
              background: white;
            }
            
            .nota-fiscal-print {
              width: 100%;
              max-width: 100%;
              margin: 0;
              padding: 20px;
              background: white;
              color: #000;
            }
            
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            
            .empresa-nome {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            
            .empresa-endereco, .empresa-contato {
              font-size: 12px;
              margin-bottom: 4px;
            }
            
            .cnpj {
              font-size: 12px;
              font-weight: bold;
            }
            
            .separator {
              border-bottom: 1px dashed #000;
              margin: 15px 0;
            }
            
            .pedido-info {
              margin-bottom: 15px;
            }
            
            .pedido-numero {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 10px;
            }
            
            .info-line {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 12px;
            }
            
            .info-label {
              font-weight: bold;
            }
            
            .itens-header {
              border-bottom: 1px solid #000;
              padding: 8px 0;
              margin-bottom: 10px;
              font-weight: bold;
              font-size: 12px;
            }
            
            .item-row {
              border-bottom: 1px dotted #ccc;
              padding: 8px 0;
              font-size: 12px;
            }
            
            .item-nome {
              margin-bottom: 4px;
              font-weight: bold;
            }
            
            .item-detalhes, .item-complemento {
              margin-left: 10px;
              font-size: 11px;
              color: #666;
            }
            
            .item-valor {
              text-align: right;
              font-weight: bold;
            }
            
            .totais {
              margin-top: 15px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            
            .total-line {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 13px;
            }
            
            .total-final {
              font-size: 16px;
              font-weight: bold;
              border-top: 2px solid #000;
              padding-top: 5px;
              margin-top: 10px;
            }
            
            .pagamento {
              margin-top: 15px;
              border-top: 1px dashed #000;
              padding-top: 10px;
              text-align: center;
              font-size: 13px;
            }
            
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 11px;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `;
      
      // Abrir em nova aba para impressão
      const newWindow = window.open('', '_blank');
      newWindow.document.write(printElement.innerHTML);
      newWindow.document.close();
      
      // Aguardar carregamento e imprimir
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
          newWindow.onafterprint = () => {
            newWindow.close();
          };
        }, 500);
      };
    } else {
      // Para desktop, usar a abordagem original
      const printWindow = window.open('', '_blank', 'width=300,height=600');
      
      if (printWindow) {
        // Copiar o conteúdo da nota fiscal para a nova janela
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nota Fiscal - Pedido #${pedido?.codigo || pedido?.id || 'N/A'}</title>
          <style>
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
          </style>
        </head>
        <body>
          ${printContainer.innerHTML}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Aguardar o carregamento e imprimir automaticamente
      printWindow.onload = () => {
        printWindow.focus();
        // Imprimir automaticamente sem mostrar o modal de impressão
        setTimeout(() => {
          printWindow.print();
        }, 500);
        
        // Fechar a janela após impressão
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    }
    }
    
    // Limpar o container temporário
    root.unmount();
    document.body.removeChild(printContainer);
  }, 100);
};

export const imprimirNotaCozinha = (pedido, itens, identificacao, nomePonto, vendedor, usuarioId, estabelecimento = null) => {
  // Criar um container temporário para renderizar a nota de cozinha
  const printContainer = document.createElement('div');
  printContainer.style.position = 'absolute';
  printContainer.style.left = '-9999px';
  printContainer.style.top = '-9999px';
  document.body.appendChild(printContainer);

  // Renderizar o componente NotaCozinha
  const root = createRoot(printContainer);
  root.render(React.createElement(NotaCozinha, { 
    pedido, 
    itens, 
    identificacao, 
    nomePonto, 
    vendedor,
    usuarioId,
    estabelecimento
  }));

  // Aguardar um momento para garantir que o componente foi renderizado
  setTimeout(() => {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    
    if (printWindow) {
      // Copiar o conteúdo da nota de cozinha para a nova janela
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nota de Cozinha - Pedido #${pedido?.codigo || pedido?.id || 'N/A'}</title>
          <style>
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
            
            .nota-cozinha-print {
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
          </style>
        </head>
        <body>
          ${printContainer.innerHTML}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Aguardar o carregamento e imprimir automaticamente
      printWindow.onload = () => {
        printWindow.focus();
        // Imprimir automaticamente sem mostrar o modal de impressão
        setTimeout(() => {
          printWindow.print();
        }, 500);
        
        // Fechar a janela após impressão
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    }
    
    // Limpar o container temporário
    root.unmount();
    document.body.removeChild(printContainer);
  }, 100);
};

export const imprimirNotaCaixa = (caixa, movimentacoes, pagamentos, usuarioAbertura, usuarioFechamento, estabelecimento = null) => {
  // Criar um container temporário para renderizar a nota de caixa
  const printContainer = document.createElement('div');
  printContainer.style.position = 'absolute';
  printContainer.style.left = '-9999px';
  printContainer.style.top = '-9999px';
  document.body.appendChild(printContainer);

  // Renderizar o componente NotaCaixa
  const root = createRoot(printContainer);
  root.render(React.createElement(NotaCaixa, { 
    caixa, 
    movimentacoes, 
    pagamentos, 
    usuarioAbertura, 
    usuarioFechamento,
    estabelecimento
  }));

  // Aguardar um momento para garantir que o componente foi renderizado
  setTimeout(() => {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    
    if (printWindow) {
      // Copiar o conteúdo da nota de caixa para a nova janela
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nota de Caixa - ${caixa?.id || 'N/A'}</title>
          <style>
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
            
            .nota-caixa-print {
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
          </style>
        </head>
        <body>
          ${printContainer.innerHTML}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Aguardar o carregamento e imprimir automaticamente
      printWindow.onload = () => {
        printWindow.focus();
        // Imprimir automaticamente sem mostrar o modal de impressão
        setTimeout(() => {
          printWindow.print();
        }, 500);
        
        // Fechar a janela após impressão
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    }
    
    // Limpar o container temporário
    root.unmount();
    document.body.removeChild(printContainer);
  }, 100);
};
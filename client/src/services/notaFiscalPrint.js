import React from 'react';
import { createRoot } from 'react-dom/client';
import NotaFiscal from '../components/print/NotaFiscal';

export const imprimirNotaFiscal = (pedido, itens) => {
  // Criar um container temporário para renderizar a nota fiscal
  const printContainer = document.createElement('div');
  printContainer.style.position = 'absolute';
  printContainer.style.left = '-9999px';
  printContainer.style.top = '-9999px';
  document.body.appendChild(printContainer);

  // Renderizar o componente NotaFiscal
  const root = createRoot(printContainer);
  root.render(React.createElement(NotaFiscal, { pedido, itens }));

  // Aguardar um momento para garantir que o componente foi renderizado
  setTimeout(() => {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    
    if (printWindow) {
      // Copiar o conteúdo da nota fiscal para a nova janela
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nota Fiscal - Pedido #${pedido.codigo || pedido.id}</title>
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
    
    // Limpar o container temporário
    root.unmount();
    document.body.removeChild(printContainer);
  }, 100);
};


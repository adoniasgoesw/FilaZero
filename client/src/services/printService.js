// Serviço para geração de PDF e impressão de pedidos
import jsPDF from 'jspdf';

class PrintService {
  constructor() {
    this.isPrinterAvailable = this.checkPrinterAvailability();
  }

  // Verifica se há impressora disponível
  checkPrinterAvailability() {
    // Em um ambiente real, você pode verificar se há impressoras disponíveis
    // Por enquanto, sempre retorna false para gerar apenas PDF
    return false;
  }

  // Gera PDF da nota fiscal
  generateNotaFiscal(pedido, itens) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Configurações de fonte
    doc.setFont('helvetica');
    
    // Cabeçalho da nota fiscal
    this.addHeader(doc, pageWidth, pedido);
    
    // Informações do pedido
    this.addPedidoInfo(doc, pageWidth, pedido);
    
    // Itens do pedido
    this.addItens(doc, pageWidth, itens);
    
    // Rodapé
    this.addFooter(doc, pageWidth, pageHeight);
    
    return doc;
  }

  addHeader(doc, pageWidth, pedido) {
    // Título principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTA FISCAL', pageWidth / 2, 20, { align: 'center' });
    
    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, 25, pageWidth - 20, 25);
    
    // Informações do estabelecimento (simuladas)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('FilaZero - Sistema de Gestão', pageWidth / 2, 35, { align: 'center' });
    doc.text('CNPJ: 00.000.000/0001-00', pageWidth / 2, 42, { align: 'center' });
    doc.text('Rua Exemplo, 123 - Centro', pageWidth / 2, 49, { align: 'center' });
    doc.text('Cidade - Estado - CEP: 00000-000', pageWidth / 2, 56, { align: 'center' });
    
    // Linha separadora
    doc.line(20, 60, pageWidth - 20, 60);
  }

  addPedidoInfo(doc, pageWidth, pedido) {
    const formatDateTime = (iso) => {
      if (!iso) return { date: '', time: '' };
      try {
        const date = new Date(iso);
        return {
          date: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date),
          time: new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(date)
        };
      } catch {
        return { date: iso, time: '' };
      }
    };

    const dateTime = formatDateTime(pedido.criado_em);
    
    let y = 70;
    
    // Código do pedido
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`PEDIDO #${pedido.codigo || 'N/A'}`, 20, y);
    y += 10;
    
    // Informações básicas
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Data: ${dateTime.date}`, 20, y);
    doc.text(`Horário: ${dateTime.time}`, pageWidth / 2, y);
    y += 8;
    
    doc.text(`Cliente: ${pedido.cliente_nome_real || pedido.cliente_nome || 'Não informado'}`, 20, y);
    y += 8;
    
    doc.text(`Canal: ${pedido.canal || 'PDV'}`, 20, y);
    doc.text(`Vendido por: ${pedido.vendido_por || '—'}`, pageWidth / 2, y);
    y += 8;
    
    doc.text(`Forma de Pagamento: ${pedido.forma_pagamento || 'Não informado'}`, 20, y);
    y += 15;
    
    // Linha separadora
    doc.line(20, y, pageWidth - 20, y);
    y += 10;
  }

  addItens(doc, pageWidth, itens) {
    let y = 120;
    
    // Cabeçalho da tabela de itens
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM', 20, y);
    doc.text('QTD', 100, y);
    doc.text('VALOR UNIT.', 130, y);
    doc.text('TOTAL', 160, y);
    y += 8;
    
    // Linha separadora
    doc.line(20, y, pageWidth - 20, y);
    y += 8;
    
    // Itens
    doc.setFont('helvetica', 'normal');
    let totalGeral = 0;
    
    itens.forEach((item, index) => {
      // Verificar se precisa de nova página
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      // Nome do produto
      doc.setFontSize(9);
      doc.text(item.produto_nome || 'Produto', 20, y);
      y += 6;
      
      // Quantidade e valores
      doc.text(`${item.quantidade}x`, 100, y);
      doc.text(this.formatCurrency(item.valor_unitario), 130, y);
      doc.text(this.formatCurrency(item.valor_total), 160, y);
      y += 6;
      
      // Complementos
      if (item.complementos && item.complementos.length > 0) {
        item.complementos.forEach(complemento => {
          doc.setFontSize(8);
          doc.text(`  + ${complemento.quantidade}x ${complemento.nome_complemento}`, 25, y);
          doc.text(this.formatCurrency(complemento.valor_total), 160, y);
          y += 5;
        });
      }
      
      totalGeral += parseFloat(item.valor_total || 0);
      y += 8;
    });
    
    // Linha separadora final
    y += 5;
    doc.line(20, y, pageWidth - 20, y);
    y += 10;
    
    // Total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${this.formatCurrency(totalGeral)}`, pageWidth - 20, y, { align: 'right' });
  }

  addFooter(doc, pageWidth, pageHeight) {
    const y = pageHeight - 40;
    
    // Linha separadora
    doc.line(20, y, pageWidth - 20, y);
    
    // Mensagem de agradecimento
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Obrigado pela preferência!', pageWidth / 2, y + 10, { align: 'center' });
    doc.text('Volte sempre!', pageWidth / 2, y + 18, { align: 'center' });
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value || 0));
  }

  // Método principal para imprimir
  async printPedido(pedido, itens) {
    try {
      // Gerar PDF
      const pdf = this.generateNotaFiscal(pedido, itens);
      
      // Se há impressora disponível, tentar imprimir
      if (this.isPrinterAvailable) {
        // Em um ambiente real, você usaria uma biblioteca como Print.js
        // ou uma API de impressão do navegador
        console.log('Tentando imprimir...');
        // pdf.autoPrint();
      }
      
      // Sempre gerar e baixar o PDF
      const fileName = `pedido_${pedido.codigo || pedido.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      return { success: true, message: 'PDF gerado com sucesso!' };
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return { success: false, message: 'Erro ao gerar PDF: ' + error.message };
    }
  }
}

export default new PrintService();

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import Sidebar from '../layout/Sidebar';
import ListaItensPedido from '../list/ListaItensPedido';
import ListaValores from '../list/ListaValores';
import Surcharge from '../buttons/Surcharge';
import Discount from '../buttons/Discount';
import KitchenButton from '../buttons/Kitchen';
import DeleteButton from '../buttons/Delete';
import SaveButton from '../buttons/Save';
import CancelButton from '../buttons/Cancel';
import { 
  Clock, Users, DollarSign, ChefHat, ShoppingCart, Plus, Minus, 
  ArrowLeft, Search, Pizza, Coffee, Utensils, Trash2, Printer, 
  Percent, PlusCircle, Save, X, Star, Heart
} from 'lucide-react';

const DashboardPreview = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCategoryId, setSelectedCategoryId] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dados mockados para o preview
  const categorias = [
    { id: 1, nome: 'Pizzas', imagem_url: null },
    { id: 2, nome: 'Bebidas', imagem_url: null },
    { id: 3, nome: 'Sobremesas', imagem_url: null }
  ];

  const produtos = [
    { id: 1, nome: 'Pizza Margherita', valor_venda: 32.90, categoria_id: 1, imagem_url: null },
    { id: 2, nome: 'Pizza Calabresa', valor_venda: 32.90, categoria_id: 1, imagem_url: null },
    { id: 3, nome: 'Coca-Cola 350ml', valor_venda: 4.00, categoria_id: 2, imagem_url: null },
    { id: 4, nome: 'Açaí Completo', valor_venda: 15.90, categoria_id: 3, imagem_url: null }
  ];

  const itensPedido = [
    { id: 1, name: 'Pizza Margherita', qty: 2, unitPrice: 32.90, complements: [] },
    { id: 2, name: 'Pizza Calabresa', qty: 1, unitPrice: 32.90, complements: [] },
    { id: 3, name: 'Coca-Cola 350ml', qty: 3, unitPrice: 4.00, complements: [] }
  ];

  const subtotal = itensPedido.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const taxaServico = subtotal * 0.1;
  const total = subtotal + taxaServico;

  const getImageUrl = (imagemUrl) => {
    if (!imagemUrl) return null;
    if (String(imagemUrl).startsWith('http')) return imagemUrl;
    const normalizedUrl = String(imagemUrl).replace(/\\/g, '/');
    const baseEnv = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:3001';
    const cleanBase = baseEnv.replace(/\/$/, '');
    const cleanImage = normalizedUrl.replace(/^\//, '');
    return `${cleanBase}/${cleanImage}`;
  };

  return (
    <div className="relative perspective-1000">
      {/* Moldura do computador/tablet */}
      <div className="relative transform rotate-y-12 rotate-x-6 hover:rotate-y-6 hover:rotate-x-3 transition-transform duration-700 ease-out">
        {/* Tela do computador */}
        <div className="bg-gray-800 rounded-2xl p-4 shadow-2xl">
          {/* Barra superior do computador */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-white text-sm font-medium">FilaZero - Ponto de Atendimento</div>
            <div className="text-white text-sm">{currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>

          {/* Conteúdo da tela - Ponto de Atendimento com Sidebar */}
          <div className="bg-white rounded-lg overflow-hidden h-[500px]">
            <div className="flex h-full">
              {/* Sidebar na esquerda */}
              <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 h-full">
                <Sidebar hideMobileFooter={true} />
              </div>

              {/* Conteúdo principal - Grid com painéis */}
              <div className="flex flex-1 h-full">
                {/* Painel de Detalhes (50%) */}
                <div className="w-[50%] border-r bg-gray-50 p-3">
                  {/* Header com botão voltar, mesa e input nome */}
                  <div className="flex items-center justify-between mb-4">
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Mesa 5</span>
                      <input 
                        type="text" 
                        value="João Silva" 
                        className="text-sm px-2 py-1 border rounded w-24"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Lista de Itens do Pedido */}
                  <div className="mb-4" style={{ height: '200px' }}>
                    <ListaItensPedido 
                      items={itensPedido} 
                      onItemsChange={() => {}} 
                      pendingItems={[]} 
                      onPendingDecrementOrDelete={() => {}}
                    />
                  </div>

                  {/* Lista de Valores */}
                  <div className="mb-4" style={{ height: '120px' }}>
                    <ListaValores 
                      subtotal={subtotal}
                      acrescimo={0}
                      desconto={0}
                      pago={0}
                      valorPago={0}
                      valorRestante={total}
                      showAcrescimo={false}
                      showDesconto={false}
                      mode="details"
                    />
                  </div>

                  {/* Botões de ação */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <Surcharge onClick={() => {}} />
                    <Discount onClick={() => {}} />
                    <KitchenButton />
                    <button
                      className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Imprimir para Cozinha"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <DeleteButton square onClick={() => {}} variant="white-red" />
                  </div>

                  {/* Botão finalizar */}
                  <button className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">
                    Adicionar pagamento
                  </button>
                </div>

                {/* Painel de Itens (50%) */}
                <div className="w-[50%] p-3">
                  {/* Barra de pesquisa */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar produtos e categorias" 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Categorias menores com bordas azuis */}
                  <div className="flex items-start gap-2 mb-4">
                    {categorias.map((cat) => {
                      const isSelected = Number(selectedCategoryId) === Number(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategoryId(cat.id)}
                          className={`relative flex-shrink-0 w-12 group transition-transform duration-150 ${isSelected ? 'scale-110 z-[1]' : 'hover:scale-110'}`}
                        >
                          <div className={`mx-auto w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shadow-sm border-2 ${isSelected ? 'border-blue-600' : 'border-blue-500'} mt-1 mb-1`}>
                            {getImageUrl(cat.imagem_url) ? (
                              <img src={getImageUrl(cat.imagem_url)} alt={cat.nome} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {cat.nome === 'Pizzas' && <Pizza className="w-4 h-4 text-gray-400" />}
                                {cat.nome === 'Bebidas' && <Coffee className="w-4 h-4 text-gray-400" />}
                                {cat.nome === 'Sobremesas' && <Heart className="w-4 h-4 text-gray-400" />}
                              </div>
                            )}
                          </div>
                          <div className="mt-1 text-[9px] text-slate-700 text-center truncate">{cat.nome}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Produtos em cards menores */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {produtos
                      .filter(p => !selectedCategoryId || Number(p.categoria_id) === Number(selectedCategoryId))
                      .filter(p => {
                        const q = String(search || '').toLowerCase().trim();
                        if (!q) return true;
                        const name = String(p.nome || '').toLowerCase();
                        return name.includes(q);
                      })
                      .map((produto) => (
                        <button 
                          key={produto.id} 
                          className="relative text-left bg-white border border-gray-200 rounded-xl p-2 shadow-sm hover:shadow transition-transform duration-150 hover:-translate-y-0.5"
                        >
                          <div className="aspect-square p-1.5 relative">
                            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                              {getImageUrl(produto.imagem_url) ? (
                                <img src={getImageUrl(produto.imagem_url)} alt={produto.nome} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  {produto.categoria_id === 1 && <Pizza className="w-6 h-6 text-gray-400" />}
                                  {produto.categoria_id === 2 && <Coffee className="w-6 h-6 text-gray-400" />}
                                  {produto.categoria_id === 3 && <Heart className="w-6 h-6 text-gray-400" />}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-1">
                            <div className="text-[11px] font-medium text-gray-900 truncate">{produto.nome}</div>
                            <div className="text-[11px] font-semibold text-gray-800">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.valor_venda)}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>

                  {/* Footer do painel itens com botões Cancelar e Salvar */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-end gap-2 w-full">
                      <CancelButton onClick={() => {}} className="w-auto min-w-[120px] px-4 py-2.5 text-xs rounded-lg whitespace-nowrap" />
                      <SaveButton onClick={() => {}} className="w-auto min-w-[120px] px-4 py-2.5 text-xs rounded-lg whitespace-nowrap">
                        Salvar
                      </SaveButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 rounded-full animate-float" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-500/20 rounded-full animate-float-delayed" />
      </div>
    </div>
  );
};

export default DashboardPreview;
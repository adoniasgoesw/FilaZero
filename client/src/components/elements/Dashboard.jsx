"use client"

import { useState } from "react"
import { ArrowLeft, Edit3, Trash2, DollarSign, Percent, UtensilsCrossed, Printer, Search } from "lucide-react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Card } from "../ui/Card"

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [productCounts, setProductCounts] = useState({})
  const [orderItems, setOrderItems] = useState([
    { id: 1, name: "Pizza Calabresa", price: 50, quantity: 2, total: 100 },
    { id: 7, name: "Cheeseburger", price: 22, quantity: 1, total: 22 }
  ])
  const [selectedCategory, setSelectedCategory] = useState("Pizza")

  const categories = [
    { name: "Batata", image: "/src/assets/batata.webp" },
    { name: "Hambúrguer", image: "/src/assets/hamburguer.webp" },
    { name: "Pizza", image: "/src/assets/pizza.webp" },
    { name: "Sobremesa", image: "/src/assets/sorvete.webp" },
  ]

  const products = [
    // Pizzas
    { id: 1, name: "Pizza Calabresa", price: 50.00, image: "/src/assets/calabresa.webp", category: "Pizza" },
    { id: 2, name: "Pizza Chocolate", price: 50.00, image: "/src/assets/chocolate.webp", category: "Pizza" },
    { id: 3, name: "Pizza Portuguesa", price: 50.00, image: "/src/assets/portuguesa.webp", category: "Pizza" },
    { id: 4, name: "Pizza Frango e Catupiry", price: 50.00, image: "/src/assets/frango_e_catupiry.webp", category: "Pizza" },
    { id: 5, name: "Pizza Pepperoni", price: 50.00, image: "/src/assets/pepperoni.webp", category: "Pizza" },
    
    // Batatas
    { id: 6, name: "Batata Frita", price: 10.00, image: "/src/assets/batata.webp", category: "Batata" },
    
    // Hambúrgueres
    { id: 7, name: "Cheeseburger", price: 22.00, image: "/src/assets/hamburguer.webp", category: "Hambúrguer" },
    
    // Sobremesas
    { id: 9, name: "Sundae de Chocolate", price: 8.00, image: "/src/assets/sorvete.webp", category: "Sobremesa" },
  ]

  const handleProductClick = (productId) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    setProductCounts(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))

    setOrderItems(prev => {
      const existingItem = prev.find(item => item.id === productId)
      if (existingItem) {
        return prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      } else {
        return [...prev, {
          id: productId,
          name: product.name,
          price: product.price,
          quantity: 1,
          total: product.price
        }]
      }
    })
  }

  const handleDeleteItem = (productId) => {
    setProductCounts(prev => {
      const newCount = (prev[productId] || 0) - 1
      if (newCount <= 0) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [productId]: newCount }
    })

    setOrderItems(prev => {
      const existingItem = prev.find(item => item.id === productId)
      if (existingItem) {
        if (existingItem.quantity <= 1) {
          return prev.filter(item => item.id !== productId)
        } else {
          return prev.map(item =>
            item.id === productId
              ? { ...item, quantity: item.quantity - 1, total: (item.quantity - 1) * item.price }
              : item
          )
        }
      }
      return prev
    })
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0)
  }

  const filteredProducts = products.filter(product => product.category === selectedCategory)

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName)
  }


  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 p-1 sm:p-2 md:p-3 flex gap-2 sm:gap-3 md:gap-4">
      {/* Painel Detalhes - 40% width */}
      <div className="w-2/5 h-full bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 flex flex-col shadow-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4 pb-2 sm:pb-3 border-b border-gray-200">
          <span className="font-semibold text-gray-600 text-xs sm:text-xs">Mesa 01</span>
          <div className="flex-1 relative">
            <Input 
              placeholder="Nome do pedido" 
              className="text-xs sm:text-xs border-gray-300 h-6 sm:h-8 pr-1"
            />
          </div>
        </div>

        {/* Listagem de Itens - Altura fixa com limite de 3 itens */}
        <div className="bg-white rounded-lg p-2 sm:p-3 shadow-md border border-gray-200 flex flex-col" style={{ height: '220px' }}>
          {/* Cabeçalho */}
          <h3 className="text-xs sm:text-xs font-semibold text-gray-800 mb-2 sm:mb-3">Itens do Pedido</h3>

          {/* Lista de Itens com rolagem oculta - Altura fixa */}
          <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ maxHeight: '160px' }}>
            <div className="space-y-3">
              {orderItems.length === 0 ? (
                <div className="text-center py-4">
                  <span className="text-xs sm:text-xs text-gray-500">Nenhum item selecionado</span>
                </div>
              ) : (
                orderItems.map((item) => (
                  <div key={item.id} className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <div className="bg-gray-200 rounded-md px-2 py-1">
                        <span className="text-xs sm:text-xs font-medium text-gray-700">{item.quantity}x</span>
                      </div>
                      <div>
                        <span className="text-xs sm:text-xs text-gray-800 block">{item.name}</span>
                        <span className="text-xs sm:text-xs font-semibold text-gray-800">R$ {item.total.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                    <Trash2 
                      className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 cursor-pointer hover:text-red-700" 
                      onClick={() => handleDeleteItem(item.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="bg-white rounded-lg p-2 sm:p-3 shadow-md border border-gray-200 mt-2 sm:mt-3">
          {/* Cabeçalho */}
          <h3 className="text-xs sm:text-xs font-semibold text-gray-800 mb-2 sm:mb-3">Valores</h3>

          {/* Subtotal e Total */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs sm:text-xs text-gray-600">Subtotal:</span>
              <span className="text-xs sm:text-xs font-semibold text-gray-800">R$ {calculateSubtotal().toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-xs font-semibold text-gray-800">Total:</span>
              <span className="text-xs sm:text-xs font-bold text-gray-800">R$ {calculateSubtotal().toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Painel Itens - 60% width no lado direito */}
      <div className="w-3/5 h-full bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 flex flex-col shadow-lg border border-gray-200">
        {/* Barra de Pesquisa */}
        <div className="relative mb-2 sm:mb-3 md:mb-4">
          <Search className="absolute left-2 sm:left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <Input
            placeholder="Pesquisar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-6 sm:pl-8 md:pl-10 text-xs sm:text-xs h-6 sm:h-8 md:h-9"
          />
        </div>

        {/* Categorias - Abaixo da barra de pesquisa */}
        <div className="flex gap-1 sm:gap-2 md:gap-3 mb-3 sm:mb-4 justify-start">
          {categories.map((category, index) => (
            <div key={index} className="flex flex-col items-center cursor-pointer" onClick={() => handleCategoryClick(category.name)}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 p-0.5 sm:p-1 transition-colors ${
                selectedCategory === category.name 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-blue-500 hover:border-blue-600'
              }`}>
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className={`text-xs sm:text-xs text-center font-medium mt-1 ${
                selectedCategory === category.name 
                  ? 'text-blue-600' 
                  : 'text-gray-700'
              }`}>{category.name}</span>
            </div>
          ))}
        </div>

        {/* Produtos */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 md:gap-3 pb-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="p-1 sm:p-2 md:p-3 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300 bg-white rounded-lg relative" onClick={() => handleProductClick(product.id)}>
                {/* Contador */}
                {productCounts[product.id] > 0 && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-xs font-bold z-[100]">
                    {productCounts[product.id]}
                  </div>
                )}
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full aspect-square rounded-md object-cover mb-1 sm:mb-2"
                />
                <h4 className="text-xs sm:text-xs font-medium mb-1 line-clamp-2 text-gray-800 leading-tight">{product.name}</h4>
                <p className="text-xs sm:text-xs font-semibold text-gray-600">R$ {product.price.toFixed(2)}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

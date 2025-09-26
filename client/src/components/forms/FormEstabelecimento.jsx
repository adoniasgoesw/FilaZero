import React, { useState, useEffect } from 'react';
import { Building2, MapPin, CreditCard } from 'lucide-react';
import FormContainer from './FormContainer';
import FormField from './FormField';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormGrid from './FormGrid';

const FormEstabelecimento = ({ estabelecimentoData, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    setor: '',
    rua: '',
    numero: '',
    bairro: '',
    cep: '',
    cidade: '',
    estado: ''
  });

  const setores = [
    'Pizzaria',
    'Restaurante',
    'Lanchonete',
    'Cafeteria',
    'Bar',
    'Padaria',
    'Confeitaria',
    'Sorveteria',
    'Açaiteria',
    'Hamburgueria',
    'Churrascaria',
    'Sushi',
    'Comida Japonesa',
    'Comida Chinesa',
    'Comida Italiana',
    'Comida Árabe',
    'Comida Mexicana',
    'Fast Food',
    'Delivery',
    'Outros'
  ];


  // Preencher formulário quando os dados chegarem
  useEffect(() => {
    if (estabelecimentoData) {
      setFormData({
        nome: estabelecimentoData.nome || '',
        cnpj: estabelecimentoData.cnpj || '',
        setor: estabelecimentoData.setor || '',
        rua: estabelecimentoData.rua || '',
        numero: estabelecimentoData.numero || '',
        bairro: estabelecimentoData.bairro || '',
        cep: estabelecimentoData.cep || '',
        cidade: estabelecimentoData.cidade || '',
        estado: estabelecimentoData.estado || ''
      });
    }
  }, [estabelecimentoData]);

  // Formatar CNPJ
  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'cnpj') {
      const formattedValue = formatCNPJ(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Dados do formulário a serem enviados:', formData);
    console.log('🔗 Função onSave disponível:', typeof onSave);
    if (onSave) {
      try {
        await onSave(formData);
        // Disparar evento de sucesso para fechar o modal
        window.dispatchEvent(new CustomEvent('modalSaveSuccess', { 
          detail: formData 
        }));
      } catch (error) {
        console.error('❌ Erro ao salvar:', error);
      }
    } else {
      console.error('❌ Função onSave não foi fornecida');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col modal-form bg-white">
      <FormContainer>
        <FormGrid cols={2}>
          {/* Nome do Estabelecimento */}
          <FormField 
            label="Nome do Estabelecimento" 
            required
            helpText="Nome oficial do estabelecimento"
          >
            <FormInput
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Digite o nome do estabelecimento"
              icon={Building2}
              required
            />
          </FormField>

          {/* CNPJ */}
          <FormField 
            label="CNPJ"
            helpText="Formato: 00.000.000/0000-00"
          >
            <FormInput
              type="text"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleInputChange}
              placeholder="00.000.000/0000-00"
              icon={CreditCard}
              maxLength={18}
            />
          </FormField>

          {/* Setor */}
          <FormField 
            label="Setor" 
            required
            helpText="Área de atuação do estabelecimento"
          >
            <FormSelect
              name="setor"
              value={formData.setor}
              onChange={handleInputChange}
              options={setores.map(setor => ({ value: setor, label: setor }))}
              placeholder="Selecione o setor"
              required
            />
          </FormField>

          {/* Rua */}
          <FormField 
            label="Rua"
            helpText="Nome da rua ou avenida"
          >
            <FormInput
              type="text"
              name="rua"
              value={formData.rua}
              onChange={handleInputChange}
              placeholder="Nome da rua"
              icon={MapPin}
            />
          </FormField>

          {/* Número e Bairro */}
          <FormField 
            label="Número"
            helpText="Número do estabelecimento"
          >
            <FormInput
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleInputChange}
              placeholder="123"
            />
          </FormField>

          <FormField 
            label="Bairro"
            helpText="Nome do bairro"
          >
            <FormInput
              type="text"
              name="bairro"
              value={formData.bairro}
              onChange={handleInputChange}
              placeholder="Nome do bairro"
            />
          </FormField>

          {/* CEP, Cidade e Estado */}
          <FormField 
            label="CEP"
            helpText="Formato: 00000-000"
          >
            <FormInput
              type="text"
              name="cep"
              value={formData.cep}
              onChange={handleInputChange}
              placeholder="00000-000"
            />
          </FormField>

          <FormField 
            label="Cidade"
            helpText="Nome da cidade"
          >
            <FormInput
              type="text"
              name="cidade"
              value={formData.cidade}
              onChange={handleInputChange}
              placeholder="Nome da cidade"
            />
          </FormField>

          <FormField 
            label="Estado"
            helpText="Sigla do estado (ex: SP, RJ, MG)"
          >
            <FormInput
              type="text"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              placeholder="Digite o estado (ex: SP, RJ, MG)"
            />
          </FormField>
        </FormGrid>
      </FormContainer>
    </form>
  );
};

export default FormEstabelecimento;

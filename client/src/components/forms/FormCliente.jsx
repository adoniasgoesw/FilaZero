import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Phone, CreditCard, Building } from 'lucide-react';
import api from '../../services/api';
import FormContainer from './FormContainer';
import FormField from './FormField';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import FormGrid from './FormGrid';

const FormCliente = ({ onSave, clienteData, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    endereco: '',
    whatsapp: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Carregar dados do cliente quando o componente monta (para edição)
  useEffect(() => {
    if (clienteData) {
      setFormData({
        nome: clienteData.nome || '',
        cpfCnpj: clienteData.cpf || clienteData.cnpj || '',
        endereco: clienteData.endereco || '',
        whatsapp: clienteData.whatsapp || '',
        email: clienteData.email || ''
      });
    }
  }, [clienteData]);

  // Validadores
  const validarCPF = (cpf) => {
    const numeros = cpf.replace(/[^\d]/g, '');
    if (numeros.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numeros)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(numeros.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(numeros.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.charAt(10))) return false;
    
    return true;
  };

  const validarCNPJ = (cnpj) => {
    const numeros = cnpj.replace(/[^\d]/g, '');
    if (numeros.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(numeros)) return false;
    
    let soma = 0;
    let peso = 2;
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(numeros.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    let resto = soma % 11;
    let dv1 = resto < 2 ? 0 : 11 - resto;
    if (dv1 !== parseInt(numeros.charAt(12))) return false;
    
    soma = 0;
    peso = 2;
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(numeros.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    resto = soma % 11;
    let dv2 = resto < 2 ? 0 : 11 - resto;
    if (dv2 !== parseInt(numeros.charAt(13))) return false;
    
    return true;
  };

  const validarWhatsApp = (whatsapp) => {
    const numeros = whatsapp.replace(/[^\d]/g, '');
    if (numeros.length < 10 || numeros.length > 11) return false;
    const ddd = numeros.substring(0, 2);
    return parseInt(ddd) >= 11 && parseInt(ddd) <= 99;
  };

  const formatarCPFCNPJ = (value) => {
    const numeros = value.replace(/[^\d]/g, '');
    
    // Se tem 11 dígitos ou menos, formata como CPF
    if (numeros.length <= 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    // Se tem mais de 11 dígitos, formata como CNPJ
    else {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const formatarWhatsApp = (value) => {
    const numeros = value.replace(/[^\d]/g, '');
    if (numeros.length === 11) {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numeros.length === 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    
    // Formatação automática
    if (field === 'cpfCnpj') {
      formattedValue = formatarCPFCNPJ(value);
    } else if (field === 'whatsapp') {
      formattedValue = formatarWhatsApp(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const newErrors = {};

    // Nome é obrigatório
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validação de CPF/CNPJ se fornecido
    if (formData.cpfCnpj && formData.cpfCnpj.trim() !== '') {
      const numeros = formData.cpfCnpj.replace(/[^\d]/g, '');
      
      if (numeros.length === 11) {
        // Validar como CPF
        if (!validarCPF(formData.cpfCnpj)) {
          newErrors.cpfCnpj = 'CPF inválido';
        }
      } else if (numeros.length === 14) {
        // Validar como CNPJ
        if (!validarCNPJ(formData.cpfCnpj)) {
          newErrors.cpfCnpj = 'CNPJ inválido';
        }
      } else {
        newErrors.cpfCnpj = 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos';
      }
    }

    // Validação de WhatsApp se fornecido
    if (formData.whatsapp && formData.whatsapp.trim() !== '') {
      if (!validarWhatsApp(formData.whatsapp)) {
        newErrors.whatsapp = 'WhatsApp inválido. Use o formato (XX) XXXXX-XXXX';
      }
    }

    // Validação de email se fornecido
    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    // Disparar evento de sucesso do modal IMEDIATAMENTE
    window.dispatchEvent(new CustomEvent('modalSaveSuccess', { 
      detail: { 
        message: clienteData ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!',
        data: formData
      }
    }));
    
    // Disparar evento de atualização em tempo real
    window.dispatchEvent(new CustomEvent('clienteUpdated'));
    window.dispatchEvent(new CustomEvent('reloadClientes'));
    
    if (onClose) onClose();
    
    // Salvar no backend em background (sem bloquear a UI)
    try {
      const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
      if (!estabelecimentoId) {
        console.error('Estabelecimento não definido. Faça login novamente.');
        return;
      }

      // Separar CPF e CNPJ baseado no número de dígitos
      const numeros = formData.cpfCnpj.replace(/[^\d]/g, '');
      const cpf = numeros.length === 11 ? formData.cpfCnpj.trim() : null;
      const cnpj = numeros.length === 14 ? formData.cpfCnpj.trim() : null;

      const dadosCliente = {
        estabelecimento_id: estabelecimentoId,
        nome: formData.nome.trim(),
        cpf: cpf,
        cnpj: cnpj,
        endereco: formData.endereco.trim() || null,
        whatsapp: formData.whatsapp.trim() || null,
        email: formData.email.trim() || null
      };

      let res;
      if (clienteData) {
        // Editar cliente
        res = await api.put(`/clientes/${clienteData.id}`, dadosCliente);
      } else {
        // Cadastrar cliente
        res = await api.post('/clientes', dadosCliente);
      }

      if (res.success) {
        if (onSave) onSave(res.data);
        console.log('✅ Cliente salvo com sucesso');
      } else {
        console.error('Erro ao salvar cliente:', res.message);
      }
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col modal-form bg-white">
      <FormContainer>
        {/* Nome */}
        <FormField 
          label="Nome" 
          required 
          error={errors.nome}
        >
          <FormInput
            type="text"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            placeholder="Nome completo"
            icon={User}
            error={!!errors.nome}
            required
          />
        </FormField>

        {/* CPF/CNPJ Unificado */}
        <FormField 
          label="CPF ou CNPJ" 
          error={errors.cpfCnpj}
          helpText="Digite apenas números, a formatação será aplicada automaticamente"
        >
          <FormInput
            type="text"
            value={formData.cpfCnpj}
            onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            icon={CreditCard}
            error={!!errors.cpfCnpj}
            maxLength="18"
          />
        </FormField>

        {/* Endereço */}
        <FormField 
          label="Endereço"
          helpText="Endereço completo do cliente"
        >
          <FormTextarea
            value={formData.endereco}
            onChange={(e) => handleInputChange('endereco', e.target.value)}
            placeholder="Endereço completo"
            icon={MapPin}
            rows={3}
          />
        </FormField>

        {/* WhatsApp e Email */}
        <FormGrid cols={2}>
          <FormField 
            label="WhatsApp" 
            error={errors.whatsapp}
            helpText="Formato: (11) 99999-9999"
          >
            <FormInput
              type="text"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              placeholder="(11) 99999-9999"
              icon={Phone}
              error={!!errors.whatsapp}
              maxLength="15"
            />
          </FormField>

          <FormField 
            label="Email" 
            error={errors.email}
            helpText="Email válido para contato"
          >
            <FormInput
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@exemplo.com"
              icon={Mail}
              error={!!errors.email}
            />
          </FormField>
        </FormGrid>
      </FormContainer>
    </form>
  );
};

export default FormCliente;

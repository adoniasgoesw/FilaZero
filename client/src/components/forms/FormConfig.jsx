import React, { useEffect, useState } from 'react';
import { Settings, Table, Receipt, Store } from 'lucide-react';
import api from '../../services/api';
import FormContainer from './FormContainer';
import FormField from './FormField';
import FormInput from './FormInput';


const DEFAULTS = {
  mesasEnabled: true,
  comandasEnabled: false,
  balcaoEnabled: false,
  quantidadeMesas: 4,
  quantidadeComandas: 0,
  quantidadeBalcao: 0,
  prefixoComanda: ''
};

const FormConfig = ({ estabelecimentoId: propEstabelecimentoId }) => {
  const estabId = (propEstabelecimentoId ?? Number(localStorage.getItem('estabelecimentoId'))) || null;
  const [formData, setFormData] = useState({ ...DEFAULTS });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Removido o salvamento automático - agora só salva quando clicar no botão Salvar

  const handleToggle = (field) => {
    setFormData(prev => {
      const togglingTo = !prev[field];
      const otherFields = ['mesasEnabled', 'comandasEnabled', 'balcaoEnabled'].filter(f => f !== field);
      const otherEnabled = otherFields.some(f => prev[f]);

      // Impedir desabilitar todos
      if (!togglingTo && !otherEnabled) {
        setError('Pelo menos um tipo de atendimento deve estar habilitado.');
        return prev;
      }

      const next = { ...prev, [field]: togglingTo };
      
      // Se habilitando novamente, resetar quantidade para 1
      if (togglingTo) {
        if (field === 'mesasEnabled') {
          next.quantidadeMesas = 1;
        } else if (field === 'comandasEnabled') {
          next.quantidadeComandas = 1;
        } else if (field === 'balcaoEnabled') {
          next.quantidadeBalcao = 1;
        }
      }
      
      setError(null);
      // Removido o scheduleAutoSave - agora só salva quando clicar no botão Salvar
      return next;
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Removido o scheduleAutoSave - agora só salva quando clicar no botão Salvar
      return next;
    });
  };

  const fetchConfig = async () => {
    try {
      setError(null);
      if (!estabId) return;
      const res = await api.get(`/pontos-atendimento/config/${estabId}`);
      if (res && res.success && res.data) {
        setFormData({
          mesasEnabled: !!res.data.mesasEnabled,
          comandasEnabled: !!res.data.comandasEnabled,
          balcaoEnabled: !!res.data.balcaoEnabled,
          quantidadeMesas: Math.max(1, Number(res.data.quantidadeMesas ?? DEFAULTS.quantidadeMesas)),
          quantidadeComandas: Number(res.data.quantidadeComandas ?? DEFAULTS.quantidadeComandas),
          quantidadeBalcao: Number(res.data.quantidadeBalcao ?? DEFAULTS.quantidadeBalcao),
          prefixoComanda: String(res.data.prefixoComanda ?? '')
        });
      } else {
        // Garantir defaults no backend caso não exista
        const created = await api.post(`/pontos-atendimento/config/${estabId}`, {});
        if (created && created.success && created.data) {
          setFormData({
            mesasEnabled: !!created.data.mesasEnabled,
            comandasEnabled: !!created.data.comandasEnabled,
            balcaoEnabled: !!created.data.balcaoEnabled,
            quantidadeMesas: Math.max(1, Number(created.data.quantidadeMesas ?? DEFAULTS.quantidadeMesas)),
            quantidadeComandas: Number(created.data.quantidadeComandas ?? DEFAULTS.quantidadeComandas),
            quantidadeBalcao: Number(created.data.quantidadeBalcao ?? DEFAULTS.quantidadeBalcao),
            prefixoComanda: String(created.data.prefixoComanda ?? '')
          });
        } else {
          setFormData({ ...DEFAULTS });
        }
      }
    } catch (err) {
      setError(err?.message || 'Erro ao carregar configuração');
    }
  };

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propEstabelecimentoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!estabId) {
      setError('Estabelecimento não identificado. Faça login novamente.');
      return;
    }
    
    // Guard extra: não permitir enviar todos desabilitados
    if (!formData.mesasEnabled && !formData.comandasEnabled && !formData.balcaoEnabled) {
      setError('Pelo menos um tipo de atendimento deve estar habilitado.');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const payload = { ...formData };
      // Regras de validação: mesas >= 1; se comandas habilitadas, >= 1, caso contrário manter o valor atual (pode ser 0)
      payload.quantidadeMesas = Math.max(1, Number(payload.quantidadeMesas || 1));
      if (payload.comandasEnabled) {
        payload.quantidadeComandas = Math.max(1, Number(payload.quantidadeComandas || 1));
      } else {
        payload.quantidadeComandas = 0;
      }
      if (payload.balcaoEnabled) {
        payload.quantidadeBalcao = Math.max(1, Number(payload.quantidadeBalcao || 1));
      } else {
        payload.quantidadeBalcao = 0;
      }
      
      const res = await api.put(`/pontos-atendimento/config/${estabId}`, payload);
      
      if (res && res.success) {
        // Disparar evento para atualizar a listagem de pontos de atendimento
        console.log('🔄 FormConfig - Disparando evento para atualizar pontos de atendimento');
        window.dispatchEvent(new CustomEvent('refreshPontosAtendimento'));
        
        // Disparar evento para o modal fechar
        window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: { data: payload } }));
      } else {
        throw new Error(res?.message || 'Erro ao salvar configuração');
      }
    } catch (err) {
      console.error('Erro ao salvar configuração:', err);
      setError(err?.message || 'Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form id="form-config" onSubmit={handleSubmit} className="h-full flex flex-col modal-form bg-white">
      <FormContainer>
        {/* Configuração de Mesas */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
            Mesas
          </h3>
          
          <div className="space-y-4">
            {/* Toggle Mesas */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-700">Habilitar Mesas</label>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('mesasEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                  formData.mesasEnabled ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.mesasEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Quantidade de Mesas */}
            {formData.mesasEnabled && (
              <FormField 
                label="Quantidade de Mesas" 
                helpText="Número de mesas disponíveis para atendimento"
              >
                <FormInput
                  type="number"
                  min="1"
                  value={formData.quantidadeMesas}
                  onChange={(e) => handleInputChange('quantidadeMesas', parseInt(e.target.value))}
                  placeholder="Ex: 10"
                />
              </FormField>
            )}
          </div>
        </div>

        {/* Configuração de Comandas */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
            Comandas
          </h3>
          
          <div className="space-y-4">
            {/* Toggle Comandas */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-700">Habilitar Comandas</label>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('comandasEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                  formData.comandasEnabled ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.comandasEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Configurações de Comandas */}
            {formData.comandasEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField 
                  label="Quantidade de Comandas" 
                  helpText="Número de comandas disponíveis"
                >
                  <FormInput
                    type="number"
                    min="1"
                    value={Math.max(1, Number(formData.quantidadeComandas || 1))}
                    onChange={(e) => handleInputChange('quantidadeComandas', Math.max(1, parseInt(e.target.value || '1')))}
                    placeholder="Ex: 50"
                  />
                </FormField>
                
                <FormField 
                  label="Prefixo da Comanda" 
                  helpText="Identificador para as comandas (ex: CMD, COM)"
                >
                  <FormInput
                    type="text"
                    value={formData.prefixoComanda}
                    onChange={(e) => handleInputChange('prefixoComanda', e.target.value)}
                    placeholder="Ex: CMD"
                    icon={Receipt}
                  />
                </FormField>
              </div>
            )}
          </div>
        </div>

        {/* Configuração de Balcões */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
            Balcões
          </h3>
          
          <div className="space-y-4">
            {/* Toggle Balcões */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-700">Habilitar Balcões</label>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('balcaoEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                  formData.balcaoEnabled ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.balcaoEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Quantidade de Balcões */}
            {formData.balcaoEnabled && (
              <FormField 
                label="Quantidade de Balcões" 
                helpText="Número de balcões disponíveis para atendimento"
              >
                <FormInput
                  type="number"
                  min="1"
                  value={formData.quantidadeBalcao}
                  onChange={(e) => handleInputChange('quantidadeBalcao', parseInt(e.target.value))}
                  placeholder="Ex: 3"
                />
              </FormField>
            )}
          </div>
        </div>


        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
              </div>
              <p className="text-sm text-red-700 leading-relaxed font-medium">{error}</p>
            </div>
          </div>
        )}
      </FormContainer>
    </form>
  );
};

export default FormConfig;

import React, { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import api from '../../services/api';


const DEFAULTS = {
  mesasEnabled: true,
  comandasEnabled: false,
  quantidadeMesas: 4,
  quantidadeComandas: 0,
  prefixoComanda: ''
};

const FormConfig = ({ estabelecimentoId: propEstabelecimentoId }) => {
  const estabId = (propEstabelecimentoId ?? Number(localStorage.getItem('estabelecimentoId'))) || null;
  const [formData, setFormData] = useState({ ...DEFAULTS });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const saveDebounceRef = useRef(null);

  const scheduleAutoSave = (nextState) => {
    if (!estabId) return;
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current);
    }
    saveDebounceRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        const payload = { ...nextState };
        payload.quantidadeMesas = Math.max(1, Number(payload.quantidadeMesas || 1));
        if (payload.comandasEnabled) {
          payload.quantidadeComandas = Math.max(1, Number(payload.quantidadeComandas || 1));
        } else {
          payload.quantidadeComandas = 0;
        }
        await api.put(`/pontos-atendimento/config/${estabId}`, payload);
      } catch (err) {
        setError(err?.message || 'Erro ao salvar configuração');
      } finally {
        setSaving(false);
      }
    }, 400);
  };

  const handleToggle = (field) => {
    setFormData(prev => {
      const togglingTo = !prev[field];
      const otherField = field === 'mesasEnabled' ? 'comandasEnabled' : 'mesasEnabled';

      // Impedir desabilitar ambos
      if (!togglingTo && prev[otherField] === false) {
        setError('Pelo menos Mesas ou Comandas deve estar habilitado.');
        return prev;
      }

      const next = { ...prev, [field]: togglingTo };
      
      // Se habilitando novamente, resetar quantidade para 1
      if (togglingTo) {
        if (field === 'mesasEnabled') {
          next.quantidadeMesas = 1;
        } else if (field === 'comandasEnabled') {
          next.quantidadeComandas = 1;
        }
      }
      
      setError(null);
      scheduleAutoSave(next);
      return next;
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      scheduleAutoSave(next);
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
          quantidadeMesas: Math.max(1, Number(res.data.quantidadeMesas ?? DEFAULTS.quantidadeMesas)),
          quantidadeComandas: Number(res.data.quantidadeComandas ?? DEFAULTS.quantidadeComandas),
          prefixoComanda: String(res.data.prefixoComanda ?? '')
        });
      } else {
        // Garantir defaults no backend caso não exista
        const created = await api.post(`/pontos-atendimento/config/${estabId}`, {});
        if (created && created.success && created.data) {
          setFormData({
            mesasEnabled: !!created.data.mesasEnabled,
            comandasEnabled: !!created.data.comandasEnabled,
            quantidadeMesas: Math.max(1, Number(created.data.quantidadeMesas ?? DEFAULTS.quantidadeMesas)),
            quantidadeComandas: Number(created.data.quantidadeComandas ?? DEFAULTS.quantidadeComandas),
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
    try {
      setSaving(true);
      setError(null);
      // Guard extra: não permitir enviar ambos desabilitados
      if (!formData.mesasEnabled && !formData.comandasEnabled) {
        setError('Pelo menos Mesas ou Comandas deve estar habilitado.');
        setSaving(false);
        return;
      }
      const payload = { ...formData };
      // Regras de validação: mesas >= 1; se comandas habilitadas, >= 1, caso contrário manter o valor atual (pode ser 0)
      payload.quantidadeMesas = Math.max(1, Number(payload.quantidadeMesas || 1));
      if (payload.comandasEnabled) {
        payload.quantidadeComandas = Math.max(1, Number(payload.quantidadeComandas || 1));
      } else {
        payload.quantidadeComandas = 0;
      }
      const res = await api.put(`/pontos-atendimento/config/${estabId}`, payload);
      if (!(res && res.success)) {
        throw new Error('Falha ao salvar configuração');
      }
      // Disparar evento para o modal fechar automaticamente
      window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: { data: res.data || payload } }));
    } catch (err) {
      setError(err?.message || 'Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form id="form-config" onSubmit={handleSubmit} className="modal-form h-full flex flex-col bg-white">
      {/* Conteúdo do formulário */}
      <div className="flex-1 p-2 sm:p-4 max-h-96 overflow-y-auto scrollbar-hide space-y-4 sm:space-y-6">
        {/* Configuração de Mesas */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1 sm:pb-2">
            Configuração de Mesas
          </h3>
          
          <div className="space-y-4">
            {/* Habilitar Mesas */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Habilitar Mesas
              </label>
              <button
                type="button"
                onClick={() => handleToggle('mesasEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.mesasEnabled ? 'bg-blue-600' : 'bg-gray-300'
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade de Mesas
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantidadeMesas}
                  onChange={(e) => handleInputChange('quantidadeMesas', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Configuração de Comandas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Configuração de Comandas
          </h3>
          
          <div className="space-y-4">
            {/* Habilitar Comandas */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Habilitar Comandas
              </label>
              <button
                type="button"
                onClick={() => handleToggle('comandasEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.comandasEnabled ? 'bg-blue-600' : 'bg-gray-300'
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade de Comandas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={Math.max(1, Number(formData.quantidadeComandas || 1))}
                    onChange={(e) => handleInputChange('quantidadeComandas', Math.max(1, parseInt(e.target.value || '1')))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prefixo da Comanda
                  </label>
                  <input
                    type="text"
                    value={formData.prefixoComanda}
                    onChange={(e) => handleInputChange('prefixoComanda', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: CMD"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações */}
      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {/* O botão Salvar/Cancelar virá do modal base. Este formulário pode ser submetido via botão externo usando form="form-config" */}
    </form>
  );
};

export default FormConfig;

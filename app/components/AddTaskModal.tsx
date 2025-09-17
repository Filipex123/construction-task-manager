import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, MapPin, Wrench, Package, Hash, DollarSign, Building2, Edit3 } from 'lucide-react';
import { Tarefa } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Tarefa, 'id'>) => void;
  obraId: string;
  mode?: 'add' | 'edit';
  initialTask?: Tarefa | null;
  onUpdateTask?: (tarefaId: string, task: Omit<Tarefa, 'id'>) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, obraId, mode = 'add', initialTask = null, onUpdateTask }) => {
  const [formData, setFormData] = useState({
    local: '',
    atividade: '',
    unidade: 'm²',
    quantidade: '',
    valor: '',
    empreiteira: '',
    status: 'pendente' as Tarefa['status'],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const unidadeOptions = ['m²', 'm³', 'm', 'unidade', 'kg', 'ton', 'ponto', 'peça', 'conjunto', 'verba'];

  const statusOptions = [
    { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'em_andamento', label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
    { value: 'concluida', label: 'Concluída', color: 'bg-green-100 text-green-800' },
    { value: 'atrasada', label: 'Atrasada', color: 'bg-red-100 text-red-800' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.local.trim()) newErrors.local = 'Local é obrigatório';
    if (!formData.atividade.trim()) newErrors.atividade = 'Atividade é obrigatória';
    if (!formData.quantidade || parseFloat(formData.quantidade) <= 0) {
      newErrors.quantidade = 'Quantidade deve ser maior que zero';
    }
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }
    if (!formData.empreiteira.trim()) newErrors.empreiteira = 'Empreiteira é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newTask: Omit<Tarefa, 'id'> = {
      local: formData.local.trim(),
      atividade: formData.atividade.trim(),
      unidade: formData.unidade,
      quantidade: parseFloat(formData.quantidade),
      valor: parseFloat(formData.valor),
      empreiteira: formData.empreiteira.trim(),
      status: formData.status,
    };

    if (mode === 'edit' && initialTask && onUpdateTask) {
      onUpdateTask(initialTask.id, newTask);
    } else {
      onAddTask(newTask);
    }
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      local: '',
      atividade: '',
      unidade: 'm²',
      quantidade: '',
      valor: '',
      empreiteira: '',
      status: 'pendente',
    });
    setErrors({});
    onClose();
  };

  // Populate form when opening in edit mode
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialTask) {
      setFormData({
        local: initialTask.local,
        atividade: initialTask.atividade,
        unidade: initialTask.unidade,
        quantidade: String(initialTask.quantidade ?? ''),
        valor: String(initialTask.valor ?? ''),
        empreiteira: initialTask.empreiteira,
        status: initialTask.status,
      });
      setErrors({});
    }
    if (isOpen && mode === 'add' && !initialTask) {
      setFormData({
        local: '',
        atividade: '',
        unidade: 'm²',
        quantidade: '',
        valor: '',
        empreiteira: '',
        status: 'pendente',
      });
      setErrors({});
    }
  }, [isOpen, mode, initialTask]);

  // Detect if form changed in edit mode
  const isDirty = useMemo(() => {
    if (mode !== 'edit' || !initialTask) return true; // allow add mode
    const normalized = {
      local: formData.local.trim(),
      atividade: formData.atividade.trim(),
      unidade: formData.unidade,
      quantidade: parseFloat(formData.quantidade || '0'),
      valor: parseFloat(formData.valor || '0'),
      empreiteira: formData.empreiteira.trim(),
      status: formData.status,
    };
    return (
      normalized.local !== initialTask.local ||
      normalized.atividade !== initialTask.atividade ||
      normalized.unidade !== initialTask.unidade ||
      normalized.quantidade !== initialTask.quantidade ||
      normalized.valor !== initialTask.valor ||
      normalized.empreiteira !== initialTask.empreiteira ||
      normalized.status !== initialTask.status
    );
  }, [mode, initialTask, formData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">{mode === 'edit' ? <Edit3 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}</div>
            <h2 className="text-lg font-semibold text-gray-900">{mode === 'edit' ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Local */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Local</span>
            </label>
            <input
              type="text"
              value={formData.local}
              onChange={(e) => handleInputChange('local', e.target.value)}
              placeholder="Ex: Térreo - Hall Principal"
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900 ${
                errors.local ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.local && <p className="text-red-600 text-sm mt-1">{errors.local}</p>}
          </div>

          {/* Atividade */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Wrench className="w-4 h-4" />
              <span>Atividade</span>
            </label>
            <input
              type="text"
              value={formData.atividade}
              onChange={(e) => handleInputChange('atividade', e.target.value)}
              placeholder="Ex: Instalação de piso cerâmico"
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900 ${
                errors.atividade ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.atividade && <p className="text-red-600 text-sm mt-1">{errors.atividade}</p>}
          </div>

          {/* Unidade e Quantidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4" />
                <span>Unidade</span>
              </label>
              <select
                value={formData.unidade}
                onChange={(e) => handleInputChange('unidade', e.target.value)}
                className="w-full text-gray-900 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                {unidadeOptions.map((unidade) => (
                  <option className="text-gray-900" key={unidade} value={unidade}>
                    {unidade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4" />
                <span>Quantidade</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.quantidade}
                onChange={(e) => handleInputChange('quantidade', e.target.value)}
                placeholder="0"
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900 ${
                  errors.quantidade ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.quantidade && <p className="text-red-600 text-sm mt-1">{errors.quantidade}</p>}
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Valor (R$)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => handleInputChange('valor', e.target.value)}
              placeholder="0,00"
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900 ${
                errors.valor ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.valor && <p className="text-red-600 text-sm mt-1">{errors.valor}</p>}
          </div>

          {/* Empreiteira */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4" />
              <span>Empreiteira</span>
            </label>
            <input
              type="text"
              value={formData.empreiteira}
              onChange={(e) => handleInputChange('empreiteira', e.target.value)}
              placeholder="Ex: Cerâmica Silva Ltda"
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900 ${
                errors.empreiteira ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.empreiteira && <p className="text-red-600 text-sm mt-1">{errors.empreiteira}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('status', option.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${formData.status === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${option.color}`}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={handleClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mode === 'edit' ? !isDirty : false}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium text-white ${
                mode === 'edit' ? (!isDirty ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700') : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {mode === 'edit' ? 'Salvar Alterações' : 'Adicionar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

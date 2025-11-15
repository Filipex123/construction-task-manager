import { Building2, DollarSign, Edit3, Hash, MapPin, Package, Plus, Wrench, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Atividades, Empreiteira, Local, MeasurementStatusEnum, PaymentStatusEnum, Tarefa, UnidadeMedida } from '../../../types';

import { atividadesService } from '@/app/services/atividadesService';
import { empreiteraService } from '@/app/services/empreiteiraService';
import { localService } from '@/app/services/localService';
import { unidadesService } from '@/app/services/unidadesService';
import { Option, TextWithSelect } from '../InputSelect';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: AddTarefaFormData) => void;
  obraId: number;
  mode?: 'add' | 'edit';
  initialTask?: Tarefa | null;
  onUpdateTask?: (tarefaId: number, task: AddTarefaFormData) => void;
}

export type AddTarefaFormData = {
  local: Local | null;
  atividade: Atividades | null;
  unidadeDeMedida: UnidadeMedida | null;
  empreiteira: Empreiteira | null;
  quantity: number;
  totalAmount: number;
  paymentStatus: Tarefa['paymentStatus'];
};

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, obraId, mode = 'add', initialTask = null, onUpdateTask }) => {
  const [locais, setLocais] = useState<Local[]>([]);
  const [atividades, setAtividades] = useState<Atividades[]>([]);
  const [units, setUnits] = useState<UnidadeMedida[]>([]);
  const [contractors, setContractors] = useState<Empreiteira[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [formData, setFormData] = useState<AddTarefaFormData>({
    local: null,
    atividade: null,
    unidadeDeMedida: null,
    empreiteira: null,
    quantity: 0,
    totalAmount: 0,
    paymentStatus: PaymentStatusEnum.EM_ANDAMENTO,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const statusOptions = [
    { value: PaymentStatusEnum.PENDENTE, label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: PaymentStatusEnum.EM_ANDAMENTO, label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
    { value: PaymentStatusEnum.PAGO, label: 'Pago', color: 'bg-green-100 text-green-800' },
    { value: PaymentStatusEnum.ATRASADO, label: 'Atrasado', color: 'bg-red-100 text-red-800' },
  ];

  const handleInputChange = <K extends keyof AddTarefaFormData>(field: K, value: AddTarefaFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field as string]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData?.local?.name?.trim()) newErrors.location = 'Local é obrigatório';
    if (!formData?.atividade?.name?.trim()) newErrors.activity = 'Atividade é obrigatória';
    if (!formData?.quantity || formData.quantity <= 0) newErrors.quantity = 'Quantidade deve ser maior que zero';
    if (!formData?.totalAmount || formData.totalAmount <= 0) newErrors.totalAmount = 'Valor deve ser maior que zero';
    if (!formData?.empreiteira?.name?.trim()) newErrors.contractor = 'Empreiteira é obrigatória';
    if (!formData?.empreiteira?.name?.trim()) newErrors.unitOfMeasure = 'Unidade de Medida é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildSubmitTask = (): Omit<Tarefa, 'id'> => {
    return {
      local: { id: Number(formData.local!.id), name: formData.local!.name },
      atividade: { id: Number(formData.atividade!.id), name: formData.atividade!.name },
      unidadeDeMedida: { id: Number(formData.unidadeDeMedida!.id), name: formData.unidadeDeMedida!.name },
      empreiteira: { id: Number(formData.empreiteira!.id), name: formData.empreiteira!.name },
      quantity: Number(formData.quantity),
      totalAmount: Number(formData.totalAmount),
      paymentStatus: formData.paymentStatus,
      measurementStatus: MeasurementStatusEnum.PENDENTE,
      quantityExecuted: 0,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const newTask = buildSubmitTask();
    if (mode === 'edit' && initialTask && onUpdateTask) {
      onUpdateTask(initialTask.id, newTask);
    } else {
      onAddTask(newTask);
    }
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      local: null,
      atividade: null,
      unidadeDeMedida: null,
      empreiteira: null,
      quantity: 0,
      totalAmount: 0,
      paymentStatus: PaymentStatusEnum.EM_ANDAMENTO,
    });
    setErrors({});
    onClose();
  };

  // busca opções de selects via services quando abrir o modal (ou obraId mudar)
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [fLocais, fAtividades, fUnits, fContractors] = await Promise.all([localService?.listar(obraId), atividadesService?.listar(), unidadesService?.listar(), empreiteraService?.listar()]);

        if (!mounted) return;

        const locaisArr: Local[] = fLocais.items;
        const atividadesArr: Atividades[] = fAtividades;
        const unitsArr: UnidadeMedida[] = fUnits;
        const contractorsArr: Empreiteira[] = fContractors;

        setLocais(locaisArr);
        setAtividades(atividadesArr);
        setUnits(unitsArr);
        setContractors(contractorsArr);

        // set defaults / preencher se for edição
        if (mode === 'edit' && initialTask) {
          setFormData({
            local: initialTask.local ?? locaisArr[0],
            atividade: initialTask.atividade ?? atividadesArr[0],
            unidadeDeMedida: initialTask.unidadeDeMedida ?? unitsArr[0],
            empreiteira: initialTask.empreiteira ?? contractorsArr[0],
            quantity: initialTask.quantity ?? 0,
            totalAmount: initialTask.totalAmount ?? 0,
            paymentStatus: initialTask.paymentStatus ?? PaymentStatusEnum.EM_ANDAMENTO,
          });
        } else {
          // add mode: keep selects unselected (null) and only keep defaults for simple fields
          setFormData((prev) => ({
            ...prev,
            local: null,
            atividade: null,
            unidadeDeMedida: null,
            empreiteira: null,
            // preserve quantity/total/paymentStatus as they already have defaults
          }));
        }
      } catch (err) {
        console.error('Erro ao carregar opções do modal de tarefa:', err);
        // fallback já definido via mocks
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    };

    loadOptions();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, obraId, mode, initialTask]);

  const isDirty = useMemo(() => {
    if (mode !== 'edit' || !initialTask) return true;
    // simple deep compare
    return (
      JSON.stringify({
        location: initialTask.local,
        activity: initialTask.atividade,
        unitOfMeasure: initialTask.unidadeDeMedida,
        contractor: initialTask.empreiteira,
        quantity: initialTask.quantity,
        totalAmount: initialTask.totalAmount,
        paymentStatus: initialTask.paymentStatus,
      }) !==
      JSON.stringify({
        location: formData.local,
        activity: formData.atividade,
        unitOfMeasure: formData.unidadeDeMedida,
        contractor: formData.empreiteira,
        quantity: formData.quantity,
        totalAmount: formData.totalAmount,
        paymentStatus: formData.paymentStatus,
      })
    );
  }, [mode, initialTask, formData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full md:w-[50vh] h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-2xl overflow-hidden">
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto h-full sm:h-auto">
          {loadingOptions ? (
            <div className="text-center py-12">
              <div className="loader mx-auto w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-3">Carregando opções...</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {/* Local */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Local</span>
                  </label>

                  <TextWithSelect
                    isLoading={loadingOptions}
                    options={locais.map((l) => ({ id: l.id, name: l.name })) as Option[]}
                    value={{
                      id: formData.local?.id || 0,
                      name: formData.local?.name || '',
                    }}
                    onChange={(value) => {
                      if (value) {
                        const selected = locais.find((l) => l.id === value.id) ?? value;
                        handleInputChange('local', selected as Option & Local);
                      } else {
                        handleInputChange('local', null);
                      }
                    }}
                    label={'Locais'}
                  />
                  {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
                </div>

                {/* Atividade */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Wrench className="w-4 h-4" />
                    <span>Atividade</span>
                  </label>

                  <TextWithSelect
                    isLoading={loadingOptions}
                    options={atividades.map((l) => ({ id: l.id, name: l.name })) as Option[]}
                    value={{
                      id: formData.atividade?.id || 0,
                      name: formData.atividade?.name || '',
                    }}
                    onChange={(value) => {
                      if (value) {
                        const selected = atividades.find((l) => l.id === value.id) ?? value;
                        handleInputChange('atividade', selected);
                      } else {
                        handleInputChange('atividade', null);
                      }
                    }}
                  />
                  {errors.activity && <p className="text-red-600 text-sm mt-1">{errors.activity}</p>}
                </div>

                {/* Unidade e Quantidade */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Package className="w-4 h-4" />
                      <span>Unidade</span>
                    </label>
                    <select
                      value={formData.unidadeDeMedida?.id ?? ''}
                      onChange={(e) => {
                        const selected = units.find((u) => String(u.id) === e.target.value) ?? units[0];
                        handleInputChange('unidadeDeMedida', selected);
                      }}
                      className={`w-full px-3 py-3 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                        errors.unitOfMeasure ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="" className="text-gray-200">
                        Selecione uma unidade
                      </option>
                      {units.map((u) => (
                        <option className="text-gray-900" key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    {errors.unitOfMeasure && <p className="text-red-600 text-sm mt-1">{errors.unitOfMeasure}</p>}
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
                      value={formData.quantity ?? ''}
                      onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                      placeholder="0"
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900 ${
                        errors.quantity ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
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
                    value={formData.totalAmount ?? ''}
                    onChange={(e) => handleInputChange('totalAmount', Number(e.target.value))}
                    placeholder="0,00"
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900 ${
                      errors.totalAmount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.totalAmount && <p className="text-red-600 text-sm mt-1">{errors.totalAmount}</p>}
                </div>

                {/* Empreiteira */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span>Empreiteira</span>
                  </label>
                  <select
                    value={formData.empreiteira?.id ?? ''}
                    onChange={(e) => {
                      const selected = contractors.find((c) => String(c.id) === e.target.value) ?? contractors[0];
                      handleInputChange('empreiteira', selected);
                    }}
                    className={`w-full text-gray-900 px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.contractor ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="" className="text-gray-500">
                      Selecione uma empreiteira
                    </option>
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id} className="text-gray-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.contractor && <p className="text-red-600 text-sm mt-1">{errors.contractor}</p>}
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('paymentStatus', option.value as Tarefa['paymentStatus'])}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          formData.paymentStatus === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${option.color}`}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom padding for mobile */}
              <div className="h-48 sm:h-0"></div>
            </>
          )}
        </div>

        {/* Footer com botões */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6">
          <div className="flex space-x-3">
            <button type="button" onClick={handleClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={mode === 'edit' ? !isDirty : false}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium text-white ${
                mode === 'edit' ? (!isDirty ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700') : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {mode === 'edit' ? 'Salvar Alterações' : 'Adicionar Tarefa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

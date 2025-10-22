import { Building2, DollarSign, Edit3, Hash, MapPin, Package, Plus, Wrench, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Atividades, Empreiteira, Local, MeasurementStatusEnum, PaymentStatusEnum, Tarefa, UnidadeMedida } from '../../types';

import { atividadesService } from '@/app/services/atividadesService';
import { empreiteraService } from '@/app/services/empreiteiraService';
import { localService } from '@/app/services/localService';
import { unidadesService } from '@/app/services/unidadesService';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: AddTarefaFormData) => void;
  obraId: number;
  mode?: 'add' | 'edit';
  initialTask?: Tarefa | null;
  onUpdateTask?: (tarefaId: number, task: Omit<Tarefa, 'id'>) => void;
}

export type AddTarefaFormData = {
  location: Local | null;
  activity: Atividades | null;
  unitOfMeasure: UnidadeMedida | null;
  contractor: Empreiteira | null;
  quantity: number;
  totalAmount: number;
  paymentStatus: Tarefa['paymentStatus'];
  dueDate?: string;
};

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, obraId, mode = 'add', initialTask = null, onUpdateTask }) => {
  const [locais, setLocais] = useState<Local[]>([]);
  const [atividades, setAtividades] = useState<Atividades[]>([]);
  const [units, setUnits] = useState<UnidadeMedida[]>([]);
  const [contractors, setContractors] = useState<Empreiteira[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [formData, setFormData] = useState<AddTarefaFormData>({
    location: null,
    activity: null,
    unitOfMeasure: null,
    contractor: null,
    quantity: 0,
    totalAmount: 0,
    paymentStatus: PaymentStatusEnum.PENDENTE,
    dueDate: undefined,
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
    if (!formData?.location?.name?.trim()) newErrors.location = 'Local é obrigatório';
    if (!formData?.activity?.name?.trim()) newErrors.activity = 'Atividade é obrigatória';
    if (!formData?.quantity || formData.quantity <= 0) newErrors.quantity = 'Quantidade deve ser maior que zero';
    if (!formData?.totalAmount || formData.totalAmount <= 0) newErrors.totalAmount = 'Valor deve ser maior que zero';
    if (!formData?.contractor?.name?.trim()) newErrors.contractor = 'Empreiteira é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildSubmitTask = (): Omit<Tarefa, 'id'> => {
    return {
      location: { id: Number(formData.location!.id), name: formData.location!.name },
      activity: { id: Number(formData.activity!.id), name: formData.activity!.name },
      unitOfMeasure: { id: Number(formData.unitOfMeasure!.id), name: formData.unitOfMeasure!.name },
      contractor: { id: Number(formData.contractor!.id), name: formData.contractor!.name },
      quantity: Number(formData.quantity),
      totalAmount: Number(formData.totalAmount),
      paymentStatus: formData.paymentStatus,
      measurementStatus: MeasurementStatusEnum.PENDENTE,
      quantityExecuted: 0,
      dueDate: formData.dueDate ?? new Date().toISOString().slice(0, 10), // default today if not provided
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
      location: null,
      activity: null,
      unitOfMeasure: null,
      contractor: null,
      quantity: 0,
      totalAmount: 0,
      paymentStatus: PaymentStatusEnum.PENDENTE,
      dueDate: undefined,
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
        const [fLocais, fAtividades, fUnits, fContractors] = await Promise.all([
          // ajustes: use os métodos reais do seu service; esses nomes são exemplos
          localService?.listar(obraId),
          atividadesService?.listar(),
          unidadesService?.listar(),
          empreiteraService?.listar(),
        ]);

        if (!mounted) return;
        // alguns services retornam { items } ou array direto — normalize
        const normalize = <T,>(r: any) => {
          if (Array.isArray(r)) return r as T[];
          if (r && Array.isArray(r.items)) return r.items as T[];
          return [];
        };

        const locaisArr = normalize<Local>(fLocais);
        const atividadesArr = normalize<Atividades>(fAtividades);
        const unitsArr = normalize<UnidadeMedida>(fUnits);
        const contractorsArr = normalize<Empreiteira>(fContractors);

        setLocais(locaisArr);
        setAtividades(atividadesArr);
        setUnits(unitsArr);
        setContractors(contractorsArr);

        // set defaults / preencher se for edição
        if (mode === 'edit' && initialTask) {
          setFormData({
            location: initialTask.location ?? locaisArr[0],
            activity: initialTask.activity ?? atividadesArr[0],
            unitOfMeasure: initialTask.unitOfMeasure ?? unitsArr[0],
            contractor: initialTask.contractor ?? contractorsArr[0],
            quantity: initialTask.quantity ?? 0,
            totalAmount: initialTask.totalAmount ?? 0,
            paymentStatus: initialTask.paymentStatus ?? PaymentStatusEnum.PENDENTE,
            dueDate: initialTask.dueDate,
          });
        } else {
          // add mode: keep selects unselected (null) and only keep defaults for simple fields
          setFormData((prev) => ({
            ...prev,
            location: null,
            activity: null,
            unitOfMeasure: null,
            contractor: null,
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
        location: initialTask.location,
        activity: initialTask.activity,
        unitOfMeasure: initialTask.unitOfMeasure,
        contractor: initialTask.contractor,
        quantity: initialTask.quantity,
        totalAmount: initialTask.totalAmount,
        paymentStatus: initialTask.paymentStatus,
        dueDate: initialTask.dueDate,
      }) !==
      JSON.stringify({
        location: formData.location,
        activity: formData.activity,
        unitOfMeasure: formData.unitOfMeasure,
        contractor: formData.contractor,
        quantity: formData.quantity,
        totalAmount: formData.totalAmount,
        paymentStatus: formData.paymentStatus,
        dueDate: formData.dueDate,
      })
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
          {loadingOptions ? (
            <div className="text-center py-12">
              <div className="loader mx-auto w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-3">Carregando opções...</p>
            </div>
          ) : (
            <>
              {/* Local */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Local</span>
                </label>
                <select
                  value={formData.location?.id ?? ''}
                  onChange={(e) => {
                    const selected = locais.find((l) => String(l.id) === e.target.value) ?? locais[0];
                    handleInputChange('location', selected);
                  }}
                  className={`w-full text-gray-900 px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="" className="text-gray-200">
                    Selecione um local
                  </option>
                  {locais.map((l) => (
                    <option key={l.id} value={l.id} className="text-gray-900">
                      {l.name}
                    </option>
                  ))}
                </select>
                {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
              </div>

              {/* Atividade */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Wrench className="w-4 h-4" />
                  <span>Atividade</span>
                </label>
                <select
                  value={formData.activity?.id ?? ''}
                  onChange={(e) => {
                    const selected = atividades.find((a) => String(a.id) === e.target.value) ?? ({ id: 0, name: '' } as Atividades);
                    handleInputChange('activity', selected);
                  }}
                  className={`w-full px-3 py-3 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.activity ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="" className="text-gray-200">
                    Selecione uma atividade
                  </option>
                  {atividades.map((a) => (
                    <option key={a.id} value={a.id} className="text-gray-900">
                      {a.name}
                    </option>
                  ))}
                </select>
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
                    value={formData.unitOfMeasure?.id ?? ''}
                    onChange={(e) => {
                      const selected = units.find((u) => String(u.id) === e.target.value) ?? units[0];
                      handleInputChange('unitOfMeasure', selected);
                    }}
                    className="w-full text-gray-900 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
                  value={formData.contractor?.id ?? ''}
                  onChange={(e) => {
                    const selected = contractors.find((c) => String(c.id) === e.target.value) ?? contractors[0];
                    handleInputChange('contractor', selected);
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

              {/* Due Date (opcional) */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Data Limite</label>
                <input
                  type="date"
                  value={formData.dueDate ?? ''}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full text-gray-900 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </>
          )}

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

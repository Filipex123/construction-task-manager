import { MeasurementStatusEnum, MeasureTarefa } from '@/app/types';
import { CheckCircle2, Hash, Ruler, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

interface MeasureEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: MeasureTarefa) => void;
  initialValues?: MeasureTarefa | null;
}

export const MeasureEntryModal: React.FC<MeasureEntryModalProps> = ({ isOpen, onClose, onConfirm, initialValues = null }) => {
  const [form, setForm] = useState<MeasureTarefa>({ quantity: 0, quantityExecuted: 0, measurementStatus: MeasurementStatusEnum.PENDENTE });
  const [errors, setErrors] = useState<{ quantity?: string; quantityExecuted?: string; status?: string }>({});
  const title = initialValues ? 'Editar Medição' : 'Nova Medição';

  const statusOptions = [
    { value: 'MEDIDO', label: 'Medido' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'RETIDO', label: 'Retido' },
  ];

  useEffect(() => {
    if (isOpen) {
      setForm({
        quantity: initialValues?.quantity != null ? Number(initialValues.quantity) : 0,
        quantityExecuted: initialValues?.quantityExecuted != null ? Number(initialValues.quantityExecuted) : 0,
        measurementStatus: initialValues?.measurementStatus ?? MeasurementStatusEnum.PENDENTE,
        updatedBy: initialValues?.updatedBy ?? undefined,
      });
      setErrors({});
    }
  }, [isOpen, initialValues]);

  const isValid = useMemo(() => {
    const newErrors: { quantity?: string; quantityExecuted?: string; status?: string } = {};
    const prevista = form.quantity || 0;
    const realizada = form.quantityExecuted || 0;
    //Validation of nullable fields
    if (!form.quantity || isNaN(prevista) || prevista < 0) newErrors.quantity = 'Informe um valor válido';
    if (form.quantity === null || form.quantity === undefined || isNaN(realizada) || realizada < 0) newErrors.quantityExecuted = 'Informe um valor válido';
    if (!form.measurementStatus) newErrors.status = 'Selecione um status';
    //Validation of business rules
    if (form.measurementStatus === 'MEDIDO' && form.quantityExecuted > form.quantity) newErrors.status = 'Quantia medida excedida! Contate a diretoria.';
    if (form.measurementStatus === 'MEDIDO' && form.quantityExecuted < form.quantity) newErrors.status = 'Quantia medida a baixo do esperado. Altere o status para em andamento.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    onConfirm({
      quantity: form.quantity,
      quantityExecuted: form.quantityExecuted,
      measurementStatus: form.measurementStatus,
      updatedBy: form.updatedBy,
    });
    onClose();
  };

  const handleMedir = (option: { value: string; label: string }) => {
    // if (option.value === 'MEDIDO' && initialValues?.quantity) {
    //   setForm((p) => ({ ...p, measurementStatus: option.value as MeasurementStatusEnum, quantityExecuted: initialValues?.quantity }));
    // } else {
      setForm((p) => ({ ...p, measurementStatus: option.value as MeasurementStatusEnum }));
    // }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Ruler className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirm} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Medida Prevista */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4" />
              <span>Medida Prevista</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
              placeholder="0,00"
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900 ${
                errors.quantity ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
          </div>

          {/* Medida Realizada */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4" />
              <span>Medida Realizada</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              defaultValue={undefined}
              value={form.quantityExecuted}
              onChange={(e) => setForm((p) => ({ ...p, quantityExecuted: Number(e.target.value) }))}
              placeholder="0,00"
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900 ${
                errors.quantityExecuted ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.quantityExecuted && <p className="text-red-600 text-sm mt-1">{errors.quantityExecuted}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMedir(option)}
                  className={`text-gray-600 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    form.measurementStatus === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status}</p>}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!!errors.status}
              onClick={handleConfirm}
              className="flex-1 px-4 py-3 rounded-lg transition-colors font-medium text-white bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Confirmar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

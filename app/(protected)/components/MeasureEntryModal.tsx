import React, { useEffect, useMemo, useState } from 'react';
import { X, CheckCircle2, Ruler, Hash } from 'lucide-react';

interface MeasureEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { medidaPrevista: number; medidaRealizada: number; status: string }) => void;
  initialValues?: { medidaPrevista?: number; medidaRealizada?: number; status?: string } | null;
  title?: string;
}

export const MeasureEntryModal: React.FC<MeasureEntryModalProps> = ({ isOpen, onClose, onConfirm, initialValues = null, title = 'Registrar Medição' }) => {
  const [form, setForm] = useState({ medidaPrevista: '', medidaRealizada: '', status: 'pendente' });
  const [errors, setErrors] = useState<{ medidaPrevista?: string; medidaRealizada?: string; status?: string }>({});

  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'medido', label: 'Medido' },
    { value: 'retencao', label: 'Retenção' },
  ];

  useEffect(() => {
    if (isOpen) {
      setForm({
        medidaPrevista: initialValues?.medidaPrevista != null ? String(initialValues.medidaPrevista) : '',
        medidaRealizada: initialValues?.medidaRealizada != null ? String(initialValues.medidaRealizada) : '',
        status: initialValues?.status ?? 'pendente',
      });
      setErrors({});
    }
  }, [isOpen, initialValues]);

  const isValid = useMemo(() => {
    const newErrors: { medidaPrevista?: string; medidaRealizada?: string; status?: string } = {};
    const prevista = parseFloat(form.medidaPrevista || '0');
    const realizada = parseFloat(form.medidaRealizada || '0');
    if (!form.medidaPrevista || isNaN(prevista) || prevista < 0) newErrors.medidaPrevista = 'Informe um valor válido';
    if (!form.medidaRealizada || isNaN(realizada) || realizada < 0) newErrors.medidaRealizada = 'Informe um valor válido';
    if (!form.status) newErrors.status = 'Selecione um status';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onConfirm({ medidaPrevista: parseFloat(form.medidaPrevista), medidaRealizada: parseFloat(form.medidaRealizada), status: form.status });
    onClose();
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
              value={form.medidaPrevista}
              onChange={(e) => setForm((p) => ({ ...p, medidaPrevista: e.target.value }))}
              placeholder="0,00"
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900 ${
                errors.medidaPrevista ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.medidaPrevista && <p className="text-red-600 text-sm mt-1">{errors.medidaPrevista}</p>}
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
              value={form.medidaRealizada}
              onChange={(e) => setForm((p) => ({ ...p, medidaRealizada: e.target.value }))}
              placeholder="0,00"
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900 ${
                errors.medidaRealizada ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.medidaRealizada && <p className="text-red-600 text-sm mt-1">{errors.medidaRealizada}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, status: option.value }))}
                  className={`text-gray-600 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    form.status === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
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
            <button type="submit" className="flex-1 px-4 py-3 rounded-lg transition-colors font-medium text-white bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Confirmar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

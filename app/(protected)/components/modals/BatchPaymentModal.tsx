import { Building2, CheckCircle, DollarSign, MapPin, Package, X } from 'lucide-react';
import React from 'react';
import { IdName, Tarefa } from '../../../types';

interface BatchPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tarefas: Tarefa[];
}

export const BatchPaymentModal: React.FC<BatchPaymentModalProps> = ({ isOpen, onClose, onConfirm, tarefas }) => {
  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // helper: normaliza um campo (string | object) para {id, name}
  const toIdName = (val: any): IdName | null => {
    if (val == null) return null;
    if (typeof val === 'string') return { id: val, name: val };
    if (typeof val === 'object') {
      const id = String(val.id ?? val._id ?? val.value ?? val.uuid ?? val.key ?? val.name ?? val.label ?? '');
      const name = String(val.name ?? val.label ?? val.title ?? val.value ?? id);
      return { id: id || name, name };
    }
    return { id: String(val), name: String(val) };
  };

  const totalValue = tarefas.reduce((sum, tarefa) => sum + (tarefa.totalAmount ?? 0), 0);
  const uniqueLocais = (() => {
    const map = new Map<string, IdName>();
    tarefas.forEach((t) => {
      const pair = toIdName((t as any).location);
      if (pair && !map.has(pair.id)) map.set(pair.id, pair);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();
  const uniqueEmpreiteiras = (() => {
    const map = new Map<string, IdName>();
    tarefas.forEach((t) => {
      const pair = toIdName((t as any).contractor);
      if (pair && !map.has(pair.id)) map.set(pair.id, pair);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();

  const handleConfirm = async () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      {/* Mobile: Full screen, Desktop: Centered modal */}
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-4 text-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="bg-white/20 p-2 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold">Pagamento em Lote</h2>
                <p className="text-green-100 text-sm">Confirme os detalhes do pagamento</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-2">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto h-full sm:h-auto">
          <div className="space-y-6">
            {/* Resumo Geral */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Resumo do Pagamento</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">Quantidade de Tarefas</p>
                      <p className="text-2xl font-bold text-blue-900">{tarefas.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-600 mb-1">Empreiteiras</p>
                      <p className="text-2xl font-bold text-purple-900">{uniqueEmpreiteiras.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">Valor Total</p>
                      <p className="text-2xl font-bold text-green-900">{formatCurrency(totalValue)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Lista de Tarefas */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Tarefas Selecionadas</span>
              </h3>
              <div className="bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                {tarefas.map((tarefa, index) => (
                  <div key={tarefa.id} className={`p-4 ${index !== tarefas.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{tarefa.atividade?.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{tarefa.localNivel1.name + ' - ' + tarefa.localNivel2.name + ' - ' + tarefa.localNivel3.name + ' - ' + tarefa.localNivel4.name}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">{tarefa.empreiteira?.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-semibold text-green-600 text-sm">{formatCurrency(tarefa.totalAmount!)}</p>
                        <p className="text-xs text-gray-500">
                          {tarefa.quantity} {tarefa.unidadeDeMedida?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Empreiteiras Envolvidas */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span>Empreiteiras Envolvidas</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {uniqueEmpreiteiras.map((empreiteira) => (
                  <span key={empreiteira?.id} className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {empreiteira?.name}
                  </span>
                ))}
              </div>
            </section>

            {/* Locais Envolvidos */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>Locais Envolvidos</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {uniqueLocais.map((local) => (
                  <span key={local!.id} className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    {local!.name}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Bottom padding for mobile */}
          <div className="h-6 sm:h-0"></div>
        </div>

        {/* Footer com botões */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6">
          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Cancelar
            </button>
            <button onClick={handleConfirm} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Confirmar Pagamento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

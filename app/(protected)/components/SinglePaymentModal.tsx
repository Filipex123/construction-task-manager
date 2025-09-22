import React from 'react';
import { X, DollarSign, CheckCircle, MapPin, Building2, Package, Hash } from 'lucide-react';
import { Tarefa } from '../../types';

interface SinglePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tarefa: Tarefa | null;
}

export const SinglePaymentModal: React.FC<SinglePaymentModalProps> = ({ isOpen, onClose, onConfirm, tarefa }) => {
  if (!isOpen || !tarefa) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statusConfig = {
    pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    em_andamento: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    pago: { label: 'Pago', color: 'bg-green-100 text-green-800 border-green-200' },
    atrasado: { label: 'Atrasado', color: 'bg-red-100 text-red-800 border-red-200' },
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      {/* Mobile: Full screen, Desktop: Centered modal */}
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-4 text-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="bg-white/20 p-2 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold">Confirmar Pagamento</h2>
                <p className="text-green-100 text-sm">Confirme os detalhes da tarefa</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors ml-2">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto h-full sm:h-auto">
          <div className="space-y-6">
            {/* Resumo da Tarefa */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Resumo da Tarefa</span>
              </h3>

              {/* Card principal da tarefa */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-green-900 text-lg mb-1">{tarefa.atividade}</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm text-green-700">
                        <MapPin className="w-4 h-4" />
                        <span>{tarefa.local.name}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${statusConfig[tarefa.statusPagamento].color}`}>{statusConfig[tarefa.statusPagamento].label}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-green-600" />
                    <div>
                      <span className="text-green-700">Quantidade:</span>
                      <p className="font-medium text-green-900">
                        {tarefa.quantidade} {tarefa.unidade}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-green-600" />
                    <div>
                      <span className="text-green-700">Empreiteira:</span>
                      <p className="font-medium text-green-900">{tarefa.empreiteira}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Valor em destaque */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-lg text-white text-center">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <DollarSign className="w-8 h-8" />
                  <span className="text-lg font-medium">Valor do Pagamento</span>
                </div>
                <p className="text-4xl font-bold">{formatCurrency(tarefa.valor)}</p>
              </div>
            </section>

            {/* Detalhes Adicionais */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Detalhes da Tarefa</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Local</p>
                      <p className="text-base font-semibold text-gray-900">{tarefa.local.name}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Empreiteira</p>
                      <p className="text-base font-semibold text-gray-900">{tarefa.empreiteira}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Unidade</p>
                      <p className="text-base font-semibold text-gray-900">{tarefa.unidade}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Hash className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Quantidade</p>
                      <p className="text-base font-semibold text-gray-900">{tarefa.quantidade}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Aviso */}
            <section>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Confirmação de Pagamento</h4>
                    <p className="text-sm text-yellow-700">Ao confirmar, o pagamento desta tarefa será processado. Esta ação não pode ser desfeita.</p>
                  </div>
                </div>
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

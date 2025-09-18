import React from 'react';
import { X, Calendar, DollarSign, User, Package, MapPin, Building2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Tarefa } from '../types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tarefa: Tarefa | null;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, tarefa }) => {
  if (!isOpen || !tarefa) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
  };

  const statusConfig = {
    pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    em_andamento: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle },
    concluida: { label: 'Concluída', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    atrasada: { label: 'Atrasada', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
  };

  const StatusIcon = statusConfig[tarefa.status].icon;

  // Mock data for additional fields (in real app, these would come from the tarefa object)
  const mockData = {
    statusPagamento: 'Pendente',
    statusMedidor: 'Não Medido',
    quantidadeRealizada: 0,
    dataMedicao: '2024-01-20',
    dataPagamentoPrevista: '2024-01-25',
    dataPagamentoRealizada: null,
    dataCriacao: '2024-01-15',
    dataAtualizacao: '2024-01-18',
    usuarioUltimaAtualizacao: 'João Silva',
  };

  const InfoItem = ({ icon: Icon, label, value, highlight = false }: { icon: React.ElementType; label: string; value: string | number | null; highlight?: boolean }) => (
    <div className={`p-4 rounded-lg border ${highlight ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-blue-100' : 'bg-white'}`}>
          <Icon className={`w-5 h-5 ${highlight ? 'text-blue-600' : 'text-gray-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className={`text-base font-semibold ${highlight ? 'text-blue-900' : 'text-gray-900'} break-words`}>{value || 'Não informado'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Mobile: Full screen, Desktop: Centered modal */}
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="bg-white/20 p-2 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold truncate">{tarefa.atividade}</h2>
                <p className="text-blue-100 text-sm truncate">{tarefa.local}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mt-3 flex items-center space-x-2">
            <StatusIcon className="w-5 h-5" />
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${statusConfig[tarefa.status].color}`}>{statusConfig[tarefa.status].label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Informações Principais */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Informações Principais</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={Package} label="Unidade de Medida" value={tarefa.unidade} />
                <InfoItem icon={Package} label="Quantidade" value={tarefa.quantidade} highlight />
                <InfoItem icon={CheckCircle} label="Quantidade Realizada" value={mockData.quantidadeRealizada} />
                <InfoItem icon={DollarSign} label="Valor" value={formatCurrency(tarefa.valor)} highlight />
              </div>
            </section>

            {/* Status e Medição */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span>Status e Medição</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={DollarSign} label="Status Pagamento" value={mockData.statusPagamento} />
                <InfoItem icon={Package} label="Status Medidor" value={mockData.statusMedidor} />
                <InfoItem icon={Calendar} label="Data Medição" value={formatDate(mockData.dataMedicao)} />
                <InfoItem icon={Building2} label="Empreiteiro" value={tarefa.empreiteira} />
              </div>
            </section>

            {/* Datas de Pagamento */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Cronograma de Pagamento</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <InfoItem icon={Calendar} label="Data Prevista para Pagamento" value={formatDate(mockData.dataPagamentoPrevista)} highlight />
                <InfoItem icon={CheckCircle} label="Data do Pagamento Realizado" value={mockData.dataPagamentoRealizada ? formatDate(mockData.dataPagamentoRealizada) : 'Não realizado'} />
              </div>
            </section>

            {/* Informações de Sistema */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Informações do Sistema</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={Calendar} label="Data de Criação" value={formatDate(mockData.dataCriacao)} />
                <InfoItem icon={Calendar} label="Data de Atualização" value={formatDate(mockData.dataAtualizacao)} />
                <div className="sm:col-span-2">
                  <InfoItem icon={User} label="Usuário Última Atualização" value={mockData.usuarioUltimaAtualizacao} />
                </div>
              </div>
            </section>
          </div>

          {/* Bottom padding for mobile */}
          <div className="h-6 sm:h-0"></div>
        </div>
      </div>
    </div>
  );
};

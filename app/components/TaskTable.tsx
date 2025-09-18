import React from 'react';
import { Edit3, Trash2, DollarSign, Grid, List } from 'lucide-react';
import { Tarefa, StatusColor } from '../types';
import { TaskDetailModal } from './TaskDetailModal';

interface TaskTableProps {
  tarefas: Tarefa[];
  onEdit: (tarefaId: string) => void;
  onDelete: (tarefaId: string) => void;
  onPay: (tarefaId: string) => void;
}

type MobileView = 'table' | 'cards' | 'list';

const statusConfig: StatusColor = {
  pendente: 'bg-yellow-100 text-yellow-800',
  em_andamento: 'bg-blue-100 text-blue-800',
  concluida: 'bg-green-100 text-green-800',
  atrasada: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  atrasada: 'Atrasada',
};

export const TaskTable: React.FC<TaskTableProps> = ({ tarefas, onEdit, onDelete, onPay }) => {
  const [mobileView, setMobileView] = React.useState<MobileView>('cards');
  const [selectedTask, setSelectedTask] = React.useState<Tarefa | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleTaskClick = (tarefa: Tarefa) => {
    setSelectedTask(tarefa);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  };

  const ActionButtons = ({ tarefa }: { tarefa: Tarefa }) => (
    <div className="flex space-x-2">
      <button onClick={() => onEdit(tarefa.id)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors" title="Editar">
        <Edit3 className="w-4 h-4" />
      </button>
      <button onClick={() => onDelete(tarefa.id)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors" title="Deletar">
        <Trash2 className="w-4 h-4" />
      </button>
      <button onClick={() => onPay(tarefa.id)} className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors" title="Pagar">
        <DollarSign className="w-4 h-4" />
      </button>
    </div>
  );

  const CardView = () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {tarefas.map((tarefa) => (
        <div key={tarefa.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleTaskClick(tarefa)}>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 text-sm mb-1">{tarefa.local}</h5>
              <p className="text-gray-600 text-sm">{tarefa.atividade}</p>
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[tarefa.status]}`}>{statusLabels[tarefa.status]}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span className="text-gray-500">Quantidade:</span>
              <p className="font-medium text-black">
                {tarefa.quantidade} {tarefa.unidade}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Valor:</span>
              <p className="font-medium text-green-600 text-black">{formatCurrency(tarefa.valor)}</p>
            </div>
          </div>

          <div className="mb-3">
            <span className="text-gray-500 text-sm">Empreiteira:</span>
            <p className="font-medium text-sm text-black">{tarefa.empreiteira}</p>
          </div>

          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <ActionButtons tarefa={tarefa} />
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-3">
      {tarefas.map((tarefa) => (
        <div key={tarefa.id} className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleTaskClick(tarefa)}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h5 className="font-medium text-gray-900 text-sm">{tarefa.local}</h5>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[tarefa.status]}`}>{statusLabels[tarefa.status]}</span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{tarefa.atividade}</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex space-x-4">
              <span className="text-gray-500">
                {tarefa.quantidade} {tarefa.unidade}
              </span>
              <span className="font-medium text-green-600">{formatCurrency(tarefa.valor)}</span>
            </div>
            <ActionButtons tarefa={tarefa} />
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">{tarefa.empreiteira}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const DesktopTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atividade</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empreiteira</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tarefas.map((tarefa) => (
            <tr key={tarefa.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleTaskClick(tarefa)}>
              <td className="px-4 py-4 text-sm text-gray-900">{tarefa.local}</td>
              <td className="px-4 py-4 text-sm text-gray-900">{tarefa.atividade}</td>
              <td className="px-4 py-4 text-sm text-gray-500">{tarefa.unidade}</td>
              <td className="px-4 py-4 text-sm text-gray-900">{tarefa.quantidade}</td>
              <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(tarefa.valor)}</td>
              <td className="px-4 py-4 text-sm text-gray-900">{tarefa.empreiteira}</td>
              <td className="px-4 py-4 text-sm">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[tarefa.status]}`}>{statusLabels[tarefa.status]}</span>
              </td>
              <td className="px-4 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex space-x-2">
                  <button onClick={() => onEdit(tarefa.id)} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors" title="Editar">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(tarefa.id)} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors" title="Deletar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onPay(tarefa.id)} className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors" title="Pagar">
                    <DollarSign className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      {/* Mobile View Toggle - Only visible on mobile */}
      <div className="flex justify-end mb-4 md:hidden">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMobileView('cards')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mobileView === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setMobileView('list')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mobileView === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Lista</span>
          </button>
          <button
            onClick={() => setMobileView('table')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mobileView === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Tabela</span>
          </button>
        </div>
      </div>

      {/* Desktop - Always show table */}
      <div className="hidden md:block">
        <DesktopTable />
      </div>

      {/* Mobile - Show selected view */}
      <div className="md:hidden">
        {mobileView === 'cards' && <CardView />}
        {mobileView === 'list' && <ListView />}
        {mobileView === 'table' && <DesktopTable />}
      </div>

      <TaskDetailModal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} tarefa={selectedTask} />
    </div>
  );
};

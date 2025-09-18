import React from 'react';
import { Calendar, Building, Plus } from 'lucide-react';
import { Obra } from '../types';
import { TaskTable } from './TaskTable';
import { AddTaskModal } from './AddTaskModal';
import { ObraFilters } from './ObraFilters';

interface ObraCardProps {
  obra: Obra;
  onDelete: (tarefaId: string) => void;
  onPay: (tarefaId: string) => void;
  onAddTask: (obraId: string, task: any) => void;
  onUpdateTask: (obraId: string, tarefaId: string, task: any) => void;
}

export const ObraCard: React.FC<ObraCardProps> = ({ obra, onDelete, onPay, onAddTask, onUpdateTask }) => {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [filteredTarefas, setFilteredTarefas] = React.useState(obra.tarefas);
  const [editTaskId, setEditTaskId] = React.useState<string | null>(null);

  // Update filtered tasks when obra.tarefas changes
  React.useEffect(() => {
    setFilteredTarefas(obra.tarefas);
  }, [obra.tarefas]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
  };

  const getTotalValue = () => {
    return filteredTarefas.reduce((total, tarefa) => total + tarefa.valor, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <Building className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">{obra.nome}</h3>
              <p className="text-blue-100 text-sm">{obra.descricao}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(obra.dataInicio)}</span>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="font-medium">{obra.tarefas.length} tarefas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-2 sm:mb-0">
            <span className="text-sm text-gray-600">Valor Total:</span>
            <span className="ml-2 text-xl font-bold text-green-600">{formatCurrency(getTotalValue())}</span>
          </div>
          <div className="flex space-x-4 text-sm text-black">
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>{filteredTarefas.filter((t) => t.status === 'concluida').length} concluídas</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>{filteredTarefas.filter((t) => t.status === 'em_andamento').length} em andamento</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>{filteredTarefas.filter((t) => t.status === 'pendente').length} pendentes</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ObraFilters tarefas={obra.tarefas} onFilterChange={setFilteredTarefas} />

      {/* Tasks Table */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Tarefas</h4>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Tarefa</span>
            <span className="sm:hidden">Nova</span>
          </button>
        </div>
        <TaskTable
          tarefas={filteredTarefas}
          onEdit={(id) => {
            setEditTaskId(id);
            setIsAddModalOpen(true);
          }}
          onDelete={onDelete}
          onPay={onPay}
        />
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditTaskId(null);
        }}
        onAddTask={(task) => onAddTask(obra.id, task)}
        obraId={obra.id}
        mode={editTaskId ? 'edit' : 'add'}
        initialTask={editTaskId ? obra.tarefas.find((t) => t.id === editTaskId) ?? null : null}
        onUpdateTask={(tarefaId, task) => onUpdateTask(obra.id, tarefaId, task)}
      />
    </div>
  );
};

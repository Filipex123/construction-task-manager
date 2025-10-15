import { tarefaService } from '@/app/services/tarefaService';
import { Building, ChevronDown, ChevronUp, DollarSign, Loader2, Plus } from 'lucide-react';
import React from 'react';
import { Obra, Tarefa } from '../../types';
import { AddTaskModal } from './AddTaskModal';
import { BatchPaymentModal } from './BatchPaymentModal';
import { ObraFilters } from './ObraFilters';
import { TaskTable } from './TaskTable';

interface ObraCardProps {
  obra: Obra;
  onDelete?: (tarefaId: number) => void;
  onPay?: (tarefaId: number) => void;
  onAddTask: (obraId: number, task: any) => void;
  onUpdateTask: (obraId: number, tarefaId: number, task: any) => void;
}

export const ObraCard: React.FC<ObraCardProps> = ({ obra, onDelete, onPay, onAddTask, onUpdateTask }) => {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isBatchPaymentModalOpen, setIsBatchPaymentModalOpen] = React.useState(false);
  const [editTaskId, setEditTaskId] = React.useState<number | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [filteredTarefas, setFilteredTarefas] = React.useState<Tarefa[]>([]);

  // const [hasLoadedTasks, setHasLoadedTasks] = React.useState(obra.tarefas.length > 0);
  const handleLoadTasks = async (obraId: number) => {
    const data = await tarefaService.listar(obraId ?? 2);
    setFilteredTarefas(data.items || []);
    return data;
  };

  const handleToggleExpand = async () => {
    if (!isExpanded && filteredTarefas.length === 0 && obra.id) {
      setIsLoading(true);
      try {
        await handleLoadTasks(obra.id);
        console.log('Tarefas carregadas para obra:', filteredTarefas);
        // setHasLoadedTasks(true);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const getTotalValue = () => {
    console.log('Calculating total value for filteredTarefas:', filteredTarefas);
    if (filteredTarefas.length === 0) return 0;
    return filteredTarefas.reduce((total, tarefa) => total + tarefa.totalAmount, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleBatchPayment = () => {
    if (!onPay) return;
    filteredTarefas.forEach((tarefa) => onPay(tarefa.id));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 hover:shadow-xl transition-shadow duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-5 text-white cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-200" onClick={handleToggleExpand}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <div className="flex items-center space-x-2">
              <Building className="w-6 h-6" />
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-xl font-bold">{obra.name}</h3>
              <p className="text-blue-100 text-sm">{obra.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              {isExpanded && (
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="font-medium">{filteredTarefas.length} tarefas</span>
                </div>
              )}

              {isExpanded && onPay && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBatchPaymentModalOpen(true);
                  }}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors font-medium text-sm"
                  title="Pagamento em Lote"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Em Lote</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          {/* Loading State */}
          {/* {isLoading && (
            <div className="px-8 py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando tarefas...</p>
            </div>
          )} */}

          {/* Summary */}
          {onPay && (
            <div className="px-8 py-5 bg-gray-50 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <span className="text-sm text-gray-600">Valor Total:</span>
                  <span className="ml-2 text-xl font-bold text-green-600">{formatCurrency(getTotalValue())}</span>
                </div>
                <div className="flex gap-4 justify-center space-x-4 text-sm text-black">
                  <span className="flex flex-col items-center space-y-1">
                    <span className="text-xs">{filteredTarefas.filter((t) => t.paymentStatus === 'pago').length} pago</span>
                    <div className="w-full h-1 bg-green-500 rounded-full" />
                  </span>
                  <span className="flex flex-col items-center space-y-1">
                    <span className="text-xs">{filteredTarefas.filter((t) => t.paymentStatus === 'em_andamento').length} em andamento</span>
                    <div className="w-full h-1 bg-blue-500 rounded-full" />
                  </span>
                  <span className="flex flex-col items-center space-y-1">
                    <span className="text-xs">{filteredTarefas.filter((t) => t.paymentStatus === 'pendente').length} pendente</span>
                    <div className="w-full h-1 bg-yellow-500 rounded-full" />
                  </span>
                  <span className="flex flex-col items-center space-y-1">
                    <span className="text-xs">{filteredTarefas.filter((t) => t.paymentStatus === 'atrasado').length} atrasado</span>
                    <div className="w-full h-1 bg-red-500 rounded-full" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Content when not loading */}

          {/* Filters */}
          <ObraFilters tarefas={filteredTarefas} onFilterChange={setFilteredTarefas} />

          {/* Tasks Table */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Tarefas</h4>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Tarefa</span>
                <span className="sm:hidden">Nova</span>
              </button>
            </div>

            {filteredTarefas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">Nenhuma tarefa encontrada</div>
                <p className="text-gray-500">Adicione a primeira tarefa desta obra</p>
              </div>
            ) : (
              <TaskTable
                tarefas={filteredTarefas}
                onEdit={(id) => {
                  setEditTaskId(id);
                  setIsAddModalOpen(true);
                }}
                onDelete={onDelete}
                onPay={onPay}
              />
            )}
          </div>
        </div>
      )}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditTaskId(null);
        }}
        onAddTask={(task) => onAddTask(obra.id, task)}
        obraId={obra.id}
        mode={editTaskId ? 'edit' : 'add'}
        initialTask={editTaskId ? filteredTarefas.find((t) => t.id === editTaskId) ?? null : null}
        onUpdateTask={(tarefaId, task) => onUpdateTask(obra.id, tarefaId, task)}
      />
      <BatchPaymentModal isOpen={isBatchPaymentModalOpen} onClose={() => setIsBatchPaymentModalOpen(false)} onConfirm={handleBatchPayment} tarefas={filteredTarefas} />
    </div>
  );
};

import React from 'react';
import { Building, Plus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { DollarSign } from 'lucide-react';
import { Obra } from '../types';
import { TaskTable } from './TaskTable';
import { AddTaskModal } from './AddTaskModal';
import { ObraFilters } from './ObraFilters';
import { BatchPaymentModal } from './BatchPaymentModal';

interface ObraCardProps {
  obra: Obra;
  onDelete: (tarefaId: string) => void;
  onPay: (tarefaId: string) => void;
  onAddTask: (obraId: string, task: any) => void;
  onUpdateTask: (obraId: string, tarefaId: string, task: any) => void;
  onLoadTasks?: (obraId: string) => Promise<void>;
}

export const ObraCard: React.FC<ObraCardProps> = ({ obra, onDelete, onPay, onAddTask, onUpdateTask, onLoadTasks }) => {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isBatchPaymentModalOpen, setIsBatchPaymentModalOpen] = React.useState(false);
  const [filteredTarefas, setFilteredTarefas] = React.useState(obra.tarefas);
  const [editTaskId, setEditTaskId] = React.useState<string | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasLoadedTasks, setHasLoadedTasks] = React.useState(obra.tarefas.length > 0);

  // Update filtered tasks when obra.tarefas changes
  React.useEffect(() => {
    setFilteredTarefas(obra.tarefas);
  }, [obra.tarefas]);

  const handleToggleExpand = async () => {
    if (!isExpanded && !hasLoadedTasks && onLoadTasks) {
      setIsLoading(true);
      try {
        await onLoadTasks(obra.id);
        setHasLoadedTasks(true);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

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

  const handleBatchPayment = () => {
    console.log('Processando pagamento em lote para', filteredTarefas.length, 'tarefas');
    // Aqui você implementaria a lógica de pagamento em lote
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-200" onClick={handleToggleExpand}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <div className="flex items-center space-x-2">
              <Building className="w-6 h-6" />
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-xl font-bold">{obra.nome}</h3>
              <p className="text-blue-100 text-sm">{obra.descricao}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="font-medium">{obra.tarefas.length} tarefas</span>
              </div>
              {isExpanded && (
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
              {/* <div className="text-sm opacity-75">{isExpanded ? 'Clique para recolher' : 'Clique para expandir'}</div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
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

          {/* Loading State */}
          {isLoading && (
            <div className="px-6 py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando tarefas...</p>
            </div>
          )}

          {/* Content when not loading */}
          {!isLoading && (
            <>
              {/* Filters */}
              <ObraFilters tarefas={obra.tarefas} onFilterChange={setFilteredTarefas} />

              {/* Tasks Table */}
              <div className="p-6">
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

                {obra.tarefas.length === 0 ? (
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
            </>
          )}
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
        initialTask={editTaskId ? obra.tarefas.find((t) => t.id === editTaskId) ?? null : null}
        onUpdateTask={(tarefaId, task) => onUpdateTask(obra.id, tarefaId, task)}
      />
      <BatchPaymentModal isOpen={isBatchPaymentModalOpen} onClose={() => setIsBatchPaymentModalOpen(false)} onConfirm={handleBatchPayment} tarefas={filteredTarefas} />
    </div>
  );
};

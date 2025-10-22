import { tarefaService } from '@/app/services/tarefaService';
import { Building, ChevronDown, ChevronUp, DollarSign, Loader2, Plus } from 'lucide-react';
import React from 'react';
import { AddTarefaRequest, Obra, Tarefa } from '../../types';
import { AddTarefaFormData, AddTaskModal } from './AddTaskModal';
import { BatchPaymentModal } from './BatchPaymentModal';
import { ObraFilters, TarefaFilterParams } from './ObraFilters';
import { TaskTable } from './TaskTable';

interface TarefaCardProps {
  obra: Obra;
  onPay?: (tarefaId: number) => void;
}

export const TarefaCard: React.FC<TarefaCardProps> = ({ obra, onPay }) => {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isBatchPaymentModalOpen, setIsBatchPaymentModalOpen] = React.useState(false);
  const [editTaskId, setEditTaskId] = React.useState<number | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [filteredTarefas, setFilteredTarefas] = React.useState<Tarefa[]>([]);
  const [hasLoadedTasks, setHasLoadedTasks] = React.useState(false);

  // server-side pagination / filters
  const [filters, setFilters] = React.useState<Partial<TarefaFilterParams>>({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [totalItems, setTotalItems] = React.useState(0);
  const [isFetching, setIsFetching] = React.useState(false);

  const fetchTasks = React.useCallback(
    async (page = 1, incomingFilters: Partial<TarefaFilterParams> = {}) => {
      setIsLoading(true);
      setIsFetching(true);
      try {
        // ajustar chamada de acordo com sua tarefaService API
        const params = {
          page,
          pageSize,
          ...incomingFilters,
        };
        const data = await tarefaService.listar(obra.id!, JSON.stringify(params));
        // garantir array mesmo que backend retorne undefined
        setFilteredTarefas(Array.isArray(data.items) ? data.items : []);
        setTotalItems(typeof data.total === 'number' ? data.total : Array.isArray(data.items) ? data.items.length : 0);
        setHasLoadedTasks(true);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        setFilteredTarefas([]);
        setTotalItems(0);
      } finally {
        setIsFetching(false);
        setIsLoading(false);
      }
    },
    [obra.id, pageSize]
  );

  const handleToggleExpand = async () => {
    if (!isExpanded && !hasLoadedTasks) {
      await fetchTasks(1, filters);
    }
    setIsExpanded((s) => !s);
  };

  // quando filtros mudam (vem do ObraFilters), reset página e buscar
  const handleFilterChange = (f: Partial<TarefaFilterParams>) => {
    setFilters(f);
    setCurrentPage(1);
    fetchTasks(1, f);
  };

  // quando usuário troca página via TaskTable (server-side), refetch
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTasks(page, filters);
  };

  // --- NEW: handlers para criar, atualizar e excluir tarefas ---
  const handleAdd = async (task: AddTarefaFormData) => {
    try {
      setIsFetching(true);
      // incluir obraId no payload caso o backend precise
      const payload: AddTarefaRequest = {
        quantity: task.quantity,
        totalAmount: task.totalAmount,
        paymentStatus: task.paymentStatus,
        measurementStatus: 'PENDENTE',
        quantityExecuted: 0,
        dueDate: task.dueDate ?? Date.now().toString(),
        updatedBy: 'system', //TODO: ajustar usuário
        fkAtividade: task.activity!.id!,
        fkLocal: task.location!.id!,
        fkUnidadeMedida: task.unitOfMeasure!.id!,
        fkEmpreiteiro: task.contractor!.id!,
      };
      await tarefaService.criar(payload);
      await fetchTasks(1, filters);
      setCurrentPage(1);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Erro ao adicionar tarefa:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdate = async (tarefaId: number, task: AddTarefaFormData) => {
    try {
      setIsFetching(true);
      const payload: Partial<AddTarefaRequest> = {
        quantity: task.quantity,
        totalAmount: task.totalAmount,
        paymentStatus: task.paymentStatus,
        dueDate: task.dueDate ?? Date.now().toString(),
        fkAtividade: task.activity!.id!,
        fkLocal: task.location!.id!,
        fkUnidadeMedida: task.unitOfMeasure!.id!,
        fkEmpreiteiro: task.contractor!.id!,
      };
      await tarefaService.atualizar(tarefaId, payload);
      // recarregar página atual para refletir alterações
      await fetchTasks(currentPage, filters);
      setEditTaskId(null);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDelete = async (tarefaId: number) => {
    try {
      setIsFetching(true);
      await tarefaService.excluir(String(tarefaId));
      // após exclusão, recarregar página atual (pode ajustar para buscar página 1 se necessário)
      await fetchTasks(currentPage, filters);
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
    } finally {
      setIsFetching(false);
    }
  };
  // --- END NEW handlers ---

  const getTotalValue = () => {
    if (filteredTarefas.length === 0) return 0;
    return filteredTarefas.reduce((total, tarefa) => total + (tarefa.totalAmount ?? 0), 0);
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
              {hasLoadedTasks && (
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
      {isExpanded && !isLoading && (
        <div className="animate-in slide-in-from-top-2 duration-300">
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
                    <span className="text-xs">{filteredTarefas.filter((t) => t.paymentStatus.toUpperCase() === 'PAGO').length} pago</span>
                    <div className="w-full h-1 bg-green-500 rounded-full" />
                  </span>
                  <span className="flex flex-col items-center space-y-1">
                    <span className="text-xs">{filteredTarefas.filter((t) => t.paymentStatus.toUpperCase() === 'EM_ANDAMENTO').length} em andamento</span>
                    <div className="w-full h-1 bg-blue-500 rounded-full" />
                  </span>
                  <span className="flex flex-col items-center space-y-1">
                    <span className="text-xs">{filteredTarefas.filter((t) => t.paymentStatus.toUpperCase() === 'PENDENTE').length} pendente</span>
                    <div className="w-full h-1 bg-yellow-500 rounded-full" />
                  </span>
                  <span className="flex flex-col items-center space-y-1">
                    <span className="text-xs">{filteredTarefas.filter((t) => t.paymentStatus.toUpperCase() === 'ATRASADO').length} atrasado</span>
                    <div className="w-full h-1 bg-red-500 rounded-full" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Filters -> envia somente critérios, não faz filtro local */}
          <ObraFilters tarefas={filteredTarefas} onFilterChange={handleFilterChange} />

          {/* Tasks Table: enviamos page items e informação de paginação */}
          <div className="p-8 relative">
            {/* loading overlay while fetching (add/update/delete) */}
            {isFetching ? (
              <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">Tarefas</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTaskId(null);
                      setIsAddModalOpen(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nova Tarefa</span>
                    <span className="sm:hidden">Nova</span>
                  </button>
                </div>

                {filteredTarefas.length === 0 ? (
                  // mensagem quando zero
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
                    onDelete={handleDelete}
                    onPay={onPay}
                    serverSide
                    totalItems={totalItems}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
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
        onAddTask={handleAdd}
        obraId={obra.id!}
        mode={editTaskId !== null ? 'edit' : 'add'}
        initialTask={editTaskId !== null ? filteredTarefas.find((t) => t.id === editTaskId) ?? null : null}
        onUpdateTask={(id, task) => handleUpdate(id, task)}
      />

      <BatchPaymentModal isOpen={isBatchPaymentModalOpen} onClose={() => setIsBatchPaymentModalOpen(false)} onConfirm={handleBatchPayment} tarefas={filteredTarefas} />
    </div>
  );
};

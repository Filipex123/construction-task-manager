import { tarefaService } from '@/app/services/tarefaService';
import { AddTarefaRequest, LastKeyPagination, Obra, Tarefa } from '@/app/types';
import { Building, ChevronDown, ChevronUp, Loader2, Plus } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { ObraFilters, TarefaFilterParams } from '../ObraFilters';
import { AddTarefaFormData, AddTaskModal } from '../modals/AddTaskModal';
import { TaskTable } from '../tables/TaskTable';

interface TarefaCardProps {
  obra: Obra;
  onPay: (tarefaId: number) => Promise<void>;
}

const PAGE_SIZE = 3;

export const TarefaCard: React.FC<TarefaCardProps> = ({ obra, onPay }) => {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editTaskId, setEditTaskId] = React.useState<number | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [filteredTarefas, setFilteredTarefas] = React.useState<Tarefa[]>([]);
  const [hasLoadedTasks, setHasLoadedTasks] = React.useState(false);

  // server-side pagination / filters
  const [filters, setFilters] = React.useState<Partial<TarefaFilterParams>>({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [lastKey, setLastKey] = React.useState<LastKeyPagination | undefined>();

  const fetchTasks = React.useCallback(
    async (incomingFilters: Partial<TarefaFilterParams> = {}) => {
      console.log('lastKey: ', lastKey);
      setIsLoading(true);
      try {
        const params = {
          limit: PAGE_SIZE,
          lastEvaluatedKey: lastKey,
          ...incomingFilters,
        };
        const data = await tarefaService.listar(obra.id!, params);
        console.log('Data: ', data.lastEvaluatedKey);
        setFilteredTarefas(Array.isArray(data.items) ? data.items : []);
        setTotalItems(data.totalCount);
        setLastKey({ id: data.lastEvaluatedKey?.id!, entity: data.lastEvaluatedKey?.entity! });
        setHasLoadedTasks(true);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        setFilteredTarefas([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    },
    [obra.id]
  );

  const handleToggleExpand = async () => {
    // abrir imediatamente e buscar em background para evitar desmontagem/remontagem
    if (!isExpanded && !hasLoadedTasks) {
      setIsExpanded(true);
      // disparar fetch em background sem await para não bloquear UI
      await fetchTasks(filters).catch((err) => {
        console.error('Erro ao carregar tarefas no background:', err);
      });
      return;
    }
    setIsExpanded((s) => !s);
  };

  // quando filtros mudam (vem do ObraFilters), reset página e buscar
  const handleFilterChange = useCallback(
    (f: Partial<TarefaFilterParams>) => {
      setFilters(f);
      setCurrentPage(1);
      return fetchTasks(f);
    },
    [fetchTasks]
  );

  // quando usuário troca página via TaskTable (server-side), refetch
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      return fetchTasks(filters);
    },
    [fetchTasks, filters]
  );

  // --- NEW: handlers para criar, atualizar e excluir tarefas ---
  const handleAdd = useCallback(
    async (task: AddTarefaFormData) => {
      try {
        setIsLoading(true);
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
        await tarefaService.criar(obra.id!, payload);
        await fetchTasks(filters);
        setCurrentPage(1);
        setIsAddModalOpen(false);
      } catch (err) {
        console.error('Erro ao adicionar tarefa:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks, filters]
  );

  const handleUpdate = useCallback(
    async (tarefaId: number, task: AddTarefaFormData) => {
      try {
        setIsLoading(true);
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
        await fetchTasks(filters);
        setEditTaskId(null);
        setIsAddModalOpen(false);
      } catch (err) {
        console.error('Erro ao atualizar tarefa:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks, currentPage, filters]
  );

  const handleDelete = useCallback(
    async (tarefaId: number) => {
      try {
        setIsLoading(true);
        await tarefaService.excluir(String(tarefaId));
        // após exclusão, recarregar página atual (pode ajustar para buscar página 1 se necessário)
        await fetchTasks(filters);
      } catch (err) {
        console.error('Erro ao excluir tarefa:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks, currentPage, filters]
  );

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

  // memoize derived values
  const tarefasCount = useMemo(() => filteredTarefas.length, [filteredTarefas]);
  const totalValue = useMemo(() => getTotalValue(), [filteredTarefas]);

  // estabilizar callbacks passados para filhos (corrige erro de referência)
  const handleEdit = useCallback((id: number) => {
    setEditTaskId(id);
    setIsAddModalOpen(true);
  }, []);

  // Header extraído para fora do componente para não recriar o tipo em cada render
  type HeaderProps = {
    obra: Obra;
    isLoading: boolean;
    isExpanded: boolean;
    hasLoadedTasks: boolean;
    tarefasCount: number;
    onToggle: () => void;
  };

  const HeaderComponent: React.FC<HeaderProps> = React.memo(({ obra, isLoading, isExpanded, hasLoadedTasks, tarefasCount, onToggle }) => {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-5 text-white cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-200" onClick={onToggle}>
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
                  <span className="font-medium">{tarefasCount} tarefas</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  });

  // render
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 hover:shadow-xl transition-shadow duration-300 max-w-7xl mx-auto">
      <HeaderComponent obra={obra} isLoading={isLoading} isExpanded={isExpanded} hasLoadedTasks={hasLoadedTasks} tarefasCount={tarefasCount} onToggle={handleToggleExpand} />
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <div className="px-8 py-5 bg-gray-50 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <span className="text-sm text-gray-600">Valor Total:</span>
                <span className="ml-2 text-xl font-bold text-green-600">{formatCurrency(totalValue)}</span>
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

          <ObraFilters tarefas={filteredTarefas} onFilterClick={handleFilterChange} />

          <div className="p-8 relative">
            {/* overlay de loading: aparece por cima do conteúdo sem desmontar o painel */}
            {isLoading ? (
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
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">Nenhuma tarefa encontrada</div>
                    <p className="text-gray-500">Adicione a primeira tarefa desta obra</p>
                  </div>
                ) : (
                  <TaskTable
                    tarefas={filteredTarefas}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    totalItems={totalItems}
                    currentPage={currentPage}
                    pageSize={PAGE_SIZE}
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
    </div>
  );
};

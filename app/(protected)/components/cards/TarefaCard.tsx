import { summariesService } from '@/app/services/summaryService';
import { tarefaService } from '@/app/services/tarefaService';
import { AddTarefaRequest, Obra, ObraSummary, PAGE_SIZE, Tarefa } from '@/app/types';
import { Building, ChevronDown, ChevronUp, Loader2, Plus } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { ObraFilters, TarefaFilterParams } from '../ObraFilters';
import { SummaryBar } from '../SummaryBar';
import { AddTarefaFormData, AddTaskModal } from '../modals/AddTaskModal';
import { TaskTable } from '../tables/TaskTable';

interface TarefaCardProps {
  obra: Obra;
}

export const TarefaCard: React.FC<TarefaCardProps> = ({ obra }) => {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editTaskId, setEditTaskId] = React.useState<number | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [filteredTarefas, setFilteredTarefas] = React.useState<Tarefa[]>([]);
  const [hasLoadedTasks, setHasLoadedTasks] = React.useState(false);
  const [totalCost, setTotalCost] = React.useState(0);
  const [summaries, setSummaries] = React.useState<ObraSummary | null>(null);
  const [openSummary, setOpenSummary] = React.useState(false);

  // server-side pagination / filters
  const [filters, setFilters] = React.useState<Partial<TarefaFilterParams>>({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);

  const fetchTasks = React.useCallback(
    async (incomingFilters: Partial<TarefaFilterParams> = {}, page: number) => {
      setIsLoading(true);
      try {
        const params = {
          ...incomingFilters,
          pageSize: PAGE_SIZE,
          page: page,
        };
        const data = await tarefaService.listar(obra.id!, params);
        const summaryData = await summariesService.listar(obra.id!);
        setSummaries(summaryData);
        setFilteredTarefas(Array.isArray(data.items) ? data.items : []);
        setTotalItems(data.totalCount);
        setTotalCost(data.totalCost);
        setCurrentPage(page);
        setHasLoadedTasks(true);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        setFilteredTarefas([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    },
    [obra.id, setTotalItems]
  );

  const handleToggleExpand = async () => {
    // abrir imediatamente e buscar em background para evitar desmontagem/remontagem
    if (!isExpanded && !hasLoadedTasks) {
      setIsExpanded(true);
      // disparar fetch em background sem await para não bloquear UI
      await fetchTasks(filters, currentPage).catch((err) => {
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
      return fetchTasks(f, currentPage);
    },
    [fetchTasks]
  );

  // quando usuário troca página via TaskTable (server-side), refetch
  const handlePageChange = useCallback(
    (page: number) => {
      return fetchTasks(filters, page);
    },
    [fetchTasks, filters]
  );

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
          updatedBy: 'system', //TODO: ajustar usuário
          fkAtividade: task.atividade!.id!,
          fkLocalNivel1: task.localNivel1!.id!,
          fkLocalNivel2: task.localNivel2!.id!,
          fkLocalNivel3: task.localNivel3!.id!,
          fkLocalNivel4: task.localNivel4!.id!,
          fkUnidadeMedida: task.unidadeDeMedida!.id!,
          fkEmpreiteiro: task.empreiteira!.id!,
        };
        await tarefaService.criar(obra.id!, payload);
        await fetchTasks(filters, currentPage);
        setCurrentPage(1);
        setEditTaskId(null);
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
          fkAtividade: task.atividade!.id!,
          fkLocalNivel1: task.localNivel1!.id!,
          fkLocalNivel2: task.localNivel2!.id!,
          fkLocalNivel3: task.localNivel3!.id!,
          fkLocalNivel4: task.localNivel4!.id!,
          fkUnidadeMedida: task.unidadeDeMedida!.id!,
          fkEmpreiteiro: task.empreiteira!.id!,
        };
        await tarefaService.atualizar(tarefaId, payload);
        // recarregar página atual para refletir alterações
        await fetchTasks(filters, currentPage);
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
        await fetchTasks(filters, currentPage);
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 hover:shadow-xl transition-shadow duration-300 mx-auto w-full">
      <HeaderComponent obra={obra} isLoading={isLoading} isExpanded={isExpanded} hasLoadedTasks={hasLoadedTasks} tarefasCount={tarefasCount} onToggle={handleToggleExpand} />
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <SummaryBar
            summaries={summaries}
            totalCost={totalCost}
            filteredTarefas={filteredTarefas}
            openSummary={openSummary}
            setOpenSummary={setOpenSummary}
            formatCurrency={formatCurrency}
            isMeasure={true}
          />

          <ObraFilters tarefas={filteredTarefas} onFilterClick={handleFilterChange} obraId={obra.id!} />

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

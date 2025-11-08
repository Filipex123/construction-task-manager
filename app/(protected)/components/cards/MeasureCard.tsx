import { tarefaService } from '@/app/services/tarefaService';
import { MeasureTarefa, Obra, PAGE_SIZE, Tarefa } from '@/app/types';
import { Building, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { ObraMeasureFilters, TarefaFilterParams } from '../ObraMeasureFilters';
import { MeasureTable } from '../tables/MeasureTable';

interface MeasureCardProps {
  obra: Obra;
  onMeasure?: (taskId: number, measureFields: MeasureTarefa) => Promise<void>;
}

export const MeasureCard: React.FC<MeasureCardProps> = ({ obra, onMeasure }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [filteredTarefas, setFilteredTarefas] = React.useState<Tarefa[]>([]);
  const [hasLoadedTasks, setHasLoadedTasks] = React.useState(false);

  // server-side pagination / filters
  const [filters, setFilters] = React.useState<Partial<TarefaFilterParams>>({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);

  const getTotalValue = () => {
    if (filteredTarefas.length === 0) return 0;
    return filteredTarefas.reduce((total, tarefa) => total + (tarefa.totalAmount ?? 0), 0);
  };

  const fetchTasks = React.useCallback(
    async (incomingFilters: Partial<TarefaFilterParams> = {}, page: number) => {
      setIsLoading(true);
      try {
        // ajustar chamada de acordo com sua tarefaService API
        const params = {
          ...incomingFilters,
          page,
          limit: PAGE_SIZE,
        };
        const data = await tarefaService.listar(obra.id!, params);
        setFilteredTarefas(Array.isArray(data.items) ? data.items : []);
        setTotalItems(data.totalCount);
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

  const handleMeasure = async (taskId: number, measureFields: MeasureTarefa) => {
    if (onMeasure) {
      try {
        setIsLoading(true);
        await onMeasure(taskId, measureFields);
        // após medir, refetch da página atual com filtros atuais
        return fetchTasks(filters, currentPage);
      } catch (error) {
        console.error('Erro ao medir tarefa:', error);
      } finally {
        setIsLoading(false);
      }
    }
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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 hover:shadow-xl transition-shadow duration-300 max-w-7xl mx-auto">
      <HeaderComponent obra={obra} isLoading={isLoading} isExpanded={isExpanded} hasLoadedTasks={hasLoadedTasks} tarefasCount={tarefasCount} onToggle={handleToggleExpand} />
      {/* Expandable Content: manter aberto mesmo durante fetch, mostrar overlay de loading */}
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          {/* Summary */}
          <div className="px-8 py-5 bg-gray-50 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <span className="text-sm text-gray-600">Valor Total:</span>
                <span className="ml-2 text-xl font-bold text-green-600">{formatCurrency(totalValue)}</span>
              </div>
              <div className="flex gap-4 justify-center space-x-4 text-sm text-black">
                <span className="flex flex-col items-center space-y-1">
                  <span className="text-xs">{filteredTarefas.filter((t) => t.measurementStatus.toUpperCase() === 'MEDIDO').length} medido</span>
                  <div className="w-full h-1 bg-green-500 rounded-full" />
                </span>
                <span className="flex flex-col items-center space-y-1">
                  <span className="text-xs">{filteredTarefas.filter((t) => t.measurementStatus.toUpperCase() === 'EM_ANDAMENTO').length} em andamento</span>
                  <div className="w-full h-1 bg-blue-500 rounded-full" />
                </span>
                <span className="flex flex-col items-center space-y-1">
                  <span className="text-xs">{filteredTarefas.filter((t) => t.measurementStatus.toUpperCase() === 'PENDENTE').length} pendente</span>
                  <div className="w-full h-1 bg-yellow-500 rounded-full" />
                </span>
                <span className="flex flex-col items-center space-y-1">
                  <span className="text-xs">{filteredTarefas.filter((t) => t.measurementStatus.toUpperCase() === 'RETIDO').length} retido</span>
                  <div className="w-full h-1 bg-red-500 rounded-full" />
                </span>
              </div>
            </div>
          </div>

          {/* Criar um novo para medicao */}
          <ObraMeasureFilters tarefas={filteredTarefas} onFilterClick={handleFilterChange} />

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
                </div>

                {filteredTarefas.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">Nenhuma tarefa encontrada</div>
                    <p className="text-gray-500">Adicione a primeira tarefa desta obra</p>
                  </div>
                ) : (
                  <MeasureTable tarefas={filteredTarefas} serverSide totalItems={totalItems} currentPage={currentPage} pageSize={PAGE_SIZE} onPageChange={handlePageChange} onMeasure={handleMeasure} />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

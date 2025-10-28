import { tarefaService } from '@/app/services/tarefaService';
import { Obra, PaymentStatusEnum, Tarefa } from '@/app/types';
import { Building, ChevronDown, ChevronUp, DollarSign, Loader2 } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { ObraFilters, TarefaFilterParams } from '../ObraFilters';
import { BatchPaymentModal } from '../modals/BatchPaymentModal';
import { PaymentTable } from '../tables/PaymentTable';

interface PaymentCardProps {
  obra: Obra;
  onPay: (tarefaId: number) => Promise<void>;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ obra, onPay }) => {
  const [isBatchPaymentModalOpen, setIsBatchPaymentModalOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [filteredTarefas, setFilteredTarefas] = React.useState<Tarefa[]>([]);
  const [hasLoadedTasks, setHasLoadedTasks] = React.useState(false);

  // server-side pagination / filters
  const [filters, setFilters] = React.useState<Partial<TarefaFilterParams>>({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [totalItems, setTotalItems] = React.useState(0);

  const filterPayableTasks = useCallback(() => {
    return filteredTarefas.filter((t) => t.paymentStatus !== PaymentStatusEnum.PAGO && t.paymentStatus !== PaymentStatusEnum.EM_ANDAMENTO);
  }, [filteredTarefas]);

  const fetchTasks = React.useCallback(
    async (page = 1, incomingFilters: Partial<TarefaFilterParams> = {}) => {
      setIsLoading(true);
      try {
        const params = {
          page,
          pageSize,
          ...incomingFilters,
        };
        const data = await tarefaService.listar(obra.id!, params);
        setFilteredTarefas(Array.isArray(data.items) ? data.items : []);
        setTotalItems(typeof data.total === 'number' ? data.total : Array.isArray(data.items) ? data.items.length : 0);
        setHasLoadedTasks(true);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        setFilteredTarefas([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    },
    [obra.id, pageSize]
  );

  const handleToggleExpand = async () => {
    // abrir imediatamente e buscar em background para evitar desmontagem/remontagem
    if (!isExpanded && !hasLoadedTasks) {
      setIsExpanded(true);
      // disparar fetch em background sem await para não bloquear UI
      await fetchTasks(1, filters).catch((err) => {
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
      return fetchTasks(1, f);
    },
    [fetchTasks]
  );

  // quando usuário troca página via TaskTable (server-side), refetch
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      return fetchTasks(page, filters);
    },
    [fetchTasks, filters]
  );

  const handleBatchPayment = async () => {
    if (!onPay) return;

    try {
      setIsLoading(true);
      for (const tarefa of filteredTarefas) {
        await onPay(tarefa.id);
        await new Promise((res) => setTimeout(res, 100));
      }
      await fetchTasks(1, filters);
      setCurrentPage(1);
    } catch (err) {
      console.error('Erro ao adicionar tarefa:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = useCallback(
    async (taskId: number) => {
      if (!onPay) return;
      try {
        setIsLoading(true);
        await onPay(taskId);
        await fetchTasks(1, filters);
        setCurrentPage(1);
      } catch (err) {
        console.error('Erro ao adicionar tarefa:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks, filters, onPay]
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

  const handleOpenBatch = useCallback(() => {
    setIsBatchPaymentModalOpen(true);
  }, []);

  // Header extraído para fora do componente para não recriar o tipo em cada render
  type HeaderProps = {
    obra: Obra;
    isLoading: boolean;
    isExpanded: boolean;
    hasLoadedTasks: boolean;
    tarefasCount: number;
    onToggle: () => void;
    onOpenBatch: () => void;
  };

  const HeaderComponent: React.FC<HeaderProps> = React.memo(({ obra, isLoading, isExpanded, hasLoadedTasks, tarefasCount, onToggle, onOpenBatch }) => {
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

              {isExpanded && !isLoading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBatch();
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
    );
  });

  // render
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 hover:shadow-xl transition-shadow duration-300 max-w-7xl mx-auto">
      <HeaderComponent
        obra={obra}
        isLoading={isLoading}
        isExpanded={isExpanded}
        hasLoadedTasks={hasLoadedTasks}
        tarefasCount={tarefasCount}
        onToggle={handleToggleExpand}
        onOpenBatch={handleOpenBatch}
      />
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
                {filteredTarefas.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">Nenhuma tarefa encontrada</div>
                    <p className="text-gray-500">Adicione a primeira tarefa desta obra</p>
                  </div>
                ) : (
                  <PaymentTable tarefas={filteredTarefas} onPay={handlePayment} serverSide totalItems={totalItems} currentPage={currentPage} pageSize={pageSize} onPageChange={handlePageChange} />
                )}
              </>
            )}
          </div>
        </div>
      )}

      <BatchPaymentModal isOpen={isBatchPaymentModalOpen} onClose={() => setIsBatchPaymentModalOpen(false)} onConfirm={handleBatchPayment} tarefas={filterPayableTasks()} />
    </div>
  );
};

import { ChevronLeft, ChevronRight, Grid, List, Ruler } from 'lucide-react';
import React from 'react';
import { StatusColorMedicao, Tarefa } from '../../types';
import { MeasureEntryModal } from './MeasureEntryModal';

interface TaskTableProps {
  tarefas: Tarefa[];
  onEdit: (tarefaId: string) => void;
  onDelete?: (tarefaId: string) => void;
}

type MobileView = 'table' | 'cards' | 'list';

const statusConfig: StatusColorMedicao = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-800',
  MEDIDO: 'bg-green-100 text-green-800',
  RETIDO: 'bg-red-100 text-red-800',
};

const statusLabels = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em Andamento',
  MEDIDO: 'Medido',
  RETIDO: 'Retenção',
};

export const MedidaTable: React.FC<TaskTableProps> = ({ tarefas, onEdit, onDelete }) => {
  const [mobileView, setMobileView] = React.useState<MobileView>('cards');
  const [selectedTask, setSelectedTask] = React.useState<Tarefa | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [taskToPay, setTaskToPay] = React.useState<Tarefa | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  // Detectar se é mobile
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Reset página quando mudar o número de tarefas ou view
  React.useEffect(() => {
    setCurrentPage(1);
  }, [tarefas.length, mobileView]);

  // Configuração de paginação
  const itemsPerPage = isMobile ? 5 : 10;
  const totalPages = Math.ceil(tarefas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTarefas = tarefas.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setTaskToPay(null);
  };

  const handleMeasure = () => {
    setIsOpen(true);
  };

  const ActionButtons = ({ tarefa }: { tarefa: Tarefa }) => (
    <div className="flex space-x-2">
      <button onClick={handleMeasure} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors" title="Editar">
        <Ruler className="w-4 h-4" />
      </button>
    </div>
  );

  const CardView = () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {currentTarefas.map((tarefa) => (
        <div key={tarefa.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleTaskClick(tarefa)}>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 text-sm mb-1">{tarefa.location.name}</h5>
              <p className="text-gray-600 text-sm">{tarefa.activity}</p>
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[tarefa.measurementStatus]}`}>{statusLabels[tarefa.measurementStatus]}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span className="text-gray-500">Quantidade:</span>
              <p className="font-medium text-black">
                {tarefa.quantity} {tarefa.unitOfMeasure}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Valor:</span>
              <p className="font-medium text-green-600">{formatCurrency(tarefa.totalAmount)}</p>
            </div>
          </div>

          <div className="mb-3">
            <span className="text-gray-500 text-sm">Empreiteira:</span>
            <p className="font-medium text-sm text-black">{tarefa.contractor}</p>
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
      {currentTarefas.map((tarefa) => (
        <div key={tarefa.id} className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleTaskClick(tarefa)}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h5 className="font-medium text-gray-900 text-sm">{tarefa.location.name}</h5>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[tarefa.measurementStatus]}`}>{statusLabels[tarefa.measurementStatus]}</span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{tarefa.activity}</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex space-x-4">
              <span className="text-gray-500">
                {tarefa.quantity} {tarefa.unitOfMeasure}
              </span>
              <span className="font-medium text-green-600">{formatCurrency(tarefa.totalAmount)}</span>
            </div>
            <ActionButtons tarefa={tarefa} />
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">{tarefa.contractor}</span>
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
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medir</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentTarefas.map((tarefa) => (
            <tr key={tarefa.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleTaskClick(tarefa)}>
              <td className="px-4 py-4 text-sm text-gray-900">{tarefa.location.name}</td>
              <td className="px-4 py-4 text-sm text-gray-900">{tarefa.activity}</td>
              <td className="px-4 py-4 text-sm text-gray-500">{tarefa.unitOfMeasure}</td>
              <td className="px-4 py-4 text-sm text-gray-900">{tarefa.quantity}</td>
              <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(tarefa.totalAmount)}</td>
              <td className="px-4 py-4 text-sm text-gray-900">{tarefa.contractor}</td>
              <td className="px-4 py-4 text-sm">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[tarefa.measurementStatus]}`}>{statusLabels[tarefa.measurementStatus]}</span>
              </td>
              <td className="px-4 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex space-x-2">
                  <button onClick={handleMeasure} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors" title="Editar">
                    <Ruler className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const maxVisible = isMobile ? 3 : 5;
      const pages = [];

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }

      return pages;
    };

    const visiblePages = getVisiblePages();

    return (
      <div className="flex items-center justify-between mt-6 px-2">
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1}-{Math.min(endIndex, tarefas.length)} de {tarefas.length} tarefas
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

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

      {/* Pagination Controls */}
      <PaginationControls />

      <MeasureEntryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={(data) => {
          /* salvar */
        }}
        initialValues={{ medidaPrevista: 10, medidaRealizada: 5, status: 'pendente' }}
      />
      {/* <TaskDetailModal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} tarefa={selectedTask} /> */}
    </div>
  );
};

import { Local } from '@/app/types';
import { ChevronLeft, ChevronRight, Edit3, Grid, List, Trash2 } from 'lucide-react';
import React from 'react';

interface LocalTableProps {
  locais: Local[];
  onEdit: (localId: number) => void;
  onDelete: (localId: number, nivel: number) => void;
}

type MobileView = 'table' | 'cards' | 'list';

export const LocalTable: React.FC<LocalTableProps> = ({ locais, onEdit, onDelete }) => {
  const [mobileView, setMobileView] = React.useState<MobileView>('cards');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isMobile, setIsMobile] = React.useState(false);

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
  }, [locais.length, mobileView]);

  // Configuração de paginação
  const itemsPerPage = isMobile ? 5 : 10;
  const totalPages = Math.ceil(locais.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLocais = locais.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const ActionButtons = ({ local: local }: { local: Local }) => (
    <div className="flex space-x-2">
      <button onClick={() => onEdit(local.id!)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors" title="Editar">
        <Edit3 className="w-4 h-4" />
      </button>

      <button onClick={() => onDelete(local.id!, local.nivel!)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors" title="Deletar">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  const CardView = () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {currentLocais.map((local) => (
        <div key={local.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 text-sm mb-1">{local.id}</h5>
              <p className="text-gray-600 text-sm">{local.id}</p>
            </div>
            {/* <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[local.statusPagamento]}`}>{statusLabels[local.statusPagamento]}</span> */}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span className="text-gray-500">Nome:</span>
              <p className="font-medium text-black">{local.name}</p>
            </div>
          </div>

          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <ActionButtons local={local} />
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-3">
      {currentLocais.map((local) => (
        <div key={local.id} className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h5 className="font-medium text-gray-900 text-sm">{local.id}</h5>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex space-x-4">
              <span className="text-gray-500">{local.name}</span>
            </div>
            <ActionButtons local={local} />
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
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentLocais.map((local) => (
            <tr key={local.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
              <td className="px-4 py-4 text-sm text-gray-900">{local.id}</td>
              <td className="px-4 py-4 text-sm text-gray-900">{local.name}</td>
              <td className="px-4 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex space-x-2">
                  <button onClick={() => onEdit(local.id!)} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors" title="Editar">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {onDelete && (
                    <button onClick={() => onDelete(local.id!, local.nivel!)} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors" title="Deletar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
          Mostrando {startIndex + 1}-{Math.min(endIndex, locais.length)} de {locais.length} tarefas
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
    </div>
  );
};

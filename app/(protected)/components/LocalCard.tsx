import { Building, ChevronDown, ChevronUp, Loader2, Plus } from 'lucide-react';
import React from 'react';
import { Obra } from '../../types';
import { LocalTable } from './LocalTable';
import { SimpleModal } from './SimpleModal';

interface LocalCardProps {
  obra: Obra;
  onDelete?: (tarefaId: string) => void;
  onAddLocal: (obraId: string, task: any) => void;
  onUpdateLocal: (obraId: string, tarefaId: string, task: any) => void;
  onLoadLocal?: (obraId: string) => Promise<void>;
}

export const LocalCard: React.FC<LocalCardProps> = ({ obra, onDelete, onAddLocal, onUpdateLocal, onLoadLocal }) => {
  const [locais, setLocais] = React.useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editLocalId, setEditLocalId] = React.useState<string | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasLoadedTasks, setHasLoadedTasks] = React.useState(locais.length > 0);

  const handleToggleExpand = async () => {
    if (!isExpanded && !hasLoadedTasks && onLoadLocal) {
      setIsLoading(true);
      try {
        await onLoadLocal(obra.id);
        setHasLoadedTasks(true);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
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
              <h3 className="text-xl font-bold">{obra.name}</h3>
              <p className="text-blue-100 text-sm">{obra.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="font-medium">{obra.tarefas.length} Locais</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          {/* Loading State */}
          {isLoading && (
            <div className="px-6 py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando Locais...</p>
            </div>
          )}

          {/* Content when not loading */}
          {!isLoading && (
            <>
              {/* Tasks Table */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">Locais</h4>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Novo Local</span>
                    <span className="sm:hidden">Novo</span>
                  </button>
                </div>

                {obra.tarefas.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">Nenhum local encontrado</div>
                    <p className="text-gray-500">Adicione o primeiro local desta obra</p>
                  </div>
                ) : (
                  <LocalTable
                    locais={locais}
                    onEdit={(id) => {
                      setEditLocalId(id);
                      setIsAddModalOpen(true);
                    }}
                    onDelete={() => {}}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}

      <SimpleModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditLocalId(null);
        }}
        handleSave={() => {}}
        title={'Local'}
        value={''}
        description={''}
      />
    </div>
  );
};

import { localService } from '@/app/services/localService';
import { Local, Obra } from '@/app/types';
import { Building, ChevronDown, ChevronUp, Edit3, Loader2, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { ConfirmModal } from '../modals/ConfirmModal';
import { SimpleModal } from '../modals/SimpleModal';
import { SearchBar } from '../SearchBar';
import { LocalTable } from '../tables/LocalTable';

interface LocalNivelCardProps {
  obra: Obra;
  onDelete: (obraId: number) => void;
  onUpdate: (obraId: number) => void;
  nivel: number;
}

export const LocalNivelCard: React.FC<LocalNivelCardProps> = ({ obra, onDelete, onUpdate, nivel }) => { 
  const [locais, setLocais] = React.useState<Local[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editLocation, setEditLocation] = React.useState<Local | null>({ name: '', fkObra: obra.id } as Local);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasLoadedTasks, setHasLoadedTasks] = React.useState(locais.length > 0);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredData = React.useMemo(() => {
    return locais.filter((local) => searchTerm === '' || local.name?.toLowerCase().includes(searchTerm.toLowerCase()) || local.id === Number(searchTerm.toLowerCase()));
  }, [locais, searchTerm]);

  const handleToggleExpand = async () => {
    if (!isExpanded && !hasLoadedTasks) {
      setIsLoading(true);
      try {
        const data = await localService.listar(obra.id, nivel);
        setLocais(data.items || []);
        setHasLoadedTasks(true);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const handleSave = async (obraId: number, name: string) => {
    try {
      const data = await localService.criar({ name: name, fkObra: obraId });
      setLocais((prevLocais) => [...prevLocais, data]);
    } catch (error) {
      console.error('Erro ao adicionar local:', error);
    }
  };

  const handleEdit = async (name: string) => {
    if (editLocation) {
      try {
        const data = await localService.atualizar(editLocation.id!, { name: name });
        setLocais((prevLocais) => prevLocais.map((local) => (local.id === data.id ? data : local)));
        setEditLocation(null);
        setIsAddModalOpen(false);
      } catch (error) {
        console.error('Erro ao adicionar local:', error);
      }
    }
  };

  const handleDelete = async (localId: number) => {
    try {
      await localService.excluir(localId);
      setLocais((prevLocais) => prevLocais.filter((local) => local.id !== localId));
    } catch (error) {
      console.error('Erro ao excluir local:', error);
    }
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
          <div className="flex items-center space-x-4 text-sm justify-end">
            <div className="flex items-center space-x-4 ">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(obra.id!);
                }}
                className="p-2 text-gray-200 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmModalOpen(true);
                }}
                className="p-2 text-red-400 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                title="Deletar"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {hasLoadedTasks && (
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="font-medium">{locais.length} Locais</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          {/* Content when not loading */}
          {!isLoading && (
            <>
              {/* Location Table */}
              <div className="p-6">
                <div className="pb-4">
                  <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                </div>
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
                {filteredData.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">Nenhum local encontrado</div>
                    <p className="text-gray-500">Adicione o primeiro local desta obra</p>
                  </div>
                ) : (
                  <LocalTable
                    locais={filteredData}
                    onEdit={(id) => {
                      const locationToEdit = locais.find((local) => local.id === id) || null;
                      setEditLocation(locationToEdit);
                      setIsAddModalOpen(true);
                    }}
                    onDelete={handleDelete}
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
          setEditLocation(null);
        }}
        handleSave={(info) => {
          handleSave(obra.id!, info.value);
        }}
        handleEdit={(info) => {
          handleEdit(info.value);
        }}
        title={'Local'}
        value={editLocation?.name ?? ''}
        valuePlaceholder="Nome do local"
        isEdit={editLocation?.name !== '' && editLocation?.id !== undefined}
      />

      {/*❌ Modal de confirmacao de delecao */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onConfirm={() => {
          onDelete(obra.id!);
          setIsConfirmModalOpen(false);
        }}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};

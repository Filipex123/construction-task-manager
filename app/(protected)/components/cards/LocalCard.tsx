import { localService } from '@/app/services/localService';
import { Local, Obra } from '@/app/types';
import { Building, ChevronDown, ChevronUp, Loader2, Plus } from 'lucide-react';
import React from 'react';
import { ConfirmModal } from '../modals/ConfirmModal';
import { SimpleModal } from '../modals/SimpleModal';
import { SearchBar } from '../SearchBar';
import { LocalTable } from '../tables/LocalTable';

interface LocalCardProps {
  obra: Obra;
  onDelete: (obraId: number) => void;
  onUpdate: (obraId: number) => void;
  nivel: number;
}

export const LocalCard: React.FC<LocalCardProps> = ({ obra, onDelete, onUpdate}) => { 
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
        const data = await localService.listar(obra.id);
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
      const data = await localService.criar({ name: name, fkObra: obraId }, 0); // todo: corrigir esse 0
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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-200" >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <div className="flex items-center space-x-2">
              <Building className="w-6 h-6" />              
            </div>
            <div>
              <h3 className="text-xl font-bold">{obra.name}</h3>
              <p className="text-blue-100 text-sm">{obra.description}</p>
            </div>
          </div>
        </div>
      </div>
 

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

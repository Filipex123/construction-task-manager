'use client';
import { usePageTitle } from '@/app/context/PageTitle.context';
import { obraService } from '@/app/services/obraService';
import { Obra } from '@/app/types';
import { Plus } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Loader } from '../components/Loader';
import { LocalCard } from '../components/LocalCard';
import { SearchBar } from '../components/SearchBar';
import { SimpleModal } from '../components/SimpleModal';

function LocalPage() {
  const { setTitle, setSubtitle, setDescription } = usePageTitle();
  const [searchTerm, setSearchTerm] = useState('');
  const [obras, setObras] = useState<Obra[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editObra, setEditObra] = useState<Obra | null>(null);

  const filteredObras = useMemo(() => {
    return obras.filter((obra) => obra.name!.toLowerCase().includes(searchTerm.toLowerCase()) || obra.description?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, obras]);

  const handleEdit = async (obraId: number, updatedObra: Partial<Obra>) => {
    try {
      const data = await obraService.atualizar(obraId, updatedObra);
      setObras((prevObras) => prevObras.map((obra) => (obra.id === data.id ? data : obra)));
      setEditObra(null);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
    } finally {
      setIsAddModalOpen(false);
      setIsLoading(false);
      setEditObra(null);
    }
  };

  const handleOpenModalAddObra = () => {
    setIsAddModalOpen(true);
    setEditObra(null);
  };

  const onUpdateModal = (obraId: number) => {
    setIsAddModalOpen(true);
    setEditObra(obras.filter((o) => o.id === obraId)[0]);
  };

  const handleDelete = async (obraId?: number) => {
    try {
      await obraService.excluir(obraId!);
      setObras((prevObras) => prevObras.filter((obra) => obra.id !== obraId));
    } catch (error) {
      console.error('Erro ao deletar obra:', error);
    }
  };

  const handleAddObra = async (novaObra: Omit<Obra, 'id'>) => {
    setIsAddModalOpen(true);
    try {
      const data = await obraService.criar(novaObra);
      setObras((prevObras) => [...prevObras, data]);
    } catch (error) {
      console.error('Erro ao adicionar obra:', error);
    } finally {
      setIsAddModalOpen(false);
    }
  };

  React.useEffect(() => {
    setTitle('Cadastro de Obras e Locais');
    setSubtitle('Gerenciar Obras e Locais');
    setDescription('Controle e monitore todas os locais das suas obras');

    const carregarObras = async () => {
      setIsLoading(true);
      try {
        const data = await obraService.listar();
        setObras(data.items || []);
      } catch (error) {
        console.error('Erro ao carregar obras:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarObras();
  }, []);

  return (
    <>
      <div className="mb-6">
        <div>
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
        <br />
        <div className="flex items-center justify-end mb-4">
          <button onClick={handleOpenModalAddObra} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Obra</span>
            <span className="sm:hidden">Nova</span>
          </button>
        </div>
      </div>

      {isLoading && <Loader message={'Carregando Obras'} />}

      {filteredObras.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Nenhuma obra encontrada</div>
          <p className="text-gray-500">{searchTerm ? 'Tente ajustar sua pesquisa' : 'Não há obras cadastradas'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredObras.map((obra) => (
            <LocalCard key={obra.id} obra={obra} onDelete={handleDelete} onUpdate={onUpdateModal} />
          ))}
        </div>
      )}

      {/* Modal para adicionar Obra */}
      <SimpleModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
        }}
        handleSave={(info) => {
          handleAddObra({ name: info.value });
        }}
        handleEdit={(info) => {
          handleEdit(editObra!.id!, { name: info.value });
        }}
        title={'Obra'}
        value={editObra?.name ?? ''}
        valuePlaceholder={`Nome da obra...`}
        isEdit={!!editObra}
      />
    </>
  );
}

export default LocalPage;

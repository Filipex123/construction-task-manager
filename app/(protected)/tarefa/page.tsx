'use client';
import { usePageTitle } from '@/app/context/PageTitle.context';
import { obraService } from '@/app/services/obraService';
import { Obra } from '@/app/types';
import React, { useMemo, useState } from 'react';
import { TarefaCard } from '../components/cards/TarefaCard';
import { Loader } from '../components/Loader';
import { SearchBar } from '../components/SearchBar';

function TarefaPage() {
  const { setTitle, setSubtitle, setDescription } = usePageTitle();

  const [searchTerm, setSearchTerm] = useState('');
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredObras = useMemo(() => {
    return obras.filter((obra) => obra.name?.toLowerCase().includes(searchTerm.toLowerCase()) || obra.description?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, obras]);

  React.useEffect(() => {
    setTitle('Tarefas');
    setSubtitle('Cadastro de tarefas de obras');
    setDescription('Gerencie e monitore todas as tarefas das suas obras em um só lugar.');

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
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      </div>

      {isLoading && <Loader message={'Carregando Obras'} />}

      {!isLoading && filteredObras.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Nenhuma obra encontrada</div>
          <p className="text-gray-500">{searchTerm ? 'Tente ajustar sua pesquisa' : 'Não há obras cadastradas'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredObras.map((obra) => (
            <TarefaCard key={obra.id} obra={obra} />
          ))}
        </div>
      )}
    </>
  );
}

export default TarefaPage;

'use client';
import { usePageTitle } from '@/app/context/PageTitle.context';
import { obraService } from '@/app/services/obraService';
import { tarefaService } from '@/app/services/tarefaService';
import React, { useMemo, useState } from 'react';
import { MeasureTarefa, Obra } from '../../types';
import { SearchBar } from '.././components/SearchBar';
import { Loader } from '../components/Loader';
import { MeasureCard } from '../components/cards/MeasureCard';

function Medicao() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { setTitle, setSubtitle, setDescription } = usePageTitle();

  const filteredObras = useMemo(() => {
    return obras.filter((obra) => obra.name?.toLowerCase().includes(searchTerm.toLowerCase()) || obra.description?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, obras]);

  const handleMeasure = async (taskId: number, measureFields: MeasureTarefa) => {
    try {
      await tarefaService.medir(taskId, measureFields);
      console.log(`Processando medicao para a tarefa com ID: ${taskId}`);
    } catch (error) {
      console.error('Erro ao processar o medicao:', error);
    }
  };

  React.useEffect(() => {
    setTitle('Medição');
    setSubtitle('Gerenciar Medição');
    setDescription('Controle e monitore todas as atividades das suas obras');

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
            <MeasureCard key={obra.id} obra={obra} onMeasure={handleMeasure} />
          ))}
        </div>
      )}
    </>
  );
}

export default Medicao;

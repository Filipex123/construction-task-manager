'use client';
import React, { useMemo, useState } from 'react';
import { usePageTitle } from '../context/PageTitle.context';
import { obraService } from '../services/obraService';
import { tarefaService } from '../services/tarefaService';
import { Obra } from '../types';
import { PaymentCard } from './components/cards/PaymentCard';
import { DashboardSummary } from './components/DashboardSumary';
import { Loader } from './components/Loader';
import { SearchBar } from './components/SearchBar';

function Home() {
  const { setTitle, setSubtitle, setDescription } = usePageTitle();

  const [searchTerm, setSearchTerm] = useState('');
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredObras = useMemo(() => {
    return obras.filter((obra) => obra.name?.toLowerCase().includes(searchTerm.toLowerCase()) || obra.description?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, obras]);

  const handlePay = async (tarefaId: number) => {
    try {
      await tarefaService.pagar(tarefaId);
    } catch (error) {
      console.error('Erro ao processar o pagamento:', error);
    }
  };

  React.useEffect(() => {
    setTitle('Pagamento');
    setSubtitle('Controle de Obras');
    setDescription('Gerencie e monitore todas as atividades das suas obras em um só lugar.');

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

  if (localStorage.getItem('isAdmin') !== 'true') {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">Acesso Negado</div>
        <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <>
      <DashboardSummary />
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
            <PaymentCard key={obra.id} obra={obra} onPay={handlePay} />
          ))}
        </div>
      )}
    </>
  );
}

export default Home;

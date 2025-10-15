'use client';
import React, { useMemo, useState } from 'react';
import { usePageTitle } from '../context/PageTitle.context';
import { obraService } from '../services/obraService';
import { Obra, Tarefa } from '../types';
import { ObraCard } from './components/ConstructionCard';
import { SearchBar } from './components/SearchBar';

function Home() {
  const { setTitle, setSubtitle, setDescription } = usePageTitle();

  const [searchTerm, setSearchTerm] = useState('');
  const [obras, setObras] = useState<Obra[]>([]);

  const filteredObras = useMemo(() => {
    return obras.filter((obra) => obra.name!.toLowerCase().includes(searchTerm.toLowerCase()) || obra.description!.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, obras]);

  const handleEdit = (obraId: number, tarefaId: number, updated: Omit<Tarefa, 'id'>) => {
    setObras((prevObras) =>
      prevObras.map((obra) => {
        if (obra.id !== obraId) return obra;
        return {
          ...obra,
          tarefas: obra.tarefas.map((t) => (t.id === tarefaId ? { ...t, ...updated } : t)),
        };
      })
    );
  };

  const handleDelete = (tarefaId: number) => {
    setObras((prevObras) =>
      prevObras.map((obra) => ({
        ...obra,
        tarefas: obra.tarefas.filter((tarefa) => tarefa.id !== tarefaId),
      }))
    );
  };

  const handlePay = (tarefaId: number) => {
    setObras((prev) =>
      prev.map((obra) => ({
        ...obra,
        tarefas: obra.tarefas.map((t) => (t.id === tarefaId ? { ...t, paymentStatus: 'pago' } : t)),
      }))
    );
  };

  const handleAddTask = (obraId: number, newTask: Omit<Tarefa, 'id'>) => {
    setObras((prevObras) =>
      prevObras.map((obra) => {
        if (obra.id === obraId) {
          const taskId = `${obraId}-${Date.now()}`;
          const taskWithId: Tarefa = { ...newTask, id: taskId };
          return {
            ...obra,
            tarefas: [...obra.tarefas, taskWithId],
          };
        }
        return obra;
      })
    );
  };

  React.useEffect(() => {
    setTitle('Pagamento');
    setSubtitle('Controle de Obras');
    setDescription('Gerencie e monitore todas as atividades das suas obras em um só lugar.');

    const carregarObras = async () => {
      try {
        const data = await obraService.listar();
        console.log('Obras carregadas:', data);
        setObras(data.items || []);
      } catch (error) {
        console.error('Erro ao carregar obras:', error);
      }
    };

    carregarObras();
  }, []);

  return (
    <>
      {/* <DashboardSummary obras={obras} /> */}

      <div className="mb-6">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      </div>

      {filteredObras.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Nenhuma obra encontrada</div>
          <p className="text-gray-500">{searchTerm ? 'Tente ajustar sua pesquisa' : 'Não há obras cadastradas'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredObras.map((obra) => (
            <ObraCard key={obra.id} obra={obra} onUpdateTask={handleEdit} onDelete={handleDelete} onPay={handlePay} onAddTask={handleAddTask} />
          ))}
        </div>
      )}
    </>
  );
}

export default Home;

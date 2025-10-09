'use client';
import { usePageTitle } from '@/app/context/PageTitle.context';
import { mockObras as initialMockObras } from '@/app/mockData';
import { Obra, Tarefa } from '@/app/types';
import React, { useMemo, useState } from 'react';
import { ObraCard } from '../components/ConstructionCard';
import { SearchBar } from '../components/SearchBar';

function TarefaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [obras, setObras] = useState<Obra[]>(initialMockObras);
  const { setTitle, setSubtitle, setDescription } = usePageTitle();

  const filteredObras = useMemo(() => {
    return obras.filter((obra) => obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) || obra.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, obras]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleEdit = (obraId: string, tarefaId: string, updated: Omit<Tarefa, 'id'>) => {
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

  const handleDelete = (tarefaId: string) => {
    setObras((prevObras) =>
      prevObras.map((obra) => ({
        ...obra,
        tarefas: obra.tarefas.filter((tarefa) => tarefa.id !== tarefaId),
      }))
    );
  };

  const handlePay = (tarefaId: string) => {
    setObras((prev) =>
      prev.map((obra) => ({
        ...obra,
        tarefas: obra.tarefas.map((t) => (t.id === tarefaId ? { ...t, statusPagamento: 'pago' } : t)),
      }))
    );
  };

  const handleAddTask = (obraId: string, newTask: Omit<Tarefa, 'id'>) => {
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

  const handleLoadTasks = async (obraId: string) => {
    // Simula chamada para o backend
    console.log('Carregando tarefas para obra:', obraId);

    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Aqui você faria a chamada real para o backend:
    // const response = await fetch(`/api/obras/${obraId}/tarefas`);
    // const tarefas = await response.json();
    //
    // setObras(prevObras =>
    //   prevObras.map(obra =>
    //     obra.id === obraId ? { ...obra, tarefas } : obra
    //   )
    // );

    console.log('Tarefas carregadas com sucesso');
  };

  React.useEffect(() => {
    setTitle('Cadastro de Tarefas');
    setSubtitle('Gerenciar Tarefas');
    setDescription('Controle e monitore todas as tarefas das suas obras');
  }, []);

  return (
    <>
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
            <ObraCard key={obra.id} obra={obra} onUpdateTask={handleEdit} onAddTask={handleAddTask} />
          ))}
        </div>
      )}
    </>
  );
}

export default TarefaPage;

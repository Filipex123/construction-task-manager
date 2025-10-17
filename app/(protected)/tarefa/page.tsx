'use client';
import { usePageTitle } from '@/app/context/PageTitle.context';
import { mockObras as initialMockObras } from '@/app/mockData';
import { Obra, Tarefa } from '@/app/types';
import React, { useMemo, useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { TarefaCard } from '../components/TarefaCard';

function TarefaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [obras, setObras] = useState<Obra[]>(initialMockObras);
  const { setTitle, setSubtitle, setDescription } = usePageTitle();

  const filteredObras = useMemo(() => {
    return obras.filter((obra) => obra.name.toLowerCase().includes(searchTerm.toLowerCase()) || obra.description.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, obras]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
          // const taskWithId: Tarefa = { ...newTask };
          return {
            ...obra,
            tarefas: [...obra.tarefas, newTask as Tarefa],
          };
        }
        return obra;
      })
    );
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
            <TarefaCard key={obra.id} obraId={obra.id} onUpdateTask={handleEdit} onAddTask={handleAddTask} />
          ))}
        </div>
      )}
    </>
  );
}

export default TarefaPage;

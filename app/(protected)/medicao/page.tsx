'use client';
import { usePageTitle } from '@/app/context/PageTitle.context';
import React, { useMemo, useState } from 'react';
import { mockObras as initialMockObras } from '../../mockData';
import { Obra, Tarefa } from '../../types';
import { SearchBar } from '.././components/SearchBar';
import { MedidaCard } from '../components/MeasureCard';

function Medicao() {
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

  ///Revisar logica deve realizar a medição dos campos filtrados
  const handlePay = (tarefaId: string) => {
    setObras((prev) =>
      prev.map((obra) => ({
        ...obra,
        tarefas: obra.tarefas.map((t) => (t.id === tarefaId ? { ...t, statusPagamento: 'pago' } : t)),
      }))
    );
  };

  React.useEffect(() => {
    setTitle('Medição');
    setSubtitle('Gerenciar Medição');
    setDescription('Controle e monitore todas as atividades das suas obras');
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
            <MedidaCard key={obra.id} obra={obra} onUpdateTask={handleEdit} onPay={handlePay} />
          ))}
        </div>
      )}
    </>
  );
}

export default Medicao;

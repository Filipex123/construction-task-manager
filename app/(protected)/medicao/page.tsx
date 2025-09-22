'use client';
import React, { useState, useMemo } from 'react';
import { Sidebar } from '.././components/Sidebar';
import { Header } from '.././components/Header';
import { SearchBar } from '.././components/SearchBar';
import { mockObras as initialMockObras } from '../../mockData';
import { Obra, Tarefa } from '../../types';
import { ObraCard } from '.././components/ConstructionCard';
import { MedidaCard } from '../components/MedidaCard';

function Medicao() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [obras, setObras] = useState<Obra[]>(initialMockObras);

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} userName="Lucas Carvalho Barros" userEmail="lucas.carvalho.barros@hotmail.com" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header toggleSidebar={handleToggleSidebar} title="Medição" />

          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Medição</h2>
                <p className="text-gray-600">Controle e monitore todas as atividades das suas obras</p>
              </div>

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
                    <MedidaCard key={obra.id} obra={obra} onUpdateTask={handleEdit} />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Medicao;

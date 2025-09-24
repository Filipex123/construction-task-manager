'use client';
import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { mockObras as initialMockObras } from '@/app/mockData';
import { Obra, Tarefa } from '@/app/types';
import { LocalCard } from '../components/LocalCard';

function LocalPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [obras, setObras] = useState<Obra[]>(initialMockObras);
   const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} userName="Lucas Carvalho Barros" userEmail="lucas.carvalho.barros@hotmail.com" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header toggleSidebar={handleToggleSidebar} title={'Controle de Obras e Locais'} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Obras e Locais</h2>
                <p className="text-gray-600">Controle e monitore todas os locais das suas obras</p>
              </div>

              {/* <DashboardSummary obras={obras} /> */}

              <div className="mb-6">
                <div>
                  <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                </div>
                <br />
                <div className="flex items-center justify-end mb-4">                  
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Novo Obra</span>
                    <span className="sm:hidden">Novo</span>
                  </button>
                </div>                
              </div>

              {filteredObras.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">Nenhuma obra encontrada</div>
                  <p className="text-gray-500">{searchTerm ? 'Tente ajustar sua pesquisa' : 'Não há obras cadastradas'}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredObras.map((obra) => (
                    <LocalCard
                      key={obra.id}
                      obra={obra}
                      onAddLocal={function (obraId: string, task: any): void {
                        throw new Error('Function not implemented.');
                      }}
                      onUpdateLocal={function (obraId: string, tarefaId: string, task: any): void {
                        throw new Error('Function not implemented.');
                      }}
                    />
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

export default LocalPage;

'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sidebar } from '.././components/Sidebar';
import { Header } from '.././components/Header';

interface UnitMeasurement {
  id: number;
  descricao: string;
  complemento: string;
  createdAt: string;
}

const UnitMeasurement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<UnitMeasurement | null>(null);
  const [formData, setFormData] = useState({ descricao: '', complemento: '' });
  const [errors, setErrors] = useState({ descricao: '', complemento: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Dados simulados
  const [units, setUnits] = useState<UnitMeasurement[]>([
    {
      id: 1,
      descricao: 'Metro Quadrado',
      complemento: 'm²',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      descricao: 'Metro Cúbico',
      complemento: 'm³',
      createdAt: '2024-01-16'
    },
    {
      id: 3,
      descricao: 'Quilograma',
      complemento: 'kg',
      createdAt: '2024-01-17'
    },
    {
      id: 4,
      descricao: 'Quilômetro',
      complemento: 'km',
      createdAt: '2024-01-18'
    },
    {
      id: 5,
      descricao: 'Metro Linear',
      complemento: 'm',
      createdAt: '2024-01-19'
    },
    {
      id: 6,
      descricao: 'Litro',
      complemento: 'l',
      createdAt: '2024-01-20'
    },
    {
      id: 7,
      descricao: 'Unidade',
      complemento: 'un',
      createdAt: '2024-01-21'
    },
    {
      id: 8,
      descricao: 'Tonelada',
      complemento: 't',
      createdAt: '2024-01-22'
    }
  ]);

  // Filtrar dados
  const filteredData = useMemo(() => {
    return units.filter(unit => 
      searchTerm === '' || 
      unit.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.complemento.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [units, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const validateForm = () => {
    const newErrors = { descricao: '', complemento: '' };
    
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }
    
    if (!formData.complemento.trim()) {
      newErrors.complemento = 'Complemento é obrigatório';
    }
    
    // Verificar se já existe uma unidade com a mesma descrição ou complemento
    const existingUnit = units.find(unit => 
      unit.id !== editingItem?.id && 
      (unit.descricao.toLowerCase() === formData.descricao.toLowerCase() ||
       unit.complemento.toLowerCase() === formData.complemento.toLowerCase())
    );
    
    if (existingUnit) {
      if (existingUnit.descricao.toLowerCase() === formData.descricao.toLowerCase()) {
        newErrors.descricao = 'Já existe uma unidade com esta descrição';
      }
      if (existingUnit.complemento.toLowerCase() === formData.complemento.toLowerCase()) {
        newErrors.complemento = 'Já existe uma unidade com este complemento';
      }
    }
    
    setErrors(newErrors);
    return !newErrors.descricao && !newErrors.complemento;
  };

  const handleOpenModal = (unit?: UnitMeasurement) => {
    if (unit) {
      setEditingItem(unit);
      setFormData({ descricao: unit.descricao, complemento: unit.complemento });
    } else {
      setEditingItem(null);
      setFormData({ descricao: '', complemento: '' });
    }
    setErrors({ descricao: '', complemento: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ descricao: '', complemento: '' });
    setErrors({ descricao: '', complemento: '' });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editingItem) {
      // Editar
      setUnits(prev => prev.map(unit => 
        unit.id === editingItem.id 
          ? { ...unit, descricao: formData.descricao, complemento: formData.complemento }
          : unit
      ));
    } else {
      // Criar novo
      const newUnit: UnitMeasurement = {
        id: Math.max(...units.map(u => u.id)) + 1,
        descricao: formData.descricao,
        complemento: formData.complemento,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUnits(prev => [...prev, newUnit]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade de medida?')) {
      setUnits(prev => prev.filter(unit => unit.id !== id));
      
      // Ajustar página atual se necessário
      const newFilteredData = units.filter(unit => unit.id !== id).filter(unit => 
        searchTerm === '' || 
        unit.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.complemento.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const newTotalPages = Math.ceil(newFilteredData.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (

    <div className="min-h-screen bg-gray-100">
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} userName="Lucas Carvalho Barros"  userEmail="lucas.carvalho.barros@hotmail.com" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Unidades de Medida</h2>
              <p className="text-gray-600">Cadastro e Controle das Unidades de Medida</p>
            </div>
            <div className="space-y-6">
      <div className="flex items-center justify-between">       
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Unidade
        </button>
      </div>

      {/* Filtro de Busca */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por descrição ou complemento..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complemento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Criação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.descricao}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{unit.complemento}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(unit.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(unit)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> de{' '}
                <span className="font-medium">{filteredData.length}</span> resultados
              </p>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-4 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
              </select>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Editar Unidade de Medida' : 'Nova Unidade de Medida'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <input
                  id="descricao"
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.descricao ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Metro Quadrado"
                />
                {errors.descricao && <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>}
              </div>

              <div>
                <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento *
                </label>
                <input
                  id="complemento"
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.complemento ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: m²"
                />
                {errors.complemento && <p className="mt-1 text-sm text-red-600">{errors.complemento}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingItem ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
          
          </div>
        </main>
      </div>
    </div>
  </div>

   
  );
};

export default UnitMeasurement;
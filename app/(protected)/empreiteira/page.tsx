'use client';

import { usePageTitle } from '@/app/context/PageTitle.context';
import { mockContractors } from '@/app/mockData';
import { Empreiteira } from '@/app/types';
import { ChevronLeft, ChevronRight, Edit, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { SearchBar } from '../components/SearchBar';

const EmpreiteiraPage: React.FC = () => {
  const { setTitle, setSubtitle, setDescription } = usePageTitle();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Empreiteira | null>(null);
  const [formData, setFormData] = useState({ descricao: '', nome: '' });
  const [errors, setErrors] = useState({ descricao: '', nome: '' });
  const [contractors, setContractors] = useState<Empreiteira[]>(mockContractors);

  // Filtrar dados
  const filteredData = useMemo(() => {
    return contractors.filter(
      (mockcontractor) => searchTerm === '' || mockcontractor.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || mockcontractor.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contractors, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const validateForm = () => {
    const newErrors = { descricao: '', nome: '' };

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    // Verificar se já existe uma unidade com a mesma descrição ou complemento
    const existingUnit = contractors.find(
      (unit) => unit.id !== editingItem?.id && (unit.descricao.toLowerCase() === formData.descricao.toLowerCase() || unit.nome.toLowerCase() === formData.nome.toLowerCase())
    );

    if (existingUnit) {
      if (existingUnit.descricao.toLowerCase() === formData.descricao.toLowerCase()) {
        newErrors.descricao = 'Já existe uma unidade com esta descrição';
      }
      if (existingUnit.nome.toLowerCase() === formData.nome.toLowerCase()) {
        newErrors.nome = 'Já existe uma unidade com este nome';
      }
    }

    setErrors(newErrors);
    return !newErrors.descricao && !newErrors.nome;
  };

  const handleOpenModal = (unit?: Empreiteira) => {
    if (unit) {
      setEditingItem(unit);
      setFormData({ descricao: unit.descricao, nome: unit.nome });
    } else {
      setEditingItem(null);
      setFormData({ descricao: '', nome: '' });
    }
    setErrors({ descricao: '', nome: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ descricao: '', nome: '' });
    setErrors({ descricao: '', nome: '' });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editingItem) {
      // Editar
      setContractors((prev) => prev.map((unit) => (unit.id === editingItem.id ? { ...unit, descricao: formData.descricao, nome: formData.nome } : unit)));
    } else {
      // Criar novo
      const newUnit: Empreiteira = {
        id: Math.max(...contractors.map((u) => u.id)) + 1,
        descricao: formData.descricao,
        nome: formData.nome,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setContractors((prev) => [...prev, newUnit]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade de medida?')) {
      setContractors((prev) => prev.filter((unit) => unit.id !== id));

      // Ajustar página atual se necessário
      const newFilteredData = contractors
        .filter((unit) => unit.id !== id)
        .filter((unit) => searchTerm === '' || unit.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || unit.nome.toLowerCase().includes(searchTerm.toLowerCase()));
      const newTotalPages = Math.ceil(newFilteredData.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  React.useEffect(() => {
    setTitle('Cadastro de Empreiteiras');
    setSubtitle('Empreiteiras');
    setDescription('Cadastro e Controle das Empreiteiras parceiras');
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Nova Empreiteira
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Criação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">{unit.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.descricao}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(unit.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button onClick={() => handleOpenModal(unit)} className="text-blue-600 hover:text-blue-900 transition-colors p-1 hover:bg-blue-50 rounded" title="Editar">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(unit.id)} className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded" title="Excluir">
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
                Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> de{' '}
                <span className="font-medium">{filteredData.length}</span> resultados
              </p>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-gray-600 ml-4 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        currentPage === page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
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
              <h2 className="text-xl font-semibold text-gray-900">{editingItem ? 'Editar Empreiteira' : 'Nova Empreiteira'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                  className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
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
                  value={formData.nome}
                  onChange={(e) => setFormData((prev) => ({ ...prev, complemento: e.target.value }))}
                  className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.nome ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: m²"
                />
                {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <Save className="h-4 w-4 mr-2" />
                {editingItem ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpreiteiraPage;

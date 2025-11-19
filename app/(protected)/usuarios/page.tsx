'use client';

import { usePageTitle } from '@/app/context/PageTitle.context';
import { usuariosService } from '@/app/services/usuariosService';
import { Login } from '@/app/types';
import { ChevronLeft, ChevronRight, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Loader } from '../components/Loader';
import { SearchBar } from '../components/SearchBar';
import { ConfirmModal } from '../components/modals/ConfirmModal';

const UsuariosPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Login | null>(null);
  const [formData, setFormData] = useState({ login: '', senha: '', nome: '', isAdmin: false });
  const [errors, setErrors] = useState({ login: '', senha: '', nome: '', isAdmin: false });
  const { setTitle, setSubtitle, setDescription } = usePageTitle();
  const [units, setUnits] = useState<Login[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedItemDelete, setSelectedItemDelete] = useState<number | null>(null);

  // Filtrar dados
  const filteredData = useMemo(() => {
    return units.filter((unit) => {
      return (
        searchTerm === '' || unit.login?.toLowerCase().includes(searchTerm.toLowerCase()) || unit.name?.toLowerCase().includes(searchTerm.toLowerCase()) || unit.id === Number(searchTerm.toLowerCase())
      );
    });
  }, [units, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const validateForm = () => {
    const newErrors = { login: '', senha: '', nome: '', isAdmin: false };

    if (!formData.login.trim()) {
      newErrors.login = 'Descrição é obrigatória';
    }

    if (!formData.nome.trim()) {
      newErrors.nome = 'Complemento é obrigatório';
    }

    // Verificar se já existe uma usuarios com a mesma descrição ou complemento
    const existingUnit = units.find((unit) => unit.id !== editingItem?.id && (unit.login?.toLowerCase() === formData.login.toLowerCase() || unit.name?.toLowerCase() === formData.nome.toLowerCase()));

    if (existingUnit) {
      if (existingUnit.login?.toLowerCase() === formData.login.toLowerCase()) {
        newErrors.login = 'Já existe uma login com esta descrição';
      }
    }

    setErrors(newErrors);
    return !newErrors.login && !newErrors.nome;
  };

  const handleOpenModal = (unit?: Login) => {
    if (unit) {
      setEditingItem(unit);
      setFormData({ nome: unit.name || '', login: unit.login || '', senha: unit.password || '', isAdmin: unit.isAdmin || false });
    } else {
      setEditingItem(null);
      setFormData({ login: '', senha: '', nome: '', isAdmin: false });
    }
    setErrors({ login: '', senha: '', nome: '', isAdmin: false });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ login: '', senha: '', nome: '', isAdmin: false });
    setErrors({ login: '', senha: '', nome: '', isAdmin: false });
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (editingItem) {
        await usuariosService.atualizar(editingItem.id!, {
          name: formData.nome,
          login: formData.login,
          password: formData.senha,
          isAdmin: formData.isAdmin,
        });
      } else {
        await usuariosService.criar({
          name: formData.nome,
          login: formData.login,
          password: formData.senha,
          isAdmin: formData.isAdmin,
        });
      }

      const data = await usuariosService.listar();
      setUnits(data);
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar usuarios.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number | null) => {
    if (id) {
      try {
        setIsLoading(true);
        await usuariosService.excluir(id);
        const data = await usuariosService.listar();
        setUnits(data);
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir usuarios.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  React.useEffect(() => {
    setTitle('Cadastro de Usuarios');
    setSubtitle('Usuarios');
    setDescription('Cadastro e Controle de Usuarios');

    const carregar = async () => {
      setIsLoading(true);
      try {
        const data = await usuariosService.listar();
        setUnits(data);
      } catch (error) {
        console.error(error);
        alert('Erro ao carregar usuarios.');
      } finally {
        setIsLoading(false);
      }
    };

    carregar();
  }, []);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
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
            {isLoading ? (
              <Loader message={'Carregando Usuarios...'} />
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complemento</th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.id}</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{unit.name}</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedItemDelete(Number(unit.id));
                              setIsConfirmModalOpen(true);
                            }}
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
            )}
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
                <h2 className="text-xl font-semibold text-gray-900">{editingItem ? 'Editar usuario' : 'Novo Usuario'}</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2">
                    Login *
                  </label>
                  <input
                    id="login"
                    type="text"
                    value={formData.login}
                    onChange={(e) => setFormData((prev) => ({ ...prev, login: e.target.value }))}
                    className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.login ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Metro Quadrado"
                  />
                  {errors.login && <p className="mt-1 text-sm text-red-600">{errors.login}</p>}
                </div>

                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <input
                    id="senha"
                    type="text"
                    value={formData.senha}
                    onChange={(e) => setFormData((prev) => ({ ...prev, senha: e.target.value }))}
                    className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.senha ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: m²"
                  />
                  {errors.senha && <p className="mt-1 text-sm text-red-600">{errors.senha}</p>}
                </div>
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                    className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.nome ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: m²"
                  />
                  {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
                </div>
                <div>
                  <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 mb-2">
                    Admin *
                  </label>

                  <div className="relative inline-block w-11 h-5">
                    <input
                      checked={formData.isAdmin}
                      onChange={() => setFormData((prev) => ({ ...prev, isAdmin: !prev.isAdmin }))}
                      id="switch-component"
                      type="checkbox"
                      className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-slate-800 cursor-pointer transition-colors duration-300"
                    />
                    <label className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer"></label>
                  </div>
                  {/* <input
                    id="complemento"
                    type="checkbox"                    
                    checked={formData.isAdmin}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isAdmin: e.target.checked }))
                    }
                    className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.isAdmin ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: m²"
                  /> */}
                  {errors.isAdmin && <p className="mt-1 text-sm text-red-600">{errors.isAdmin}</p>}
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

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onConfirm={() => {
          handleDelete(selectedItemDelete);
          setIsConfirmModalOpen(false);
        }}
        onCancel={() => setIsConfirmModalOpen(false)}
        title={'Excluir usuarios de medida'}
      />
    </>
  );
};

export default UsuariosPage;

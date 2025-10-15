import { ChevronDown, ChevronUp, Filter, Plus, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import { Tarefa } from '../../types';

interface ObraMeasureFilterProps {
  tarefas: Tarefa[];
  onFilterChange: (filteredTarefas: Tarefa[]) => void;
}

export const ObraMeasureFilter: React.FC<ObraMeasureFilterProps> = ({ tarefas, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedLocais, setSelectedLocais] = useState<string[]>([]);
  const [selectedEmpreiteiras, setSelectedEmpreiteiras] = useState<string[]>([]);
  const [selectedAtividades, setSelectedAtividades] = useState<string[]>([]);
  const [localInput, setLocalInput] = useState('');
  const [empreiteiraInput, setEmpreiteiraInput] = useState('');
  const [atividadeInput, setAtividadeInput] = useState('');

  // Extrair valores únicos
  const uniqueStatus = Array.from(new Set(tarefas.map((t) => t.measurementStatus)));
  const uniqueLocais = Array.from(new Set(tarefas.map((t) => t.location.name))).sort();
  const uniqueEmpreiteiras = Array.from(new Set(tarefas.map((t) => t.contractor))).sort();
  const uniqueAtividades = Array.from(new Set(tarefas.map((t) => t.activity))).sort();

  const statusLabels = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    medido: 'Medido',
    retencao: 'Retenção',
  };

  const statusColors = {
    pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    em_andamento: 'bg-blue-100 text-blue-800 border-blue-200',
    medido: 'bg-green-100 text-green-800 border-green-200',
    retencao: 'bg-red-100 text-red-800 border-red-200',
  };

  // Função para busca incremental por múltiplas palavras
  const matchesIncrementalSearch = (text: string, searchTerm: string): boolean => {
    if (!searchTerm.trim()) return true;

    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    const targetText = text.toLowerCase();

    return searchWords.every((word) => targetText.includes(word));
  };

  // Função para verificar se um item corresponde a qualquer filtro selecionado
  const matchesAnyFilter = (text: string, selectedFilters: string[]): boolean => {
    if (selectedFilters.length === 0) return true;
    return selectedFilters.some((filter) => matchesIncrementalSearch(text, filter));
  };

  const applyFilters = (status: string[], locais: string[], empreiteiras: string[], atividades: string[]) => {
    let filtered = tarefas;

    if (status.length > 0) {
      filtered = filtered.filter((t) => status.includes(t.measurementStatus));
    }

    if (locais.length > 0) {
      filtered = filtered.filter((t) => matchesAnyFilter(t.location.name, locais));
    }

    if (empreiteiras.length > 0) {
      filtered = filtered.filter((t) => matchesAnyFilter(t.contractor, empreiteiras));
    }

    if (atividades.length > 0) {
      filtered = filtered.filter((t) => matchesAnyFilter(t.activity, atividades));
    }

    onFilterChange(filtered);
  };

  const handleStatusToggle = (status: string) => {
    const newSelected = selectedStatus.includes(status) ? selectedStatus.filter((s) => s !== status) : [...selectedStatus, status];

    setSelectedStatus(newSelected);
    applyFilters(newSelected, selectedLocais, selectedEmpreiteiras, selectedAtividades);
  };

  const addLocalFilter = (value: string) => {
    if (value.trim() && !selectedLocais.includes(value.trim())) {
      const newSelected = [...selectedLocais, value.trim()];
      setSelectedLocais(newSelected);
      setLocalInput('');
      applyFilters(selectedStatus, newSelected, selectedEmpreiteiras, selectedAtividades);
    }
  };

  const removeLocalFilter = (value: string) => {
    const newSelected = selectedLocais.filter((item) => item !== value);
    setSelectedLocais(newSelected);
    applyFilters(selectedStatus, newSelected, selectedEmpreiteiras, selectedAtividades);
  };

  const addEmpreiteiraFilter = (value: string) => {
    if (value.trim() && !selectedEmpreiteiras.includes(value.trim())) {
      const newSelected = [...selectedEmpreiteiras, value.trim()];
      setSelectedEmpreiteiras(newSelected);
      setEmpreiteiraInput('');
      applyFilters(selectedStatus, selectedLocais, newSelected, selectedAtividades);
    }
  };

  const removeEmpreiteiraFilter = (value: string) => {
    const newSelected = selectedEmpreiteiras.filter((item) => item !== value);
    setSelectedEmpreiteiras(newSelected);
    applyFilters(selectedStatus, selectedLocais, newSelected, selectedAtividades);
  };

  const addAtividadeFilter = (value: string) => {
    if (value.trim() && !selectedAtividades.includes(value.trim())) {
      const newSelected = [...selectedAtividades, value.trim()];
      setSelectedAtividades(newSelected);
      setAtividadeInput('');
      applyFilters(selectedStatus, selectedLocais, selectedEmpreiteiras, newSelected);
    }
  };

  const removeAtividadeFilter = (value: string) => {
    const newSelected = selectedAtividades.filter((item) => item !== value);
    setSelectedAtividades(newSelected);
    applyFilters(selectedStatus, selectedLocais, selectedEmpreiteiras, newSelected);
  };

  const clearAllFilters = () => {
    setSelectedStatus([]);
    setSelectedLocais([]);
    setSelectedEmpreiteiras([]);
    setSelectedAtividades([]);
    setLocalInput('');
    setEmpreiteiraInput('');
    setAtividadeInput('');
    onFilterChange(tarefas);
  };

  const hasActiveFilters = selectedStatus.length > 0 || selectedLocais.length > 0 || selectedEmpreiteiras.length > 0 || selectedAtividades.length > 0;
  const activeFiltersCount = selectedStatus.length + selectedLocais.length + selectedEmpreiteiras.length + selectedAtividades.length;

  // Filtrar sugestões baseadas no texto digitado
  const getFilteredLocais = () => {
    if (!localInput.trim()) return uniqueLocais.slice(0, 5);
    return uniqueLocais.filter((local) => matchesIncrementalSearch(local, localInput) && !selectedLocais.includes(local)).slice(0, 5);
  };

  const getFilteredEmpreiteiras = () => {
    if (!empreiteiraInput.trim()) return uniqueEmpreiteiras.slice(0, 5);
    return uniqueEmpreiteiras.filter((emp) => matchesIncrementalSearch(emp, empreiteiraInput) && !selectedEmpreiteiras.includes(emp)).slice(0, 5);
  };

  const getFilteredAtividades = () => {
    if (!atividadeInput.trim()) return uniqueAtividades.slice(0, 5);
    return uniqueAtividades.filter((ativ) => matchesIncrementalSearch(ativ, atividadeInput) && !selectedAtividades.includes(ativ)).slice(0, 5);
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      {/* Filter Toggle Button */}
      <div className="px-6 py-3">
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between w-full text-left">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Filtros
              {activeFiltersCount > 0 && <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{activeFiltersCount}</span>}
            </span>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
        </button>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-6 pb-4 space-y-4">
          {/* Clear All Button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button onClick={clearAllFilters} className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 transition-colors">
                <X className="w-3 h-3" />
                <span>Limpar filtros</span>
              </button>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Status</h5>
            <div className="flex flex-wrap gap-2">
              {uniqueStatus.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status ?? 'pendente')}
                  className={`px-3 py-2 rounded-full text-xs font-medium border-2 transition-all ${
                    selectedStatus.includes(status ?? 'pendente') ? statusColors[status as keyof typeof statusColors] : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {statusLabels[status as keyof typeof statusLabels]}
                </button>
              ))}
            </div>
          </div>

          {/* Local Filter */}
          <div>
            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Local</h5>

            {/* Selected Local Tags */}
            {selectedLocais.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedLocais.map((local) => (
                  <span key={local} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {local}
                    <button onClick={() => removeLocalFilter(local)} className="ml-2 hover:text-green-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={localInput}
                  onChange={(e) => setLocalInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addLocalFilter(localInput);
                    }
                  }}
                  placeholder="Digite palavras para filtrar locais..."
                  className="w-full text-gray-900 placeholder-gray-400 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                />
                {localInput.trim() && (
                  <button onClick={() => addLocalFilter(localInput)} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-green-600 hover:text-green-800 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              {(localInput.trim() || getFilteredLocais().length > 0) && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-32 overflow-y-auto">
                  {getFilteredLocais().map((local) => (
                    <button
                      key={local}
                      onClick={() => addLocalFilter(local)}
                      className="w-full text-black text-left px-3 py-2 text-sm hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {local}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Empreiteira Filter */}
          <div>
            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Empreiteira</h5>

            {/* Selected Empreiteira Tags */}
            {selectedEmpreiteiras.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedEmpreiteiras.map((empreiteira) => (
                  <span key={empreiteira} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {empreiteira}
                    <button onClick={() => removeEmpreiteiraFilter(empreiteira)} className="ml-2 hover:text-purple-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <div className="relative bg-white">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={empreiteiraInput}
                  onChange={(e) => setEmpreiteiraInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addEmpreiteiraFilter(empreiteiraInput);
                    }
                  }}
                  placeholder="Digite palavras para filtrar empreiteiras..."
                  className="w-full text-gray-900 placeholder-gray-400 bg-white pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                />
                {empreiteiraInput.trim() && (
                  <button
                    onClick={() => addEmpreiteiraFilter(empreiteiraInput)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              {(empreiteiraInput.trim() || getFilteredEmpreiteiras().length > 0) && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-32 overflow-y-auto">
                  {getFilteredEmpreiteiras().map((empreiteira) => (
                    <button
                      key={empreiteira}
                      onClick={() => addEmpreiteiraFilter(empreiteira)}
                      className="w-full text-black text-left px-3 py-2 text-sm hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {empreiteira}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Atividade Filter */}
          <div>
            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Atividade</h5>

            {/* Selected Atividade Tags */}
            {selectedAtividades.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedAtividades.map((atividade) => (
                  <span key={atividade} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {atividade.length > 20 ? `${atividade.substring(0, 20)}...` : atividade}
                    <button onClick={() => removeAtividadeFilter(atividade)} className="ml-2 hover:text-indigo-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <div className="relative bg-white">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={atividadeInput}
                  onChange={(e) => setAtividadeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addAtividadeFilter(atividadeInput);
                    }
                  }}
                  placeholder="Digite palavras para filtrar atividades..."
                  className="w-full text-gray-900 placeholder-gray-400 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                />
                {atividadeInput.trim() && (
                  <button
                    onClick={() => addAtividadeFilter(atividadeInput)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              {(atividadeInput.trim() || getFilteredAtividades().length > 0) && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-32 overflow-y-auto">
                  {getFilteredAtividades().map((atividade) => (
                    <button
                      key={atividade}
                      onClick={() => addAtividadeFilter(atividade)}
                      className="w-full text-black text-left px-3 py-2 text-sm hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {atividade}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { ChevronDown, ChevronUp, Filter, Plus, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import { Tarefa } from '../../types';

interface ObraFiltersProps {
  tarefas: Tarefa[];
  onFilterChange: (filteredTarefas: Tarefa[]) => void;
}

export const ObraFilters: React.FC<ObraFiltersProps> = ({ tarefas, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedLocais, setSelectedLocais] = useState<string[]>([]);
  const [selectedEmpreiteiras, setSelectedEmpreiteiras] = useState<string[]>([]);
  const [selectedAtividades, setSelectedAtividades] = useState<string[]>([]);
  const [dataCriacaoInput, setDataCriacaoInput] = useState('');
  const [dataLimiteInput, setDataLimiteInput] = useState('');
  const [localInput, setLocalInput] = useState('');
  const [empreiteiraInput, setEmpreiteiraInput] = useState('');
  const [atividadeInput, setAtividadeInput] = useState('');

  // Função para formatar data para DD/MM/YYYY
  const formatDateToDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Função para converter DD/MM/YYYY para YYYY-MM-DD (formato do input date)
  const formatDateForInput = (dateString: string): string => {
    console.log('formatDateForInput received:', dateString);
    if (!dateString) return '';

    // Se já está no formato YYYY-MM-DD, retorna como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Se está no formato DD/MM/YYYY, converte para YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }

    return '';
  };

  // Função para aplicar máscara DD/MM/YYYY durante a digitação
  const applyDateMask = (value: string): string => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');

    // Aplica a máscara DD/MM/YYYY
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
  };

  // Extrair valores únicos
  const uniqueStatus = Array.from(new Set(tarefas.map((t) => t.paymentStatus)));
  const uniqueLocais = Array.from(new Set(tarefas.map((t) => t.location.name))).sort();
  const uniqueEmpreiteiras = Array.from(new Set(tarefas.map((t) => t.contractor))).sort();
  const uniqueAtividades = Array.from(new Set(tarefas.map((t) => t.activity))).sort();

  const statusLabels = {
    PENDENTE: 'Pendente',
    EM_ANDAMENTO: 'Em Andamento',
    PAGO: 'Pago',
    ATRASADO: 'Atrasado',
  };

  const statusColors = {
    PENDENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    EM_ANDAMENTO: 'bg-blue-100 text-blue-800 border-blue-200 text-center',
    PAGO: 'bg-green-100 text-green-800 border-green-200',
    ATRASADO: 'bg-red-100 text-red-800 border-red-200',
  };

  // Função para busca incremental por múltiplas palavras
  const matchesIncrementalSearch = (text?: string, searchTerm?: string): boolean => {
    if (!text || !searchTerm) return true;

    if (!searchTerm.trim()) return true;

    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    const targetText = text.toLowerCase();

    return searchWords.every((word) => targetText.includes(word));
  };

  // Função para verificar se um item corresponde a qualquer filtro selecionado
  const matchesAnyFilter = (text?: string, selectedFilters?: string[]): boolean => {
    if (!text || !selectedFilters) return true;
    if (selectedFilters.length === 0 || !text) return true;
    return selectedFilters.some((filter) => matchesIncrementalSearch(text, filter));
  };

  const applyFilters = (status: string[], locais: string[], empreiteiras: string[], atividades: string[], dataCriacao: string, dataLimite: string) => {
    let filtered = tarefas;

    if (status.length > 0) {
      filtered = filtered.filter((t) => status.includes(t.paymentStatus));
    }

    if (locais.length > 0) {
      filtered = filtered.filter((t) => matchesAnyFilter(t.location?.name, locais));
    }

    if (empreiteiras.length > 0) {
      filtered = filtered.filter((t) => matchesAnyFilter(t.contractor.name, empreiteiras));
    }

    if (atividades.length > 0) {
      filtered = filtered.filter((t) => matchesAnyFilter(t.activity.name, atividades));
    }

    if (dataCriacao.trim()) {
      const dataCriacaoFormatted = formatDateForInput(dataCriacao);
      if (dataCriacaoFormatted) {
        filtered = filtered.filter((t) => {
          const dataCriacaoStr = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '';
          return dataCriacaoStr === dataCriacaoFormatted;
        });
      }
    }

    if (dataLimite.trim()) {
      const dataLimiteFormatted = formatDateForInput(dataLimite);
      if (dataLimiteFormatted) {
        filtered = filtered.filter((t) => {
          const dataLimiteStr = t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '';
          return dataLimiteStr === dataLimiteFormatted;
        });
      }
    }

    onFilterChange(filtered);
  };

  const handleStatusToggle = (status: string) => {
    const newSelected = selectedStatus.includes(status) ? selectedStatus.filter((s) => s !== status) : [...selectedStatus, status];

    setSelectedStatus(newSelected);
    applyFilters(newSelected, selectedLocais, selectedEmpreiteiras, selectedAtividades, dataCriacaoInput, dataLimiteInput);
  };

  const addLocalFilter = (value: string) => {
    if (value.trim() && !selectedLocais.includes(value.trim())) {
      const newSelected = [...selectedLocais, value.trim()];
      setSelectedLocais(newSelected);
      setLocalInput('');
      applyFilters(selectedStatus, newSelected, selectedEmpreiteiras, selectedAtividades, dataCriacaoInput, dataLimiteInput);
    }
  };

  const removeLocalFilter = (value: string) => {
    const newSelected = selectedLocais.filter((item) => item !== value);
    setSelectedLocais(newSelected);
    applyFilters(selectedStatus, newSelected, selectedEmpreiteiras, selectedAtividades, dataCriacaoInput, dataLimiteInput);
  };

  const addEmpreiteiraFilter = (value: string) => {
    if (value.trim() && !selectedEmpreiteiras.includes(value.trim())) {
      const newSelected = [...selectedEmpreiteiras, value.trim()];
      setSelectedEmpreiteiras(newSelected);
      setEmpreiteiraInput('');
      applyFilters(selectedStatus, selectedLocais, newSelected, selectedAtividades, dataCriacaoInput, dataLimiteInput);
    }
  };

  const removeEmpreiteiraFilter = (value: string) => {
    const newSelected = selectedEmpreiteiras.filter((item) => item !== value);
    setSelectedEmpreiteiras(newSelected);
    applyFilters(selectedStatus, selectedLocais, newSelected, selectedAtividades, dataCriacaoInput, dataLimiteInput);
  };

  const addAtividadeFilter = (value: string) => {
    if (value.trim() && !selectedAtividades.includes(value.trim())) {
      const newSelected = [...selectedAtividades, value.trim()];
      setSelectedAtividades(newSelected);
      setAtividadeInput('');
      applyFilters(selectedStatus, selectedLocais, selectedEmpreiteiras, newSelected, dataCriacaoInput, dataLimiteInput);
    }
  };

  const removeAtividadeFilter = (value: string) => {
    const newSelected = selectedAtividades.filter((item) => item !== value);
    setSelectedAtividades(newSelected);
    applyFilters(selectedStatus, selectedLocais, selectedEmpreiteiras, newSelected, dataCriacaoInput, dataLimiteInput);
  };

  const clearAllFilters = () => {
    setSelectedStatus([]);
    setSelectedLocais([]);
    setSelectedEmpreiteiras([]);
    setSelectedAtividades([]);
    setDataCriacaoInput('');
    setDataLimiteInput('');
    setLocalInput('');
    setEmpreiteiraInput('');
    setAtividadeInput('');
    onFilterChange(tarefas);
  };

  const handleDataCriacaoChange = (value: string) => {
    // Se o valor é do input date (YYYY-MM-DD), converte para DD/MM/YYYY para exibição
    const displayValue = value.includes('-') ? formatDateToDisplay(value) : applyDateMask(value);
    setDataCriacaoInput(displayValue);
    console.log('Data Criação Input set to:', displayValue);
    applyFilters(selectedStatus, selectedLocais, selectedEmpreiteiras, selectedAtividades, displayValue, dataLimiteInput);
  };

  const handleDataLimiteChange = (value: string) => {
    // Se o valor é do input date (YYYY-MM-DD), converte para DD/MM/YYYY para exibição
    const displayValue = value.includes('-') ? formatDateToDisplay(value) : applyDateMask(value);
    setDataLimiteInput(displayValue);
    applyFilters(selectedStatus, selectedLocais, selectedEmpreiteiras, selectedAtividades, dataCriacaoInput, displayValue);
  };

  const hasActiveFilters =
    selectedStatus.length > 0 || selectedLocais.length > 0 || selectedEmpreiteiras.length > 0 || selectedAtividades.length > 0 || dataCriacaoInput.trim() || dataLimiteInput.trim();
  const activeFiltersCount =
    selectedStatus.length + selectedLocais.length + selectedEmpreiteiras.length + selectedAtividades.length + (dataCriacaoInput.trim() ? 1 : 0) + (dataLimiteInput.trim() ? 1 : 0);

  // Filtrar sugestões baseadas no texto digitado
  const getFilteredLocais = () => {
    if (!localInput.trim()) return uniqueLocais.slice(0, 5);
    return uniqueLocais.filter((local) => matchesIncrementalSearch(local, localInput) && !selectedLocais.includes(local || '')).slice(0, 5);
  };

  const getFilteredEmpreiteiras = () => {
    if (!empreiteiraInput.trim()) return uniqueEmpreiteiras.slice(0, 5);
    return uniqueEmpreiteiras.filter((emp) => matchesIncrementalSearch(emp.name, empreiteiraInput) && !selectedEmpreiteiras.includes(emp.name || '')).slice(0, 5);
  };

  const getFilteredAtividades = () => {
    if (!atividadeInput.trim()) return uniqueAtividades.slice(0, 5);
    return uniqueAtividades.filter((ativ) => matchesIncrementalSearch(ativ.name, atividadeInput) && !selectedAtividades.includes(ativ.name || '')).slice(0, 5);
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
                  onClick={() => handleStatusToggle(status ?? 'PENDENTE')}
                  className={`px-3 py-2 rounded-full text-xs font-medium border-2 transition-all ${
                    selectedStatus.includes(status ?? 'PENDENTE') ? statusColors[status as keyof typeof statusColors] : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
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
                  className="w-full bg-white text-gray-900 placeholder-gray-400 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
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
                      onClick={() => addLocalFilter(local || '')}
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
                      key={empreiteira.id}
                      onClick={() => addEmpreiteiraFilter(empreiteira.name ?? '')}
                      className="w-full text-black text-left px-3 py-2 text-sm hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {empreiteira.name}
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
                      key={atividade.id}
                      onClick={() => addAtividadeFilter(atividade.name ?? '')}
                      className="w-full text-black text-left px-3 py-2 text-sm hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {atividade.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row gap-6">
            {/* Data de Criação Filter */}
            <div className="flex-1">
              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Data de Criação</h5>
              <div className="relative">
                <input
                  type="date"
                  value={formatDateForInput(dataCriacaoInput) != '' ? formatDateForInput(dataCriacaoInput) : undefined}
                  onChange={(e) => handleDataCriacaoChange(e.target.value)}
                  className="w-full bg-white text-gray-900 pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm"
                />
                {dataCriacaoInput != '' && <div className="mt-2 text-xs text-gray-500">Filtrado por: {dataCriacaoInput}</div>}
              </div>
            </div>

            {/* Data Limite Filter */}
            <div className="flex-1">
              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Data Limite</h5>
              <div className="relative">
                <input
                  type="date"
                  value={formatDateForInput(dataLimiteInput)}
                  onChange={(e) => handleDataLimiteChange(e.target.value)}
                  className="w-full bg-white text-gray-900 pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
                />
                {dataLimiteInput && <div className="mt-2 text-xs text-gray-500">Filtrado por: {dataLimiteInput}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Tarefa } from '../types';

interface ObraFiltersProps {
  tarefas: Tarefa[];
  onFilterChange: (filteredTarefas: Tarefa[]) => void;
}

export const ObraFilters: React.FC<ObraFiltersProps> = ({ tarefas, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [empreiteiraFilter, setEmpreiteiraFilter] = useState('');
  const [atividadeFilter, setAtividadeFilter] = useState('');

  // Extrair valores únicos
  const uniqueStatus = Array.from(new Set(tarefas.map((t) => t.status)));
  const uniqueEmpreiteiras = Array.from(new Set(tarefas.map((t) => t.empreiteira))).sort();
  const uniqueAtividades = Array.from(new Set(tarefas.map((t) => t.atividade))).sort();

  const statusLabels = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    atrasada: 'Atrasada',
  };

  const statusColors = {
    pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    em_andamento: 'bg-blue-100 text-blue-800 border-blue-200',
    concluida: 'bg-green-100 text-green-800 border-green-200',
    atrasada: 'bg-red-100 text-red-800 border-red-200',
  };

  const applyFilters = (status: string[], empreiteiraText: string, atividadeText: string) => {
    let filtered = tarefas;

    if (status.length > 0) {
      filtered = filtered.filter((t) => status.includes(t.status));
    }

    if (empreiteiraText.trim()) {
      filtered = filtered.filter((t) => t.empreiteira.toLowerCase().includes(empreiteiraText.toLowerCase()));
    }

    if (atividadeText.trim()) {
      filtered = filtered.filter((t) => t.atividade.toLowerCase().includes(atividadeText.toLowerCase()));
    }

    onFilterChange(filtered);
  };

  const handleStatusToggle = (status: string) => {
    const newSelected = selectedStatus.includes(status) ? selectedStatus.filter((s) => s !== status) : [...selectedStatus, status];

    setSelectedStatus(newSelected);
    applyFilters(newSelected, empreiteiraFilter, atividadeFilter);
  };

  const handleEmpreiteiraChange = (value: string) => {
    setEmpreiteiraFilter(value);
    applyFilters(selectedStatus, value, atividadeFilter);
  };

  const handleAtividadeChange = (value: string) => {
    setAtividadeFilter(value);
    applyFilters(selectedStatus, empreiteiraFilter, value);
  };

  const clearAllFilters = () => {
    setSelectedStatus([]);
    setEmpreiteiraFilter('');
    setAtividadeFilter('');
    onFilterChange(tarefas);
  };

  const hasActiveFilters = selectedStatus.length > 0 || empreiteiraFilter.trim() || atividadeFilter.trim();
  const activeFiltersCount = selectedStatus.length + (empreiteiraFilter.trim() ? 1 : 0) + (atividadeFilter.trim() ? 1 : 0);

  // Filtrar sugestões baseadas no texto digitado
  const getFilteredEmpreiteiras = () => {
    if (!empreiteiraFilter.trim()) return uniqueEmpreiteiras.slice(0, 5);
    return uniqueEmpreiteiras.filter((emp) => emp.toLowerCase().includes(empreiteiraFilter.toLowerCase())).slice(0, 5);
  };

  const getFilteredAtividades = () => {
    if (!atividadeFilter.trim()) return uniqueAtividades.slice(0, 5);
    return uniqueAtividades.filter((ativ) => ativ.toLowerCase().includes(atividadeFilter.toLowerCase())).slice(0, 5);
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
                  onClick={() => handleStatusToggle(status)}
                  className={`px-3 py-2 rounded-full text-xs font-medium border-2 transition-all ${
                    selectedStatus.includes(status) ? statusColors[status as keyof typeof statusColors] : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {statusLabels[status as keyof typeof statusLabels]}
                </button>
              ))}
            </div>
          </div>

          {/* Empreiteira Filter */}
          <div>
            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Empreiteira</h5>
            <div className="relative">
              <div className="relative bg-white">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={empreiteiraFilter}
                  onChange={(e) => handleEmpreiteiraChange(e.target.value)}
                  placeholder="Digite para filtrar empreiteiras..."
                  className="w-full text-gray-900 placeholder-gray-400 bg-white pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              {(empreiteiraFilter.trim() || getFilteredEmpreiteiras().length > 0) && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-32 overflow-y-auto">
                  {getFilteredEmpreiteiras().map((empreiteira) => (
                    <button
                      key={empreiteira}
                      onClick={() => handleEmpreiteiraChange(empreiteira)}
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
            <div className="relative">
              <div className="relative bg-white">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={atividadeFilter}
                  onChange={(e) => handleAtividadeChange(e.target.value)}
                  placeholder="Digite para filtrar atividades..."
                  className="w-full text-gray-900 placeholder-gray-400 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              {(atividadeFilter.trim() || getFilteredAtividades().length > 0) && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-32 overflow-y-auto">
                  {getFilteredAtividades().map((atividade) => (
                    <button
                      key={atividade}
                      onClick={() => handleAtividadeChange(atividade)}
                      className="w-full text-black text-left px-3 py-2 text-sm hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {atividade}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Local Filter */}
          <div>
            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Local</h5>
            <div className="relative">
              <div className="relative bg-white">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={atividadeFilter}
                  onChange={(e) => handleAtividadeChange(e.target.value)}
                  placeholder="Digite para filtrar atividades..."
                  className="w-full text-gray-900 placeholder-gray-400 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              {(atividadeFilter.trim() || getFilteredAtividades().length > 0) && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-32 overflow-y-auto">
                  {getFilteredAtividades().map((atividade) => (
                    <button
                      key={atividade}
                      onClick={() => handleAtividadeChange(atividade)}
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

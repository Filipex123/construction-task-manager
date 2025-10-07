'use client';
import React from 'react';
import { Filter, X } from 'lucide-react';
import { SearchBar } from './SearchBar';

export interface FiltersState {
  local: string;
  atividade: string;
  empreiteira: string;
  dataInicio: string;
  dataFim: string;
  dataCriacao: string;
  dataLimite: string;
}

interface FiltersSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filters: FiltersState;
  onFilterChange: (key: keyof FiltersState, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FiltersSection: React.FC<FiltersSectionProps> = ({ searchTerm, onSearchChange, showFilters, onToggleFilters, filters, onFilterChange, onClearFilters, hasActiveFilters }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
          </div>
        </div>
        <button
          onClick={onToggleFilters}
          className="inline-flex items-center justify-center lg:justify-start w-full lg:w-auto gap-2 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
        >
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Filtros</span>
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Local</label>
            <input
              type="text"
              value={filters.local}
              onChange={(e) => onFilterChange('local', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
              placeholder="Filtrar por local"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Atividade</label>
            <input
              type="text"
              value={filters.atividade}
              onChange={(e) => onFilterChange('atividade', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
              placeholder="Filtrar por atividade"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Empreiteira</label>
            <input
              type="text"
              value={filters.empreiteira}
              onChange={(e) => onFilterChange('empreiteira', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
              placeholder="Filtrar por empreiteira"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Data Início</label>
            <input
              type="date"
              value={filters.dataInicio}
              onChange={(e) => onFilterChange('dataInicio', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Data Fim</label>
            <input
              type="date"
              value={filters.dataFim}
              onChange={(e) => onFilterChange('dataFim', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Data de Criação</label>
            <input
              type="text"
              value={filters.dataCriacao}
              onChange={(e) => onFilterChange('dataCriacao', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
              placeholder="Ex: 2024-01-15, 2024-02-20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Data Limite</label>
            <input
              type="text"
              value={filters.dataLimite}
              onChange={(e) => onFilterChange('dataLimite', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
              placeholder="Ex: 2024-03-10, 2024-04-05"
            />
          </div>
          {hasActiveFilters && (
            <>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div className="flex justify-end">
                <button onClick={onClearFilters} className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 transition-colors">
                  <X className="w-3 h-3" />
                  <span>Limpar filtros</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

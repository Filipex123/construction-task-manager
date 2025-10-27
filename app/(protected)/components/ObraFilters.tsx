import { ChevronDown, ChevronUp, Filter, Plus, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import { IdName, Tarefa } from '../../types';

export type TarefaFilterParams = {
  status?: string[];
  location?: string[]; // agora contêm ids
  contractor?: string[];
  activity?: string[];
  createdAt?: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  page?: number;
  pageSize?: number;
};

interface ObraFiltersProps {
  tarefas: Tarefa[]; // usado só para listar sugestões (pode ser page ou full list)
  // agora onFilterClick retorna Promise — aguarde no componente de filtros
  onFilterClick: (result: any) => Promise<any>;
}

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

export const ObraFiltersInner: React.FC<ObraFiltersProps> = ({ tarefas, onFilterClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  // agora armazenamos arrays de objetos {id, name} para exibição, mas enviaremos só ids
  const [selectedLocais, setSelectedLocais] = useState<IdName[]>([]);
  const [selectedEmpreiteiras, setSelectedEmpreiteiras] = useState<IdName[]>([]);
  const [selectedAtividades, setSelectedAtividades] = useState<IdName[]>([]);
  const [dataCriacaoInput, setDataCriacaoInput] = useState('');
  const [dataLimiteInput, setDataLimiteInput] = useState('');
  const [localInput, setLocalInput] = useState('');
  const [empreiteiraInput, setEmpreiteiraInput] = useState('');
  const [atividadeInput, setAtividadeInput] = useState('');
  const [isApplying, setIsApplying] = useState(false); // novo: loading do botão Filtrar

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

  // helper: normaliza um campo (string | object) para {id, name}
  const toIdName = (val: any): IdName | null => {
    if (val == null) return null;
    if (typeof val === 'string') return { id: val, name: val };
    if (typeof val === 'object') {
      const id = String(val.id ?? val._id ?? val.value ?? val.uuid ?? val.key ?? val.name ?? val.label ?? '');
      const name = String(val.name ?? val.label ?? val.title ?? val.value ?? id);
      return { id: id || name, name };
    }
    return { id: String(val), name: String(val) };
  };

  // Extrair valores únicos (como {id,name})
  const uniqueStatus = Array.from(new Set(tarefas.map((t) => t.paymentStatus)));
  const uniqueLocais = (() => {
    const map = new Map<string, IdName>();
    tarefas.forEach((t) => {
      const pair = toIdName((t as any).location);
      if (pair && !map.has(pair.id)) map.set(pair.id, pair);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();
  const uniqueEmpreiteiras = (() => {
    const map = new Map<string, IdName>();
    tarefas.forEach((t) => {
      const pair = toIdName((t as any).contractor);
      if (pair && !map.has(pair.id)) map.set(pair.id, pair);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();
  const uniqueAtividades = (() => {
    const map = new Map<string, IdName>();
    tarefas.forEach((t) => {
      const pair = toIdName((t as any).activity);
      if (pair && !map.has(pair.id)) map.set(pair.id, pair);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();

  // Função para busca incremental por múltiplas palavras (aplica em name)
  const matchesIncrementalSearch = (text?: string, searchTerm?: string): boolean => {
    if (!text || !searchTerm) return true;
    if (!searchTerm.trim()) return true;
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    const targetText = text.toLowerCase();
    return searchWords.every((word) => targetText.includes(word));
  };

  // Função que monta e retorna o objeto de filtros (sem emitir)
  const buildFiltersObject = (status: string[], locais: IdName[], empreiteiras: IdName[], atividades: IdName[], dataCriacao: string, dataLimite: string): TarefaFilterParams => {
    return {
      status: status.length ? status : undefined,
      location: locais.length ? locais.map((l) => l.id) : undefined,
      contractor: empreiteiras.length ? empreiteiras.map((e) => e.id) : undefined,
      activity: atividades.length ? atividades.map((a) => a.id) : undefined,
      createdAt: dataCriacao.trim() ? formatDateForInput(dataCriacao) : undefined,
      dueDate: dataLimite.trim() ? formatDateForInput(dataLimite) : undefined,
      page: 1,
      pageSize: 10,
    };
  };

  // Função que chama o serviço com os filtros e emite o resultado via onFilterChange
  const handleApplyFilters = async () => {
    const filters = buildFiltersObject(selectedStatus, selectedLocais, selectedEmpreiteiras, selectedAtividades, dataCriacaoInput, dataLimiteInput);
    try {
      setIsApplying(true);
      // aguarda o parent (TarefaCard) aplicar os filtros e retornar a promise do fetch
      await onFilterClick(filters);
      // manter filtros abertos
    } catch (err) {
      console.error('Erro ao aplicar filtros:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleStatusToggle = (status: string) => {
    const newSelected = selectedStatus.includes(status) ? selectedStatus.filter((s) => s !== status) : [...selectedStatus, status];
    setSelectedStatus(newSelected);
  };

  // ADD / REMOVE para Locais/Eempreiteiras/Atividades — recebem name ou pair
  const addLocalFilter = (valueOrPair: string | IdName) => {
    const pair = typeof valueOrPair === 'string' ? uniqueLocais.find((u) => u.name.toLowerCase() === valueOrPair.toLowerCase()) ?? { id: valueOrPair, name: valueOrPair } : valueOrPair;
    if (!selectedLocais.find((s) => s.id === pair.id)) {
      setSelectedLocais((prev) => [...prev, pair]);
      setLocalInput('');
    }
  };

  const removeLocalFilter = (id: string) => {
    setSelectedLocais((prev) => prev.filter((item) => item.id !== id));
  };

  const addEmpreiteiraFilter = (valueOrPair: string | IdName) => {
    const pair = typeof valueOrPair === 'string' ? uniqueEmpreiteiras.find((u) => u.name.toLowerCase() === valueOrPair.toLowerCase()) ?? { id: valueOrPair, name: valueOrPair } : valueOrPair;
    if (!selectedEmpreiteiras.find((s) => s.id === pair.id)) {
      setSelectedEmpreiteiras((prev) => [...prev, pair]);
      setEmpreiteiraInput('');
    }
  };

  const removeEmpreiteiraFilter = (id: string) => {
    setSelectedEmpreiteiras((prev) => prev.filter((item) => item.id !== id));
  };

  const addAtividadeFilter = (valueOrPair: string | IdName) => {
    const pair = typeof valueOrPair === 'string' ? uniqueAtividades.find((u) => u.name.toLowerCase() === valueOrPair.toLowerCase()) ?? { id: valueOrPair, name: valueOrPair } : valueOrPair;
    if (!selectedAtividades.find((s) => s.id === pair.id)) {
      setSelectedAtividades((prev) => [...prev, pair]);
      setAtividadeInput('');
    }
  };

  const removeAtividadeFilter = (id: string) => {
    setSelectedAtividades((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllFilters = async () => {
    setSelectedStatus([]);
    setSelectedLocais([]);
    setSelectedEmpreiteiras([]);
    setSelectedAtividades([]);
    setDataCriacaoInput('');
    setDataLimiteInput('');
    setLocalInput('');
    setEmpreiteiraInput('');
    setAtividadeInput('');

    const resetFilters = buildFiltersObject([], [], [], [], '', '');

    try {
      setIsApplying(true);
      await onFilterClick(resetFilters);
    } catch (err) {
      console.error('Erro ao limpar e buscar todas as tarefas:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleDataCriacaoChange = (value: string) => {
    // Se o valor é do input date (YYYY-MM-DD), converte para DD/MM/YYYY para exibição
    const displayValue = value.includes('-') ? formatDateToDisplay(value) : applyDateMask(value);
    setDataCriacaoInput(displayValue);
  };

  const handleDataLimiteChange = (value: string) => {
    // Se o valor é do input date (YYYY-MM-DD), converte para DD/MM/YYYY para exibição
    const displayValue = value.includes('-') ? formatDateToDisplay(value) : applyDateMask(value);
    setDataLimiteInput(displayValue);
  };

  const hasActiveFilters =
    selectedStatus.length > 0 || selectedLocais.length > 0 || selectedEmpreiteiras.length > 0 || selectedAtividades.length > 0 || dataCriacaoInput.trim() || dataLimiteInput.trim();
  const activeFiltersCount =
    selectedStatus.length + selectedLocais.length + selectedEmpreiteiras.length + selectedAtividades.length + (dataCriacaoInput.trim() ? 1 : 0) + (dataLimiteInput.trim() ? 1 : 0);

  // Filtrar sugestões baseadas no texto digitado (filtra por name e exclui já selecionados)
  const getFilteredLocais = () => {
    const filtered = localInput.trim() ? uniqueLocais.filter((local) => matchesIncrementalSearch(local.name, localInput)) : uniqueLocais;
    const selectedIds = new Set(selectedLocais.map((s) => s.id));
    return filtered.filter((f) => !selectedIds.has(f.id)).slice(0, 5);
  };

  const getFilteredEmpreiteiras = () => {
    const filtered = empreiteiraInput.trim() ? uniqueEmpreiteiras.filter((emp) => matchesIncrementalSearch(emp.name, empreiteiraInput)) : uniqueEmpreiteiras;
    const selectedIds = new Set(selectedEmpreiteiras.map((s) => s.id));
    return filtered.filter((f) => !selectedIds.has(f.id)).slice(0, 5);
  };

  const getFilteredAtividades = () => {
    const filtered = atividadeInput.trim() ? uniqueAtividades.filter((ativ) => matchesIncrementalSearch(ativ.name, atividadeInput)) : uniqueAtividades;
    const selectedIds = new Set(selectedAtividades.map((s) => s.id));
    return filtered.filter((f) => !selectedIds.has(f.id)).slice(0, 5);
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      {/* Filter Toggle Button */}
      <div className="px-6 py-3">
        <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between w-full text-left">
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
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  clearAllFilters();
                }}
                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 transition-colors"
              >
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
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleStatusToggle(status ?? 'EM_ANDAMENTO');
                  }}
                  className={`px-3 py-2 rounded-full text-xs font-medium border-2 transition-all ${
                    selectedStatus.includes(status ?? 'EM_ANDAMENTO') ? statusColors[status as keyof typeof statusColors] : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
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
                  <span key={local.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {local.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLocalFilter(local.id);
                      }}
                      className="ml-2 hover:text-green-600 transition-colors"
                    >
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLocalFilter(localInput);
                    }
                  }}
                  placeholder="Digite palavras para filtrar locais..."
                  className="w-full bg-white text-gray-900 placeholder-gray-400 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                />
                {localInput.trim() && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      addLocalFilter(localInput);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-green-600 hover:text-green-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              {(localInput.trim() || getFilteredLocais().length > 0) && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-32 overflow-y-auto">
                  {getFilteredLocais().map((local) => (
                    <button
                      key={local.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        addLocalFilter(local);
                      }}
                      className="w-full text-black text-left px-3 py-2 text-sm hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {local.name}
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
                  <span key={empreiteira.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {empreiteira.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEmpreiteiraFilter(empreiteira.id);
                      }}
                      className="ml-2 hover:text-purple-600 transition-colors"
                    >
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addEmpreiteiraFilter(empreiteiraInput);
                    }
                  }}
                  placeholder="Digite palavras para filtrar empreiteiras..."
                  className="w-full text-gray-900 placeholder-gray-400 bg-white pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                />
                {empreiteiraInput.trim() && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      addEmpreiteiraFilter(empreiteiraInput);
                    }}
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
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        addEmpreiteiraFilter(empreiteira);
                      }}
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
                  <span key={atividade.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {atividade.name.length > 20 ? `${atividade.name.substring(0, 20)}...` : atividade.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAtividadeFilter(atividade.id);
                      }}
                      className="ml-2 hover:text-indigo-600 transition-colors"
                    >
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAtividadeFilter(atividadeInput);
                    }
                  }}
                  placeholder="Digite palavras para filtrar atividades..."
                  className="w-full text-gray-900 placeholder-gray-400 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                />
                {atividadeInput.trim() && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      addAtividadeFilter(atividadeInput);
                    }}
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
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        addAtividadeFilter(atividade);
                      }}
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
                  value={formatDateForInput(dataCriacaoInput)}
                  onChange={(e) => handleDataCriacaoChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                  className="w-full bg-white text-gray-900 pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
                />
                {dataLimiteInput && <div className="mt-2 text-xs text-gray-500">Filtrado por: {dataLimiteInput}</div>}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {/* Botão Filtrar: chama o serviço */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleApplyFilters();
              }}
              disabled={isApplying}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-md"
            >
              {isApplying ? 'Filtrando...' : 'Filtrar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const ObraFilters = React.memo(ObraFiltersInner, (prev, next) => {
  // avoid re-render if tarefas reference didn't change and callback stable
  if (prev.tarefas === next.tarefas && prev.onFilterClick === next.onFilterClick) return true;
  // fallback to shallow id comparison
  if (prev.tarefas.length !== next.tarefas.length) return false;
  for (let i = 0; i < prev.tarefas.length; i++) {
    if (prev.tarefas[i].id !== next.tarefas[i].id) return false;
  }
  return prev.onFilterClick === next.onFilterClick;
});

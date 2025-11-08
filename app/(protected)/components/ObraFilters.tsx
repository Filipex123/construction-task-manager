import { formatDateForInput, formatDateStringtoView } from '@/app/utils/dateUtils';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import React, { useState } from 'react';
import { Tarefa, TaskIdName } from '../../types';
import { TextWithSelect } from './InputSelect';

export type TarefaFilterParams = {
  paymentStatus?: string[];
  location?: string[];
  contractor?: string[];
  activity?: string[];
  createdAt?: string;
  dueDate?: string;
  page?: number;
  pageSize?: number;
};

interface ObraFiltersProps {
  tarefas: Tarefa[];
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

export const ObraFiltersInner: React.FC<ObraFiltersProps> = ({ onFilterClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedLocal, setSelectedLocal] = useState<TaskIdName | null>(null);
  const [selectedEmpreiteira, setSelectedEmpreiteira] = useState<TaskIdName | null>(null);
  const [selectedAtividade, setSelectedAtividade] = useState<TaskIdName | null>(null);
  const [dataCriacaoInput, setDataCriacaoInput] = useState('');
  const [dataLimiteInput, setDataLimiteInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // const parseVoidTextFields = (text: TaskIdName | null) => {
  //   if (!text) return null;

  //   return text.name.trim() !== '' ? text : null;
  // };

  const uniqueStatus = ['PAGO', 'PENDENTE', 'EM_ANDAMENTO', 'ATRASADO'];

  const applyDateMask = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  };

  const buildFiltersObject = (
    status: string[],
    local: TaskIdName | null,
    empreiteira: TaskIdName | null,
    atividade: TaskIdName | null,
    dataCriacao: string,
    dataLimite: string
  ): TarefaFilterParams => {
    return {
      paymentStatus: status.length ? status : undefined,
      location: local ? [String(local.id)] : undefined,
      contractor: empreiteira ? [String(empreiteira.id)] : undefined,
      activity: atividade ? [String(atividade.id)] : undefined,
      createdAt: dataCriacao.trim() ? formatDateForInput(dataCriacao) : undefined,
      dueDate: dataLimite.trim() ? formatDateForInput(dataLimite) : undefined,
      page: 1,
      pageSize: 10,
    };
  };

  const handleApplyFilters = async () => {
    const filters = buildFiltersObject(selectedStatus, selectedLocal, selectedEmpreiteira, selectedAtividade, dataCriacaoInput, dataLimiteInput);
    try {
      setIsApplying(true);
      await onFilterClick(filters);
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

  const clearAllFilters = async () => {
    setSelectedStatus([]);
    setSelectedLocal(null);
    setSelectedEmpreiteira(null);
    setSelectedAtividade(null);
    setDataCriacaoInput('');
    setDataLimiteInput('');

    const resetFilters = buildFiltersObject([], null, null, null, '', '');
    try {
      setIsApplying(true);
      await onFilterClick(resetFilters);
    } catch (err) {
      console.error('Erro ao limpar filtros:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleDataCriacaoChange = (value: string) => {
    const displayValue = value.includes('-') ? formatDateStringtoView(value) : applyDateMask(value);
    setDataCriacaoInput(displayValue);
  };

  const handleDataLimiteChange = (value: string) => {
    const displayValue = value.includes('-') ? formatDateStringtoView(value) : applyDateMask(value);
    setDataLimiteInput(displayValue);
  };

  const hasActiveFilters = selectedStatus.length > 0 || selectedLocal || selectedEmpreiteira || selectedAtividade || dataCriacaoInput.trim() || dataLimiteInput.trim();

  const activeFiltersCount =
    selectedStatus.length + (selectedLocal ? 1 : 0) + (selectedEmpreiteira ? 1 : 0) + (selectedAtividade ? 1 : 0) + (dataCriacaoInput.trim() ? 1 : 0) + (dataLimiteInput.trim() ? 1 : 0);

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      {/* Toggle */}
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

      {isExpanded && (
        <div className="px-6 pb-4 space-y-4">
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

          {/* Status */}
          <div>
            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Status</h5>
            <div className="flex flex-wrap gap-2">
              {uniqueStatus.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleStatusToggle(status);
                  }}
                  className={`px-3 py-2 rounded-full text-xs font-medium border-2 transition-all ${
                    selectedStatus.includes(status) ? statusColors[status as keyof typeof statusColors] : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {statusLabels[status as keyof typeof statusLabels]}
                </button>
              ))}
            </div>
          </div>

          {/* Locais */}
          <TextWithSelect
            label="Local"
            apiUrl="https://zernov6ywj.execute-api.us-east-1.amazonaws.com/prod/locais?idObra=1&limit=1000"
            value={selectedLocal ?? undefined}
            onChange={(val) => setSelectedLocal(val)}
          />

          {/* Empreiteira */}
          <TextWithSelect
            label="Empreiteira"
            apiUrl="https://kizi7kxvm0.execute-api.us-east-1.amazonaws.com/prod/empreiteiras"
            value={selectedEmpreiteira ?? undefined}
            onChange={(val) => setSelectedEmpreiteira(val)}
          />

          {/* Atividade */}
          <TextWithSelect
            label="Atividade"
            apiUrl="https://8dg3v1avkb.execute-api.us-east-1.amazonaws.com/prod/atividades"
            value={selectedAtividade ?? undefined}
            onChange={(val) => setSelectedAtividade(val)}
          />

          {/* Datas */}
          <div className="flex flex-row gap-6">
            <div className="flex-1">
              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Data de Criação</h5>
              <input
                type="date"
                value={formatDateForInput(dataCriacaoInput)}
                onChange={(e) => handleDataCriacaoChange(e.target.value)}
                className="w-full bg-white text-gray-900 pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              />
              {dataCriacaoInput && <div className="mt-2 text-xs text-gray-500">Filtrado por: {dataCriacaoInput}</div>}
            </div>

            <div className="flex-1">
              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Data Vencimento</h5>
              <input
                type="date"
                value={formatDateForInput(dataLimiteInput)}
                onChange={(e) => handleDataLimiteChange(e.target.value)}
                className="w-full bg-white text-gray-900 pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
              />
              {dataLimiteInput && <div className="mt-2 text-xs text-gray-500">Filtrado por: {dataLimiteInput}</div>}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
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

export const ObraFilters = React.memo(ObraFiltersInner);

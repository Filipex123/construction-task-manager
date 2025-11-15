import { atividadesService } from '@/app/services/atividadesService';
import { empreiteraService } from '@/app/services/empreiteiraService';
import { localService } from '@/app/services/localService';
import { formatDateForInput } from '@/app/utils/dateUtils';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Atividades, Empreiteira, Local, Tarefa, TaskIdName } from '../../types';
import { Option, TextWithSelect } from './InputSelect';

export type TarefaFilterParams = {
  paymentStatus?: string[];
  measurementStatus?: string[];
  location?: string[];
  contractor?: string[];
  activity?: string[];
  startCreatedAt?: string;
  endCreatedAt?: string;
  startDueDate?: string;
  endDueDate?: string;
  page?: number;
  pageSize?: number;
};

type DateRanges = {
  startCreatedAt: string;
  endCreatedAt: string;
  startDueDate: string;
  endDueDate: string;
};

interface ObraFiltersProps {
  obraId: number;
  tarefas: Tarefa[];
  onFilterClick: (result: any) => Promise<any>;
  isMeasure?: boolean;
}

const statusLabels = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em Andamento',
  PAGO: 'Pago',
  ATRASADO: 'Atrasado',
  MEDIDO: 'Medido',
  RETIDO: 'Retido',
};

const statusColors = {
  PENDENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-800 border-blue-200 text-center',
  PAGO: 'bg-green-100 text-green-800 border-green-200',
  MEDIDO: 'bg-green-100 text-green-800 border-green-200',
  ATRASADO: 'bg-red-100 text-red-800 border-red-200',
};

export const ObraFiltersInner: React.FC<ObraFiltersProps> = ({ onFilterClick, isMeasure = false, obraId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [locais, setLocais] = useState<Local[]>([]);
  const [atividades, setAtividades] = useState<Atividades[]>([]);
  const [contractors, setContractors] = useState<Empreiteira[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedLocal, setSelectedLocal] = useState<TaskIdName | null>(null);
  const [selectedEmpreiteira, setSelectedEmpreiteira] = useState<TaskIdName | null>(null);
  const [selectedAtividade, setSelectedAtividade] = useState<TaskIdName | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [dataErrors, setDataErrors] = useState({
    createdAt: '',
    dueDate: '',
  });

  const [dates, setDates] = useState<DateRanges>({
    startCreatedAt: '',
    endCreatedAt: '',
    startDueDate: '',
    endDueDate: '',
  });
  const uniqueStatus = ['PAGO', 'PENDENTE', 'EM_ANDAMENTO', 'ATRASADO'];
  const uniqueMeasurementStatus = ['MEDIDO', 'PENDENTE', 'EM_ANDAMENTO', 'RETIDO'];

  const getStatusByProp = () => (isMeasure ? uniqueMeasurementStatus : uniqueStatus);

  const handleDatesChange = (field: keyof typeof dates, value: string) => {
    const updated = { ...dates, [field]: value };
    setDates(updated);
    validateDates(updated);
  };

  const validateDates = (values: typeof dates) => {
    let createdAtError = '';
    let dueDateError = '';

    // Validação do range de criação
    if ((values.startCreatedAt && !values.endCreatedAt) || (!values.startCreatedAt && values.endCreatedAt)) {
      createdAtError = 'Preencha as duas datas de criação (início e fim).';
    }

    // Validação do range de vencimento
    if ((values.startDueDate && !values.endDueDate) || (!values.startDueDate && values.endDueDate)) {
      dueDateError = 'Preencha as duas datas de vencimento (início e fim).';
    }

    setDataErrors({
      createdAt: createdAtError,
      dueDate: dueDateError,
    });
  };

  const buildFiltersObject = (status: string[], local: TaskIdName | null, empreiteira: TaskIdName | null, atividade: TaskIdName | null, dates: DateRanges): TarefaFilterParams => {
    return {
      ...(isMeasure ? { measurementStatus: status.length ? status : undefined } : { paymentStatus: status.length ? status : undefined }),
      location: local ? [String(local.id)] : undefined,
      contractor: empreiteira ? [String(empreiteira.id)] : undefined,
      activity: atividade ? [String(atividade.id)] : undefined,
      startCreatedAt: dates.startCreatedAt || undefined,
      endCreatedAt: dates.endCreatedAt || undefined,
      startDueDate: dates.startDueDate || undefined,
      endDueDate: dates.endDueDate || undefined,
      page: 1,
      pageSize: 10,
    };
  };

  const handleApplyFilters = async () => {
    const filters = buildFiltersObject(selectedStatus, selectedLocal, selectedEmpreiteira, selectedAtividade, dates);
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
    setSelectedStatus((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));
  };

  const clearAllFilters = async () => {
    setSelectedStatus([]);
    setSelectedLocal(null);
    setSelectedEmpreiteira(null);
    setSelectedAtividade(null);
    setDates({
      startCreatedAt: '',
      endCreatedAt: '',
      startDueDate: '',
      endDueDate: '',
    });

    const resetFilters = buildFiltersObject([], null, null, null, {
      startCreatedAt: '',
      endCreatedAt: '',
      startDueDate: '',
      endDueDate: '',
    });

    try {
      setIsApplying(true);
      await onFilterClick(resetFilters);
    } catch (err) {
      console.error('Erro ao limpar filtros:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const hasActiveFilters = selectedStatus.length > 0 || selectedLocal || selectedEmpreiteira || selectedAtividade || Object.values(dates).some((v) => v.trim());

  const activeFiltersCount = selectedStatus.length + (selectedLocal ? 1 : 0) + (selectedEmpreiteira ? 1 : 0) + (selectedAtividade ? 1 : 0) + Object.values(dates).filter((v) => v.trim()).length;

  useEffect(() => {
    let mounted = true;
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [fLocais, fAtividades, fContractors] = await Promise.all([localService?.listar(obraId), atividadesService?.listar(), empreiteraService?.listar()]);

        if (!mounted) return;

        const locaisArr: Local[] = fLocais.items;
        const atividadesArr: Atividades[] = fAtividades;
        const contractorsArr: Empreiteira[] = fContractors;

        setLocais(locaisArr);
        setAtividades(atividadesArr);
        setContractors(contractorsArr);
      } catch (err) {
        console.error('Erro ao carregar opções do modal de tarefa:', err);
        // fallback já definido via mocks
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    };

    loadOptions();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obraId]);

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
              {getStatusByProp().map((status) => (
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
          <TextWithSelect label="Local" options={locais.map((l) => ({ id: l.id, name: l.name })) as Option[]} value={selectedLocal ?? undefined} onChange={(val) => setSelectedLocal(val)} />

          {/* Empreiteira */}
          <TextWithSelect
            label="Empreiteira"
            options={contractors.map((l) => ({ id: l.id, name: l.name })) as Option[]}
            value={selectedEmpreiteira ?? undefined}
            onChange={(val) => setSelectedEmpreiteira(val)}
          />

          {/* Atividade */}
          <TextWithSelect
            label="Atividade"
            options={atividades.map((l) => ({ id: l.id, name: l.name })) as Option[]}
            value={selectedAtividade ?? undefined}
            onChange={(val) => setSelectedAtividade(val)}
          />

          {/* Datas Criação */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">Data de Criação</label>
              <div className="flex flex-col md:flex-row w-full justify-between gap-4 md:gap-8">
                <input
                  type="date"
                  value={formatDateForInput(dates.startCreatedAt)}
                  onChange={(e) => handleDatesChange('startCreatedAt', e.target.value)}
                  className="w-full bg-white text-gray-900 pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />

                <div className="flex items-center justify-center text-m text-gray-500">até</div>

                <input
                  type="date"
                  value={formatDateForInput(dates.endCreatedAt)}
                  onChange={(e) => handleDatesChange('endCreatedAt', e.target.value)}
                  className="w-full bg-white text-gray-900 pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {dataErrors.createdAt && <p className="text-red-500 text-sm mt-2">{dataErrors.createdAt}</p>}
            </div>
          </div>

          {/* Datas Vencimento */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">Data de Vencimento</label>
              <div className="flex flex-col md:flex-row w-full justify-between gap-4 md:gap-8">
                <input
                  type="date"
                  value={formatDateForInput(dates.startDueDate)}
                  onChange={(e) => handleDatesChange('startDueDate', e.target.value)}
                  className="w-full bg-white text-gray-900 pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />

                <div className="flex items-center justify-center text-m text-gray-500">até</div>

                <input
                  type="date"
                  value={formatDateForInput(dates.endDueDate)}
                  onChange={(e) => handleDatesChange('endDueDate', e.target.value)}
                  className="w-full bg-white text-gray-900 pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {dataErrors.dueDate && <p className="text-red-500 text-sm mt-2">{dataErrors.dueDate}</p>}
            </div>
          </div>

          {/* Botão Filtrar */}
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

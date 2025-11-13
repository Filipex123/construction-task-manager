import { Summary, Tarefa } from '@/app/types';
import { ChartNoAxesCombined, ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';

interface SummaryBarProps {
  summaries: Summary | null;
  totalCost: number;
  filteredTarefas: Tarefa[];
  openSummary: boolean;
  setOpenSummary: React.Dispatch<React.SetStateAction<boolean>>;
  formatCurrency: (value: number) => string;
  isMeasure: boolean;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({ summaries, totalCost, filteredTarefas, openSummary, setOpenSummary, formatCurrency, isMeasure }) => {
  // Define status list based on isMeasure
  const statusList = isMeasure
    ? [
        { label: 'medido', color: 'bg-green-500' },
        { label: 'em andamento', color: 'bg-blue-500' },
        { label: 'pendente', color: 'bg-yellow-500' },
        { label: 'retido', color: 'bg-red-500' },
      ]
    : [
        { label: 'pago', color: 'bg-green-500' },
        { label: 'em andamento', color: 'bg-blue-500' },
        { label: 'pendente', color: 'bg-yellow-500' },
        { label: 'atrasado', color: 'bg-red-500' },
      ];

  return (
    <div className="px-6 py-3 bg-gray-50 border-b">
      {/* Header (visível no mobile como botão) */}
      <div className="flex justify-between items-center sm:hidden">
        <div className="flex flex-row items-center space-x-2">
          <ChartNoAxesCombined className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Resumo</span>
        </div>
        <button onClick={() => setOpenSummary(!openSummary)} className="text-gray-600 hover:bg-gray-100">
          {openSummary ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Conteúdo expansível */}
      <div
        className={`
          transition-all duration-300 overflow-hidden
          ${openSummary ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0 sm:max-h-none sm:opacity-100 sm:mt-0'}
        `}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Valores */}
          <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-2 md:gap-4 mb-2 md:mb-0">
            <div className="flex flex-col md:flex-row items-center md:gap-2">
              <span className="text-sm text-gray-600">Valor Total:</span>
              <span className="text-md font-bold text-green-600">{formatCurrency(summaries?.ValorTotal ?? 0)}</span>
            </div>
            <div className="flex flex-col md:flex-row items-center md:gap-2">
              <span className="text-sm text-gray-600">Valor Filtrado:</span>
              <span className="text-md font-bold text-green-600">{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex flex-col md:flex-row items-center md:gap-2">
              <span className="text-sm text-gray-600">Valor Pago:</span>
              <span className="text-md font-bold text-green-600">{formatCurrency(summaries?.ValorPago || 0)}</span>
            </div>
            <div className="flex flex-col md:flex-row items-center md:gap-2">
              <span className="text-sm text-gray-600">Valor a Pagar:</span>
              <span className="text-md font-bold text-green-600">{formatCurrency(summaries?.ValorAPagar || 0)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex gap-2 justify-center space-x-4 text-sm text-black">
            {statusList.map((status) => (
              <span key={status.label} className="flex flex-col items-center space-y-1">
                <span className="text-xs">
                  {filteredTarefas.filter((t) => t.measurementStatus.toUpperCase() === status.label.replace(' ', '_').toUpperCase()).length} {status.label}
                </span>
                <div className={`w-full h-1 ${status.color} rounded-full`} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import { summariesService } from '@/app/services/summaryService';
import { GeneralSummary } from '@/app/types';
import { AlertTriangle, Building, CheckCircle, ChevronDown, Clock, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { Loader } from './Loader';

export const DashboardSummary: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [summaries, setSummaries] = useState<GeneralSummary | undefined>();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  const carregarSummary = async () => {
    setIsLoading(true);
    try {
      const data = await summariesService.listarGeral();
      setSummaries(data);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIsMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Componente de gráfico de pizza simples usando CSS
  const PieChart: React.FC<{
    percentage: number;
    color: string;
    size?: number;
  }> = ({ percentage, color, size = 60 }) => {
    const circumference = 2 * Math.PI * 18; // raio de 18
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 40 40" className="transform -rotate-90">
          {/* Círculo de fundo */}
          <circle cx="20" cy="20" r="18" fill="none" stroke="#e5e7eb" strokeWidth="4" />
          {/* Círculo de progresso */}
          <circle cx="20" cy="20" r="18" fill="none" stroke={color} strokeWidth="4" strokeDasharray={strokeDasharray} strokeLinecap="round" className="transition-all duration-300" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">{formatPercentage(percentage)}</span>
        </div>
      </div>
    );
  };

  const SummaryCard: React.FC<{
    title: string;
    value: number;
    total: number;
    percentage: number;
    color: string;
    bgColor: string;
    icon: React.ElementType;
    valueType: 'currency' | 'number';
  }> = ({ title, value, total, percentage, color, bgColor, icon: Icon, valueType }) => (
    <div className={`${bgColor} rounded-xl p-4 border-1 border-gray-200 border-opacity-20`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg bg-white/20`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <h3 className={`text-sm font-medium ${color}`}>{title}</h3>
        </div>
        <PieChart percentage={percentage} color={color.replace('text-', '#')} size={50} />
      </div>

      <div className="space-y-1">
        <p className={`text-2xl font-bold ${color}`}>{valueType === 'currency' ? formatCurrency(value) : value.toLocaleString()}</p>
        <p className={`text-xs opacity-75 ${color}`}>{`de ${total} total`}</p>
      </div>
    </div>
  );

  React.useEffect(() => {
    carregarSummary();

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div className="mb-8">
      <div className={`flex items-center justify-between mb-4 ${isMobile ? 'cursor-pointer' : ''}`} onClick={isMobile ? () => setIsExpanded(!isExpanded) : undefined}>
        <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <span>Resumo Geral</span>
        </h2>

        {/* Ícone de expandir somente no mobile */}
        {isMobile && <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
      </div>

      {/* SUBTÍTULO */}
      {!isMobile && <p className="text-gray-600 text-sm mb-4">Visão geral de todas as {summaries?.totalAtividades.total} obras</p>}

      {/* MOBILE: subtítulo dentro do conteúdo */}
      {isMobile && isExpanded && <p className="text-gray-600 text-sm mb-4">Visão geral de todas as {summaries?.totalAtividades.total} obras</p>}

      {(isExpanded || !isMobile) && (
        <div className="mb-8 text-xs text-gray-400 overflow-x-auto whitespace-nowrap touch-pan-x scrollbar-hide">
          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              title="Total de Atividades"
              value={summaries?.totalAtividades.total ?? 0}
              total={summaries?.totalAtividades.total ?? 0}
              percentage={summaries?.totalAtividades.percentage ?? 0}
              color="text-blue-700"
              bgColor="bg-blue-50"
              icon={Building}
              valueType="number"
            />

            <SummaryCard
              title="Em Andamento"
              value={summaries?.emAndamento.total ?? 0}
              total={summaries?.totalAtividades.total ?? 0}
              percentage={summaries?.emAndamento.percentage ?? 0}
              color="text-blue-700"
              bgColor="bg-blue-50"
              icon={Clock}
              valueType="number"
            />

            <SummaryCard
              title="Atrasadas"
              value={summaries?.atrasadas.total ?? 0}
              total={summaries?.totalAtividades.total ?? 0}
              percentage={summaries?.atrasadas.percentage ?? 0}
              color="text-red-700"
              bgColor="bg-red-50"
              icon={AlertTriangle}
              valueType="number"
            />

            <SummaryCard
              title="Concluídas"
              value={summaries?.concluidas.total ?? 0}
              total={summaries?.totalAtividades.total ?? 0}
              percentage={summaries?.concluidas.percentage ?? 0}
              color="text-green-700"
              bgColor="bg-green-50"
              icon={CheckCircle}
              valueType="number"
            />
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex-shrink-0 w-64">
                <SummaryCard
                  title="Total de Atividades"
                  value={summaries?.totalAtividades.total ?? 0}
                  total={summaries?.totalAtividades.total ?? 0}
                  percentage={100}
                  color="text-blue-700"
                  bgColor="bg-blue-50"
                  icon={Building}
                  valueType="number"
                />
              </div>

              <div className="flex-shrink-0 w-64">
                <SummaryCard
                  title="Em Andamento"
                  value={summaries?.emAndamento.total ?? 0}
                  total={summaries?.totalAtividades.total ?? 0}
                  percentage={summaries?.emAndamento.percentage ?? 0}
                  color="text-blue-700"
                  bgColor="bg-blue-50"
                  icon={Clock}
                  valueType="number"
                />
              </div>

              <div className="flex-shrink-0 w-64">
                <SummaryCard
                  title="Atrasadas"
                  value={summaries?.atrasadas.total ?? 0}
                  total={summaries?.totalAtividades.total ?? 0}
                  percentage={summaries?.atrasadas.percentage ?? 0}
                  color="text-red-700"
                  bgColor="bg-red-50"
                  icon={AlertTriangle}
                  valueType="number"
                />
              </div>

              <div className="flex-shrink-0 w-64">
                <SummaryCard
                  title="Concluídas"
                  value={summaries?.concluidas.total ?? 0}
                  total={summaries?.totalAtividades.total ?? 0}
                  percentage={summaries?.concluidas.percentage ?? 0}
                  color="text-green-700"
                  bgColor="bg-green-50"
                  icon={CheckCircle}
                  valueType="number"
                />
              </div>
            </div>
          </div>

          {/* Valores Financeiros */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium opacity-90">Valor Total</h4>
                <div className="bg-white/20 p-1 rounded">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(summaries?.totalAtividades.valorTotal!)}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium opacity-90">Em Andamento</h4>
                <div className="bg-white/20 p-1 rounded">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(summaries?.emAndamento.valorTotal!)}</p>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium opacity-90">Atrasado</h4>
                <div className="bg-white/20 p-1 rounded">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(summaries?.atrasadas.valorTotal!)}</p>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium opacity-90">Concluído</h4>
                <div className="bg-white/20 p-1 rounded">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(summaries?.concluidas.valorTotal!)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

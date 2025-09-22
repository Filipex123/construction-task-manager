import React from 'react';
import { Building, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Obra } from '@/app/types';

interface DashboardSummaryProps {
  obras: Obra[];
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ obras }) => {
  // Calcular estatísticas gerais
  const stats = React.useMemo(() => {
    const totalTarefas = obras.reduce((total, obra) => total + obra.tarefas.length, 0);
    const tarefasAtrasadas = obras.reduce((total, obra) => total + obra.tarefas.filter((t) => t.status === 'atrasada').length, 0);
    const tarefasEmAndamento = obras.reduce((total, obra) => total + obra.tarefas.filter((t) => t.status === 'em_andamento').length, 0);
    const tarefasConcluidas = obras.reduce((total, obra) => total + obra.tarefas.filter((t) => t.status === 'concluida').length, 0);
    const tarefasPendentes = obras.reduce((total, obra) => total + obra.tarefas.filter((t) => t.status === 'pendente').length, 0);

    const valorTotal = obras.reduce((total, obra) => total + obra.tarefas.reduce((obraTotal, tarefa) => obraTotal + tarefa.valor, 0), 0);
    const valorAtrasado = obras.reduce((total, obra) => total + obra.tarefas.filter((t) => t.status === 'atrasada').reduce((sum, t) => sum + t.valor, 0), 0);
    const valorEmAndamento = obras.reduce((total, obra) => total + obra.tarefas.filter((t) => t.status === 'em_andamento').reduce((sum, t) => sum + t.valor, 0), 0);
    const valorConcluido = obras.reduce((total, obra) => total + obra.tarefas.filter((t) => t.status === 'concluida').reduce((sum, t) => sum + t.valor, 0), 0);

    return {
      totalTarefas,
      tarefasAtrasadas,
      tarefasEmAndamento,
      tarefasConcluidas,
      tarefasPendentes,
      valorTotal,
      valorAtrasado,
      valorEmAndamento,
      valorConcluido,
      percentualAtrasadas: totalTarefas > 0 ? (tarefasAtrasadas / totalTarefas) * 100 : 0,
      percentualEmAndamento: totalTarefas > 0 ? (tarefasEmAndamento / totalTarefas) * 100 : 0,
      percentualConcluidas: totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0,
      percentualPendentes: totalTarefas > 0 ? (tarefasPendentes / totalTarefas) * 100 : 0,
    };
  }, [obras]);

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
    <div className={`${bgColor} rounded-xl p-4 border border-opacity-20`}>
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
        <p className={`text-xs opacity-75 ${color}`}>{valueType === 'currency' ? `de ${formatCurrency(total)} total` : `de ${total.toLocaleString()} total`}</p>
      </div>
    </div>
  );

  if (obras.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span>Resumo Geral</span>
          </h2>
          <p className="text-gray-600 text-sm">Visão geral de todas as {obras.length} obras</p>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Total de Atividades" value={stats.totalTarefas} total={stats.totalTarefas} percentage={100} color="text-blue-700" bgColor="bg-blue-50" icon={Building} valueType="number" />

        <SummaryCard
          title="Em Andamento"
          value={stats.tarefasEmAndamento}
          total={stats.totalTarefas}
          percentage={stats.percentualEmAndamento}
          color="text-blue-700"
          bgColor="bg-blue-50"
          icon={Clock}
          valueType="number"
        />

        <SummaryCard
          title="Atrasadas"
          value={stats.tarefasAtrasadas}
          total={stats.totalTarefas}
          percentage={stats.percentualAtrasadas}
          color="text-red-700"
          bgColor="bg-red-50"
          icon={AlertTriangle}
          valueType="number"
        />

        <SummaryCard
          title="Concluídas"
          value={stats.tarefasConcluidas}
          total={stats.totalTarefas}
          percentage={stats.percentualConcluidas}
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
              value={stats.totalTarefas}
              total={stats.totalTarefas}
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
              value={stats.tarefasEmAndamento}
              total={stats.totalTarefas}
              percentage={stats.percentualEmAndamento}
              color="text-blue-700"
              bgColor="bg-blue-50"
              icon={Clock}
              valueType="number"
            />
          </div>

          <div className="flex-shrink-0 w-64">
            <SummaryCard
              title="Atrasadas"
              value={stats.tarefasAtrasadas}
              total={stats.totalTarefas}
              percentage={stats.percentualAtrasadas}
              color="text-red-700"
              bgColor="bg-red-50"
              icon={AlertTriangle}
              valueType="number"
            />
          </div>

          <div className="flex-shrink-0 w-64">
            <SummaryCard
              title="Concluídas"
              value={stats.tarefasConcluidas}
              total={stats.totalTarefas}
              percentage={stats.percentualConcluidas}
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
          <p className="text-2xl font-bold">{formatCurrency(stats.valorTotal)}</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium opacity-90">Em Andamento</h4>
            <div className="bg-white/20 p-1 rounded">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.valorEmAndamento)}</p>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium opacity-90">Atrasado</h4>
            <div className="bg-white/20 p-1 rounded">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.valorAtrasado)}</p>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium opacity-90">Concluído</h4>
            <div className="bg-white/20 p-1 rounded">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.valorConcluido)}</p>
        </div>
      </div>
    </div>
  );
};

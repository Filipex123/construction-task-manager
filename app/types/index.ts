export interface Tarefa {
  id: string;
  local: string;
  atividade: string;
  unidade: string;
  quantidade: number;
  valor: number;
  empreiteira: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
  // Campos adicionais para detalhes
  statusPagamento?: string;
  statusMedidor?: string;
  quantidadeRealizada?: number;
  dataMedicao?: string;
  dataPagamentoPrevista?: string;
  dataPagamentoRealizada?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
  usuarioUltimaAtualizacao?: string;
}

export interface Obra {
  id: string;
  nome: string;
  descricao: string;
  dataInicio: string;
  tarefas: Tarefa[];
}

export type StatusColor = {
  [key in Tarefa['status']]: string;
};

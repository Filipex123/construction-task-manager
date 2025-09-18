export interface Tarefa {
  id: string;
  local: string;
  atividade: string;
  unidade: string;
  quantidade: number;
  valor: number;
  empreiteira: string;
  status?: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
  statusPagamento: 'em_andamento' | 'pendente' | 'pago' | 'atrasado';
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
  [key in Tarefa['statusPagamento']]: string;
};

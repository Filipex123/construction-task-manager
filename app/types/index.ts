export interface Tarefa {
  id: string;
  local: Local;
  atividade: string;
  unidade: string;
  quantidade: number;
  valor: number;
  empreiteira: string;
  status?: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
  statusPagamento: 'em_andamento' | 'pendente' | 'pago' | 'atrasado';
  statusMedicao: 'em_andamento' | 'pendente' | 'medido' | 'retencao';
  statusMedidor?: string;
  quantidadeRealizada?: number;
  dataMedicao?: string;
  dataPagamentoPrevista?: string;
  dataPagamentoRealizada?: string;
  dataCriacao?: string;
  dataLimite?: string;
  dataAtualizacao?: string;
  usuarioUltimaAtualizacao?: string;
}

export interface Local {
  id: string;
  name: string;
}
export interface Obra {
  id: string;
  nome: string;
  descricao: string;
  dataInicio: string;
  tarefas: Tarefa[];
}

export interface Empreiteira {
  id: string;
  entity?:string;
  name: string;
  cnpj?: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface UnidadeMedida {
  ID: string;
  complement: string;  
  description: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Atividades {
  ID: string;
  complement: string;  
  description: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type StatusColor = {
  [key in Tarefa['statusPagamento']]: string;
};

export type StatusColorMedicao = {
  [key in Tarefa['statusMedicao']]: string;
};

export interface PaymentData {
  id: number;
  local: string;
  atividade: string;
  unidade: string;
  quantidade: number;
  valor: number;
  empreiteira: string;
  dataLimite: string;
  dataPagamento: string;
  usuarioResponsavel: string;
  status: 'pago' | 'pendente' | 'atrasado';
}

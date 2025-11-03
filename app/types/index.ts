export interface Tarefa {
  id: number;
  location: Local;
  activity: Atividades;
  unitOfMeasure: UnidadeMedida;
  contractor: Empreiteira;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'EM_ANDAMENTO' | 'PENDENTE' | 'PAGO' | 'ATRASADO';
  measurementStatus: 'EM_ANDAMENTO' | 'PENDENTE' | 'MEDIDO' | 'RETIDO';
  quantityExecuted: number;
  measurementDate?: string;
  dueDate?: string;
  paymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface MeasureTarefa {
  quantityExecuted: number;
  quantity: number;
  measurementStatus: 'MEDIDO' | 'PENDENTE' | 'EM_ANDAMENTO' | 'RETIDO';
  measurementDate?: string;
  updatedBy?: string;
}

export interface AddTarefaRequest {
  quantity: number;
  totalAmount: number;
  paymentStatus: 'EM_ANDAMENTO' | 'PENDENTE' | 'PAGO' | 'ATRASADO';
  measurementStatus: 'EM_ANDAMENTO' | 'PENDENTE' | 'MEDIDO' | 'RETIDO';
  quantityExecuted: number;
  measurementDate?: string;
  dueDate: string;
  paymentDate?: string;
  updatedBy?: string;
  fkAtividade: number;
  fkLocal: number;
  fkUnidadeMedida: number;
  fkEmpreiteiro: number;
}

export interface LastKeyPagination {
  id: number;
  entity: string;
}

export interface Local {
  id?: number;
  name?: string;
  fkObra?: number;
  updatedAt?: string;
  updatedBy?: string;
  createdAt?: string;
}
export interface Obra {
  id?: number;
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Empreiteira {
  id?: number;
  name?: string;
  cnpj?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface UnidadeMedida {
  id?: number;
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Atividades {
  id?: number;
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface PageableResponse<T> {
  items: T[];
  count: number;
  totalCount: number;
  lastEvaluatedKey?: LastKeyPagination;
}

export type StatusColor = {
  [key in NonNullable<Tarefa['paymentStatus']>]: string;
};

export type StatusColorMedicao = {
  [key in NonNullable<Tarefa['measurementStatus']>]: string;
};

// will be descontinued
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

export enum PaymentStatusEnum {
  PAGO = 'PAGO',
  PENDENTE = 'PENDENTE',
  ATRASADO = 'ATRASADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
}

export enum MeasurementStatusEnum {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  MEDIDO = 'MEDIDO',
  RETIDO = 'RETIDO',
}

export type IdName = { id: string; name: string };
export type TaskIdName = { id: number; name: string };

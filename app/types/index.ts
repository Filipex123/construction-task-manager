export interface Tarefa {
  id: number;
  location: Local;
  activity: Atividades;
  unitOfMeasure: UnidadeMedida;
  contractor: Empreiteira;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'em_andamento' | 'pendente' | 'pago' | 'atrasado';
  measurementStatus: 'em_andamento' | 'pendente' | 'medido' | 'retencao';
  quantityExecuted: number;
  measurementDate?: string;
  dueDate: string;
  paymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
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
  total: number;
  page: number;
  size: number;
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

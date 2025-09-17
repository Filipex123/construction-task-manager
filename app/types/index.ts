export interface Tarefa {
  id: string;
  local: string;
  atividade: string;
  unidade: string;
  quantidade: number;
  valor: number;
  empreiteira: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
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

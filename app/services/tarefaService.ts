import { AddTarefaRequest, PageableResponse, Tarefa } from '@/app/types';
import { TarefaFilterParams } from '../(protected)/components/ObraFilters';
import { buildQueryString } from '../utils/buildQUeryStringParams';

const API_URL = 'https://116vebee4l.execute-api.us-east-1.amazonaws.com/prod/tarefas';

export const tarefaService = {
  async listar(obraId: number, params: TarefaFilterParams): Promise<PageableResponse<Tarefa>> {
    try {
      const urlParams = buildQueryString(params);

      const res = await fetch(`${API_URL}?idObra=${obraId}` + `&${urlParams.toString()}`, { cache: 'no-store' });

      if (!res.ok) throw new Error('Erro ao listar tarefas');

      return await res.json();
    } catch (error) {
      console.error('Erro ao listar tarefas:', error);
      return {
        items: [],
        count: 0,
        totalCount: 0,
      };
    }
  },

  async buscarPorId(id: string): Promise<Tarefa> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar tarefa');
    return res.json();
  },

  async criar(obraId: number, dados: AddTarefaRequest): Promise<Tarefa> {
    const res = await fetch(`${API_URL}?idObra=${obraId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao criar tarefa');

    const data = await res.json();
    return data.item;
  },

  async atualizar(id: number, dados: Partial<AddTarefaRequest>): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao atualizar tarefa');
    return;
  },

  async excluir(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir tarefa');
  },
};

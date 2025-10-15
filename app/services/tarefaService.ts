import { PageableResponse, Tarefa } from '@/app/types';

const API_URL = 'https://116vebee4l.execute-api.us-east-1.amazonaws.com/prod/tarefas';

export const tarefaService = {
  async listar(obraId: number): Promise<PageableResponse<Tarefa>> {
    const res = await fetch(`${API_URL}?idObra=${obraId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Erro ao listar tarefas');
    return res.json();
  },

  async buscarPorId(id: string): Promise<Tarefa> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar tarefa');
    return res.json();
  },

  async criar(dados: Omit<Tarefa, 'ID'>): Promise<void> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao criar tarefa');
  },

  async atualizar(id: string, dados: Partial<Tarefa>): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao atualizar tarefa');
  },

  async excluir(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir tarefa');
  },
};

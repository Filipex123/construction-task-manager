import { UnidadeMedida } from '@/app/types';

const API_URL = 'https://s9vh7o77o7.execute-api.us-east-1.amazonaws.com/prod/login';

export const unidadesService = {
  async listar(): Promise<UnidadeMedida[]> {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Erro ao listar unidades');
    return await res.json();
  },

  async criar(dados: Omit<UnidadeMedida, 'id'>): Promise<void> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao criar usuario');
  },

  async atualizar(id: number, dados: Partial<UnidadeMedida>): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao atualizar usuario');
  },

  async excluir(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir usuario');
  },
};

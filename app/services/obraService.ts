import { Obra, PageableResponse } from '@/app/types';

const API_URL = 'https://elalpwcip7.execute-api.us-east-1.amazonaws.com/prod/obra';

export const obraService = {
  async listar(): Promise<PageableResponse<Obra>> {
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('Erro ao listar obras');
      return res.json();
    } catch (error) {
      console.error('Erro ao listar obras:', error);
      return {
        items: [],
        total: 0,
        page: 0,
        size: 0,
      };
    }
  },

  async buscarPorId(id: string): Promise<Obra> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar obra');
    return res.json();
  },

  async criar(dados: Omit<Obra, 'ID'>): Promise<void> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao criar obra');
  },

  async atualizar(id: string, dados: Partial<Obra>): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao atualizar obra');
  },

  async excluir(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir obra');
  },
};

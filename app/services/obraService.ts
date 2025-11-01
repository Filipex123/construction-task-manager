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
        count: 0,
        totalCount: 0,
      };
    }
  },

  async buscarPorId(id: number): Promise<Obra> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar obra');
    return res.json();
  },

  async criar(dados: Omit<Obra, 'ID'>): Promise<Obra> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao criar obra');

    const data = await res.json();
    return data.item;
  },

  async atualizar(id: number, dados: Partial<Obra>): Promise<Obra> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao atualizar obra');

    const { data } = await res.json();
    return data;
  },

  async excluir(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir obra');
  },
};

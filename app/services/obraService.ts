import { Obra, PageableResponse } from '@/app/types';

const API_URL = 'https://elalpwcip7.execute-api.us-east-1.amazonaws.com/prod/obra';

export const obraService = {
  async listar(): Promise<PageableResponse<Obra>> {
    try {
      const idUsuario = Number(localStorage.getItem('idUsuario'));
      const res = await fetch(`${API_URL}?idUsuario=${idUsuario}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Erro ao listar obras');
      return res.json();
    } catch (error) {
      console.error('Erro ao listar obras:', error);
      return {
        items: [],
        count: 0,
        totalCount: 0,
        totalCost: 0,
      };
    }
  },

  async listarSimplificado(): Promise<Obra[]> {
    try {
      const idUsuario = Number(localStorage.getItem('idUsuario'));
      const res = await fetch(`${API_URL}?idUsuario=${idUsuario}`, { cache: 'no-store' });

      if (!res.ok) throw new Error('Erro ao listar obras');

      const data = await res.json();

      // Caso venha no formato PageableResponse
      if (Array.isArray(data?.content)) {
        return data.content;
      }

      // Caso a API venha em outro formato (compatibilidade futura)
      if (Array.isArray(data?.items)) {
        return data.items;
      }

      // Se nada bater, garantir um array vazio
      return [];
    } catch (error) {
      console.error('Erro ao listar obras:', error);
      return [];
    }
  },

  async criar(dados: Omit<Obra, 'ID'>): Promise<Obra> {
    const idUsuario = Number(localStorage.getItem('idUsuario'));
    const res = await fetch(`${API_URL}?idUsuario=${idUsuario}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao criar obra');

    return await res.json();
  },

  async atualizar(id: number, dados: Partial<Obra>): Promise<Obra> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao atualizar obra');

    const data = await res.json();

    return data;
  },

  async excluir(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir obra');
  },
};

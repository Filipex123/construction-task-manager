import { Local, PageableResponse } from '@/app/types';

const API_URL = 'https://zernov6ywj.execute-api.us-east-1.amazonaws.com/prod/locais';

export const localService = {
  async listar(idObra?: number): Promise<PageableResponse<Local>> {
    try {
      const url = idObra ? `${API_URL}?idObra=${idObra}` : API_URL;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Erro ao listar local');
      return res.json();
    } catch (error) {
      console.error('Erro ao listar locais:', error);
      return {
        items: [],
        count: 0,
        totalCount: 0,
      };
    }
  },

  async buscarPorId(id: string): Promise<Local> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar local');
    return res.json();
  },

  async criar(dados: Omit<Local, 'id'>): Promise<Local> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao criar local');

    const data = await res.json();
    return data.item;
  },

  async atualizar(id: number, dados: Partial<Local>): Promise<Local> {
    try {
    } catch (error) {
      console.error('Erro ao atualizar local:', error);
      throw error;
    }
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao atualizar local: ' + res.statusText);

    const { data } = await res.json();
    return data;
  },

  async excluir(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir local');
  },
};

import { Atividades } from '@/app/types';

const API_URL = 'https://8dg3v1avkb.execute-api.us-east-1.amazonaws.com/prod/atividades';

export const atividadesService = {
  async listar(): Promise<Atividades[]> {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Erro ao listar unidades');
    return res.json();
  },

  async buscarPorId(id: string): Promise<Atividades> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar unidade');
    return res.json();
  },

  async criar(dados: Omit<Atividades, 'ID'>): Promise<void> {    
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao criar unidade');
  },

  async atualizar(id: string, dados: Partial<Atividades>): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao atualizar unidade');
  },

  async excluir(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir unidade');
  },
};

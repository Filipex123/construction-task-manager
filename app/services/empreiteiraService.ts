import { Empreiteira } from '@/app/types';

const API_URL = 'https://kizi7kxvm0.execute-api.us-east-1.amazonaws.com/prod/empreiteiras';

export const empreiteraService = {
  async listar(): Promise<Empreiteira[]> {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Erro ao listar unidades');
    return res.json();
  },

  async buscarPorId(id: string): Promise<Empreiteira> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar unidade');
    return res.json();
  },

  async criar(dados: Omit<Empreiteira, 'id'>): Promise<void> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao criar unidade');
  },

  async atualizar(id: number, dados: Partial<Empreiteira>): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao atualizar unidade');
  },

  async excluir(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir unidade');
  },
};

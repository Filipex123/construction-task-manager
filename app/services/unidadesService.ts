import { UnidadeMedida } from '@/app/types';

const API_URL = 'https://nowtgniebi.execute-api.us-east-1.amazonaws.com/prod/unidadesdemedida';

export const unidadesService = {
  async listar(): Promise<UnidadeMedida[]> {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Erro ao listar unidades');
    return await res.json();
  },

  async buscarPorId(id: number): Promise<UnidadeMedida> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar unidade');
    return res.json();
  },

  async criar(dados: Omit<UnidadeMedida, 'id'>): Promise<void> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao criar unidade');
  },

  async atualizar(id: number, dados: Partial<UnidadeMedida>): Promise<void> {
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

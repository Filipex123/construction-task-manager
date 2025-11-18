import { LocaisNiveis, Local, PageableResponse } from '@/app/types';

const API_URL = 'https://zernov6ywj.execute-api.us-east-1.amazonaws.com/prod/locais';

export const localService = {
  async listar(idObra?: number, nivel?: number): Promise<PageableResponse<Local>> {
    const url = nivel ? `${API_URL}?idObra=${idObra}&nivel=${nivel}` : idObra ? `${API_URL}?idObra=${idObra}` : API_URL;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Erro ao listar local');
      return await res.json();
    } catch (error) {
      console.error('Erro ao listar locais:', error);
      return {
        items: [],
        count: 0,
        totalCount: 0,
        totalCost: 0,
      };
    }
  },

  async listarNiveis(idObra?: number): Promise<LocaisNiveis | undefined> {
    try {
      const nvs = [1, 2, 3, 4];
      const url = `${API_URL}?idObra=${idObra}&nivel=`;

      const niveis = await Promise.all(
        nvs.map(async (nv) => {
          const res = await fetch(url + nv, { cache: 'no-store' });

          if (!res.ok) throw new Error('Erro ao listar local');
          const jsonres = await res.json();
          return jsonres.items;
        })
      );

      return {
        nivel1: niveis[0],
        nivel2: niveis[1],
        nivel3: niveis[2],
        nivel4: niveis[3],
      };
    } catch (error) {
      console.error('Erro ao listar locais:', error);
      return;
    }
  },

  async buscarPorId(id: string): Promise<Local> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar local');
    return res.json();
  },

  async criar(dados: Omit<Local, 'id'>, nivel: number): Promise<Local> {
    const nivelUrl = nivel ? `${API_URL}?nivel=${nivel}` : API_URL;
    const res = await fetch(nivelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao criar local');

    const data = await res.json();
    return data;
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

    return await res.json();
  },

  async excluir(id: number, nivel: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}?nivel=${nivel}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir local');
  },
};

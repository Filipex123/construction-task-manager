import { GeneralSummary, ObraSummary } from '../types';

const API_URL = 'https://s9vh7o77o7.execute-api.us-east-1.amazonaws.com/prod/summaries';

export const summariesService = {
  async listar(idObra: number): Promise<ObraSummary> {
    const res = await fetch(`${API_URL}?idObra=${idObra}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Erro ao listar atividades');

    return await res.json();
  },

  async listarGeral(): Promise<GeneralSummary> {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Erro ao listar atividades');

    return await res.json();
  },
};

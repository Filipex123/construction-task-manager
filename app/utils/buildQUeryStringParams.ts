'use client';

import { TarefaFilterParams } from '../(protected)/components/ObraFilters';

export function buildQueryString(params: TarefaFilterParams): string {
  const queryEntries = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${encodeURIComponent(key)}=${value.map((v) => encodeURIComponent(v)).join(',')}`;
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`;
    });

  return queryEntries.length > 0 ? `${queryEntries.join('&')}` : '';
}

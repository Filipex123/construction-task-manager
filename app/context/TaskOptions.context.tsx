'use client';

import { Atividades, Empreiteira, LocaisNiveis, UnidadeMedida } from '@/app/types';
import React, { createContext, useCallback, useContext, useState } from 'react';

import { atividadesService } from '@/app/services/atividadesService';
import { empreiteraService } from '@/app/services/empreiteiraService';
import { localService } from '@/app/services/localService';
import { unidadesService } from '@/app/services/unidadesService';

interface TaskOptionsContextData {
  locais?: LocaisNiveis;
  atividades: Atividades[];
  unidades: UnidadeMedida[];
  empreiteiras: Empreiteira[];
  loading: boolean;
  loadOptions: (obraId: number) => Promise<void>;
}

const TaskOptionsContext = createContext<TaskOptionsContextData | undefined>(undefined);

export const TaskOptionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locais, setLocais] = useState<LocaisNiveis>();
  const [atividades, setAtividades] = useState<Atividades[]>([]);
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([]);
  const [empreiteiras, setEmpreiteiras] = useState<Empreiteira[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOptions = useCallback(
    async (obraId: number) => {
      if (loading) return;

      if (locais && atividades.length && unidades.length && empreiteiras.length) {
        return;
      }

      setLoading(true);
      try {
        const [fLocais, fAtividades, fUnidades, fEmpreiteiras] = await Promise.all([
          localService.listarNiveis(obraId),
          atividadesService.listar(),
          unidadesService.listar(),
          empreiteraService.listar(),
        ]);

        setLocais(fLocais);
        setAtividades(fAtividades);
        setUnidades(fUnidades);
        setEmpreiteiras(fEmpreiteiras);
      } catch (error) {
        console.error('Erro ao carregar opções de tarefa', error);
      } finally {
        setLoading(false);
      }
    },
    [locais, atividades, unidades, empreiteiras, loading]
  );

  return (
    <TaskOptionsContext.Provider
      value={{
        locais,
        atividades,
        unidades,
        empreiteiras,
        loading,
        loadOptions,
      }}
    >
      {children}
    </TaskOptionsContext.Provider>
  );
};

export const useTaskOptions = () => {
  const context = useContext(TaskOptionsContext);
  if (!context) {
    throw new Error('useTaskOptions deve ser usado dentro de TaskOptionsProvider');
  }
  return context;
};

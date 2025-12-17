'use client';

import { obraService } from '@/app/services/obraService';
import { Obra } from '@/app/types';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface ObrasContextData {
  obras: Obra[];
  isLoading: boolean;
  reload: () => Promise<void>;
  setObras: React.Dispatch<React.SetStateAction<Obra[]>>;
}

const ObrasContext = createContext<ObrasContextData | null>(null);

export const ObrasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const hasLoadedRef = useRef(false);

  const carregarObras = async () => {
    setIsLoading(true);
    try {
      const data = await obraService.listar();
      setObras(data.items || []);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    carregarObras();
  }, []);

  return (
    <ObrasContext.Provider
      value={{
        obras,
        isLoading,
        reload: carregarObras,
        setObras,
      }}
    >
      {children}
    </ObrasContext.Provider>
  );
};

export const useObras = () => {
  const context = useContext(ObrasContext);
  if (!context) {
    throw new Error('useObras deve ser usado dentro de ObrasProvider');
  }
  return context;
};

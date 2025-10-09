'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface PageTitleContextType {
  title: string;
  setTitle: (title: string) => void;
  subtitle: string;
  setSubtitle: (subtitle: string) => void;
  descrition: string;
  setDescription: (description: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [descrition, setDescription] = useState('');
  return <PageTitleContext.Provider value={{ title, subtitle, setTitle, setSubtitle, descrition, setDescription }}>{children}</PageTitleContext.Provider>;
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (!context) throw new Error('usePageTitle deve ser usado dentro de um PageTitleProvider');
  return context;
}

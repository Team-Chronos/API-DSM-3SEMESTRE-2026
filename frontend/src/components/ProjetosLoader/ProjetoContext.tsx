import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Projeto {
  id: number;
  nome: string;
  codigo: string;
  tipoProjeto: string;
  valorHoraBase: number;
  horasContratadas: number;
  dataInicio: string;
  dataFim: string;
  responsavelId: number;
}

interface ProjetoContextType {
  projeto: Projeto | null;
  setProjeto: (projeto: Projeto | null) => void;
}

const ProjetoContext = createContext<ProjetoContextType | undefined>(undefined);

export function ProjetoProvider({ children }: { children: ReactNode }) {
  const [projeto, setProjeto] = useState<Projeto | null>(null);

  return (
    <ProjetoContext.Provider value={{ projeto, setProjeto }}>
      {children}
    </ProjetoContext.Provider>
  );
}

export function useProjetoContext() {
  const context = useContext(ProjetoContext);
  if (!context) {
    throw new Error('useProjetoContext must be used within a ProjetoProvider');
  }
  return context;
}
import { useCallback, useEffect, useRef, useState } from "react";
// import { apiAuditoria } from "../lib/apiAuditoria";
import { auditoriaMock } from "../mocks/auditoriaMock";
import type { AuditoriaModulo, AuditoriaRegistro } from "../types/auditoria";

interface UseAuditoriaResult {
  registros: AuditoriaRegistro[];
  loading: boolean;
  carregandoInicial: boolean;
  atualizando: boolean;
  error: string | null;
  indisponivel: boolean;
  mensagemIndisponivel: string | null;
  recarregar: () => Promise<void>;
}

function aguardarMock(ms = 250): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function ordenarPorDataMaisRecente(registros: AuditoriaRegistro[]): AuditoriaRegistro[] {
  return [...registros].sort((a, b) => {
    const dataA = new Date(a.dataHora).getTime();
    const dataB = new Date(b.dataHora).getTime();

    if (Number.isNaN(dataA) && Number.isNaN(dataB)) {
      return Number(b.codigo) - Number(a.codigo);
    }

    if (Number.isNaN(dataA)) {
      return 1;
    }

    if (Number.isNaN(dataB)) {
      return -1;
    }

    return dataB - dataA;
  });
}

function filtrarMockPorModulo(modulo: AuditoriaModulo): AuditoriaRegistro[] {
  const registros = modulo === "todos"
    ? auditoriaMock
    : auditoriaMock.filter((registro) => registro.modulo === modulo);

  return ordenarPorDataMaisRecente(registros);
}

export function useAuditoria(modulo: AuditoriaModulo): UseAuditoriaResult {
  const [registros, setRegistros] = useState<AuditoriaRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const possuiDadosRef = useRef(false);

  const carregar = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const possuiDados = possuiDadosRef.current;

    try {
      setLoading(true);
      setError(null);

      if (possuiDados) {
        setAtualizando(true);
      } else {
        setCarregandoInicial(true);
      }

      await aguardarMock();

      const response = filtrarMockPorModulo(modulo);
      // const response = await apiAuditoria.listarTarefas();

      if (requestId !== requestIdRef.current) {
        return;
      }

      setRegistros(response);
      possuiDadosRef.current = true;
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setRegistros([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar auditoria");
    } finally {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setLoading(false);
      setCarregandoInicial(false);
      setAtualizando(false);
    }
  }, [modulo]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return {
    registros,
    loading,
    carregandoInicial,
    atualizando,
    error,
    indisponivel: false,
    mensagemIndisponivel: null,
    recarregar: carregar,
  };
}

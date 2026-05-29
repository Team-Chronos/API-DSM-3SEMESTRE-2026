import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiAuditoria } from "../lib/apiAuditoria";
import type { AuditoriaRegistro } from "../types/auditoria";

interface UseAuditoriaResult {
  registros: AuditoriaRegistro[];
  loading: boolean;
  carregandoInicial: boolean;
  atualizando: boolean;
  error: string | null;
  recarregar: () => Promise<void>;
}

function extrairMensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const resposta = error.response?.data as { message?: string; erro?: string } | string | undefined;

    if (typeof resposta === "string") {
      return resposta;
    }

    return resposta?.message || resposta?.erro || error.message || "Erro ao carregar auditoria";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro ao carregar auditoria";
}

export function useAuditoria(): UseAuditoriaResult {
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

    try {
      setLoading(true);
      setError(null);

      if (possuiDadosRef.current) {
        setAtualizando(true);
      } else {
        setCarregandoInicial(true);
      }

      const response = await apiAuditoria.listarTodas();

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
      setError(extrairMensagemErro(err));
    } finally {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setLoading(false);
      setCarregandoInicial(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return {
    registros,
    loading,
    carregandoInicial,
    atualizando,
    error,
    recarregar: carregar,
  };
}

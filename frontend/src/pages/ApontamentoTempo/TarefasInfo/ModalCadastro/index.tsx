import type React from "react";
import Modal from "../../../../components/Modal";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import apiApontamento from "../../../../services/apiApontamento";
import apiTarefas from "../../../../services/apiTarefas";

interface ModalCadastroProps {
  tempoMaximoMinutos: number;
  tempoRegistradoMinutos: number;
  tarefaId: number;
  open: boolean;
  reloadTarefas: () => Promise<void>;
  reloadRegistros: () => Promise<void>;
  onClose: () => void;
}

type Form = {
  data_inicio: string;
  data_fim?: string;
};

function ModalCadastro({
  tempoMaximoMinutos,
  tempoRegistradoMinutos,
  tarefaId,
  open,
  reloadTarefas,
  reloadRegistros,
  onClose,
}: ModalCadastroProps) {
  const [form, setForm] = useState<Form>({ data_inicio: "" });
  const [erroDataInicio, setErroDataInicio] = useState<string | null>(null);
  const [erroDataFim, setErroDataFim] = useState<string | null>(null);
  const [erroDuracao, setErroDuracao] = useState<string | null>(null);
  const [duracaoMinutos, setDuracaoMinutos] = useState<number>(0);
  const [enviando, setEnviando] = useState(false);

  const tempoRestanteMinutos = tempoMaximoMinutos - tempoRegistradoMinutos;

  function limpar() {
    setForm({ data_inicio: "", data_fim: "" });
    setErroDataInicio(null);
    setErroDataFim(null);
    setErroDuracao(null);
    setDuracaoMinutos(0);
  }

  const formatarTempo = (minutos?: number | null) => {
    const total = Number(minutos ?? 0);
    if (!total || total <= 0) return "0h";
    const horas = Math.floor(total / 60);
    const resto = total % 60;
    if (horas === 0) return `${resto}min`;
    if (resto === 0) return `${horas}h`;
    return `${horas}h ${resto}min`;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const calcularDuracao = (data_inicio: string | Date, data_fim: string | Date): number => {
    return Math.round(
      (new Date(data_fim).getTime() - new Date(data_inicio).getTime()) / 60000,
    );
  };

  const validarData = (data_inicio: string | Date, data_fim: string | Date): boolean => {
    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    if (fim <= inicio) {
      setErroDataFim("A data de término não pode ser igual ou menor que a data de início");
      return false;
    }
    setErroDataFim(null);
    return true;
  };

  const validarDuracao = (duracao: number): boolean => {
    if (duracao > tempoRestanteMinutos) {
      setErroDuracao("A duração não pode ser maior que o tempo restante");
      return false;
    }
    setErroDuracao(null);
    return true;
  };

  const atualizarStatusTarefa = async (novoTempoTotal: number) => {
    let novoStatus: string;

    if (novoTempoTotal >= tempoMaximoMinutos) {
      novoStatus = "CONCLUIDA";
    } else if (novoTempoTotal > 0) {
      novoStatus = "EM_ANDAMENTO";
    } else {
      return;
    }

    try {
      await apiTarefas.patch(
        `/tarefas/${tarefaId}/status`,
        `"${novoStatus}"`,
        { headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.data_inicio) {
      setErroDataInicio("A data de início não pode ser nula");
      return;
    }

    if (form.data_fim) {
      const duracao = calcularDuracao(form.data_inicio, form.data_fim);
      if (!validarData(form.data_inicio, form.data_fim)) return;
      if (!validarDuracao(duracao)) return;
    }

    if (!tarefaId) {
      toast.error("Erro interno: tarefa não identificada");
      return;
    }

    const data = {
      data_inicio: new Date(form.data_inicio).toISOString(),
      data_fim: form.data_fim ? new Date(form.data_fim).toISOString() : undefined,
      tarefa_id: tarefaId,
    };

    setEnviando(true);

    try {
      await toast.promise(apiApontamento.post("/registros", data), {
        pending: "Registrando tempo...",
        success: "Tempo registrado com sucesso!",
        error: "Erro ao registrar tempo",
      });

      const novoTempoTotal = form.data_fim
        ? tempoRegistradoMinutos + calcularDuracao(form.data_inicio, form.data_fim)
        : tempoRegistradoMinutos + 1;

      await atualizarStatusTarefa(novoTempoTotal);
      await reloadTarefas();
      await reloadRegistros();
      limpar();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao enviar formulário");
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    if (!form.data_inicio) {
      setErroDataInicio(null);
    }

    if (!form.data_inicio || !form.data_fim) {
      setErroDataFim(null);
      setErroDuracao(null);
      setDuracaoMinutos(0);
      return;
    }

    const duracao = calcularDuracao(form.data_inicio, form.data_fim);
    validarData(form.data_inicio, form.data_fim);
    validarDuracao(duracao);
    setDuracaoMinutos(duracao);
  }, [form.data_inicio, form.data_fim]);

  const podeEnviar = useMemo(() => {
    return (
      !!form.data_inicio &&
      !erroDataFim &&
      !erroDataInicio &&
      !erroDuracao &&
      !enviando
    );
  }, [form.data_inicio, erroDataFim, erroDataInicio, erroDuracao, enviando]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[min(92vw,520px)] text-white">
        <div className="pr-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300/80">
            Apontamento
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Registro de tempo</h1>
          <p className="mt-1 text-sm text-slate-400">
            Informe o início e, se quiser, o término do trabalho realizado.
          </p>
        </div>

        <div className="my-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#1f1f24] p-4">
            <p className="text-xs text-slate-500">Tempo máximo</p>
            <p className="mt-1 text-lg font-bold text-white">
              {formatarTempo(tempoMaximoMinutos)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#6627cc]/25 bg-[#6627cc]/10 p-4">
            <p className="text-xs text-violet-200/70">Tempo restante</p>
            <p className="mt-1 text-lg font-bold text-white">
              {formatarTempo(tempoRestanteMinutos)}
            </p>
          </div>
        </div>

        <form id="formRegistroHoras" onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-y-2">
            <label htmlFor="data_inicio" className="text-sm font-semibold text-slate-300">
              Data de início
            </label>
            <input
              type="datetime-local"
              id="data_inicio"
              name="data_inicio"
              required
              value={form.data_inicio}
              onChange={handleFormChange}
              className={`h-11 rounded-2xl border ${
                erroDataInicio ? "border-red-500" : "border-white/10"
              } bg-[#1a1a20] px-4 text-sm text-white outline-none transition focus:border-[#6627cc]/60 focus:ring-2 focus:ring-[#6627cc]/20`}
            />
            {erroDataInicio && (
              <span className="text-sm text-red-400">{erroDataInicio}</span>
            )}
          </div>

          <div className="flex flex-col gap-y-2">
            <label htmlFor="data_fim" className="text-sm font-semibold text-slate-300">
              Data de término
            </label>
            <input
              type="datetime-local"
              id="data_fim"
              name="data_fim"
              value={form.data_fim || ""}
              onChange={handleFormChange}
              min={form.data_inicio}
              readOnly={!form.data_inicio}
              className={`h-11 rounded-2xl border ${
                erroDataFim ? "border-red-500" : "border-white/10"
              } bg-[#1a1a20] px-4 text-sm text-white outline-none transition read-only:cursor-not-allowed read-only:opacity-60 focus:border-[#6627cc]/60 focus:ring-2 focus:ring-[#6627cc]/20`}
            />
            {erroDataFim && (
              <span className="text-sm text-red-400">{erroDataFim}</span>
            )}
          </div>

          <div className="flex flex-col gap-y-2">
            <label htmlFor="tempoMinutos" className="text-sm font-semibold text-slate-300">
              Duração
            </label>
            <input
              type="text"
              id="tempoMinutos"
              readOnly
              value={duracaoMinutos ? formatarTempo(duracaoMinutos) : ""}
              placeholder="Calculada automaticamente"
              className={`h-11 rounded-2xl border ${
                erroDuracao ? "border-red-500" : "border-white/10"
              } bg-[#1a1a20] px-4 text-sm text-white outline-none opacity-75 placeholder:text-slate-500`}
            />
            {erroDuracao && (
              <span className="text-sm text-red-400">{erroDuracao}</span>
            )}
          </div>
        </form>

        <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="formRegistroHoras"
            disabled={!podeEnviar}
            className="h-11 rounded-2xl bg-[#6627cc] px-5 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-[#7634dd] disabled:pointer-events-none disabled:select-none disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ModalCadastro;
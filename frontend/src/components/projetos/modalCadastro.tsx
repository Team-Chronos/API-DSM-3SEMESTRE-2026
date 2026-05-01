import { useEffect, useState } from "react";
import ModalBase from "../modais/ModalBase";
import { projetoService, profissionaisService } from "../../services/gateway";
import { toastError, toastSuccess } from "../../utils/toastUtils";

interface ModalCadastroProps {
  aberto: boolean;
  onFechar: () => void;
  onProjetoCadastrado?: () => void;
}

interface Profissional {
  id: number;
  nome: string;
}

export default function ModalCadastro({
  aberto,
  onFechar,
  onProjetoCadastrado,
}: ModalCadastroProps) {
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    tipoProjeto: "",
    valorHoraBase: 0,
    horasContratadas: 0,
    dataInicio: "",
    dataFim: "",
    responsavelId: 0,
  });

  const [profissionais, setProfissionais] = useState<Profissional[]>([]);

  useEffect(() => {
    if (!aberto) return;

    profissionaisService
      .listar()
      .then((r) => r.json())
      .then(setProfissionais)
      .catch((e) => console.error("Erro ao buscar profissionais", e));
  }, [aberto]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const limparForm = () => {
    setFormData({
      nome: "",
      codigo: "",
      tipoProjeto: "",
      valorHoraBase: 0,
      horasContratadas: 0,
      dataInicio: "",
      dataFim: "",
      responsavelId: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const payload = {
        nome: formData.nome,
        codigo: formData.codigo,
        tipoProjeto: formData.tipoProjeto,
        valorHoraBase: Number(formData.valorHoraBase),
        horasContratadas:
          formData.tipoProjeto === "HORA_FECHADA"
            ? Number(formData.horasContratadas)
            : null,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        responsavelId: Number(formData.responsavelId),
      };

      const response = await projetoService.criar(payload);

      if (!response.ok) {
        toastError("Erro ao cadastrar. Verifique os dados.");
        return;
      }

      toastSuccess("Projeto cadastrado com sucesso!");
      limparForm();
      onProjetoCadastrado?.();
      onFechar();
    } catch (error) {
      console.error("Erro na requisição:", error);
      toastError("Erro ao cadastrar projeto. Tente novamente.");
    }
  };

  return (
    <ModalBase
      aberto={aberto}
      onFechar={onFechar}
      titulo="Adicionar Novo Projeto"
      subtitulo="Preencha os dados para cadastrar um novo projeto."
      larguraClasse="max-w-2xl"
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <label className="mb-1 block font-semibold text-white">
            Nome do Projeto
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#3d3d40] p-3 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
          />
        </div>

        <div>
          <label className="mb-1 block font-semibold text-white">
            Código do Projeto
          </label>
          <input
            type="text"
            value={formData.codigo}
            onChange={(e) => handleChange("codigo", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#3d3d40] p-3 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
          />
        </div>

        <div>
          <label className="mb-1 block font-semibold text-white">Tipo</label>
          <select
            value={formData.tipoProjeto}
            onChange={(e) => handleChange("tipoProjeto", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#3d3d40] p-3 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
          >
            <option value="">Selecione</option>
            <option value="HORA_FECHADA">Hora Fechada</option>
            <option value="ALOCACAO">Alocação</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-semibold text-white">
            Valor Hora Base
          </label>
          <input
            type="number"
            value={formData.valorHoraBase}
            onChange={(e) =>
              handleChange("valorHoraBase", Number(e.target.value))
            }
            className="w-full rounded-lg border border-white/10 bg-[#3d3d40] p-3 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
          />
        </div>

        <div>
          <label className="mb-1 block font-semibold text-white">
            Horas Contratadas
          </label>
          <input
            type="number"
            value={formData.horasContratadas}
            onChange={(e) =>
              handleChange("horasContratadas", Number(e.target.value))
            }
            disabled={formData.tipoProjeto !== "HORA_FECHADA"}
            className="w-full rounded-lg border border-white/10 bg-[#3d3d40] p-3 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-1 block font-semibold text-white">
            Data de Início
          </label>
          <input
            type="date"
            value={formData.dataInicio}
            onChange={(e) => handleChange("dataInicio", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#3d3d40] p-3 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
          />
        </div>

        <div>
          <label className="mb-1 block font-semibold text-white">
            Data Fim
          </label>
          <input
            type="date"
            value={formData.dataFim}
            onChange={(e) => handleChange("dataFim", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#3d3d40] p-3 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block font-semibold text-white">
            Responsável
          </label>
          <select
            value={formData.responsavelId}
            onChange={(e) =>
              handleChange("responsavelId", Number(e.target.value))
            }
            className="w-full rounded-lg border border-white/10 bg-[#3d3d40] p-3 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
          >
            <option value={0}>Selecione</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/15"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="rounded-xl bg-linear-to-r from-[#6627cc] to-[#4a1898] px-5 py-3 font-medium text-white transition hover:brightness-110"
          >
            Adicionar
          </button>
        </div>
      </form>
    </ModalBase>
  );
}

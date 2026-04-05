import { useEffect, useState } from "react";

function ModalCadastro({ fecharModal }: { fecharModal: () => void }) {
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    tipoProjeto: "",
    valorHoraBase: 0,
    horasContratadas: 0,
    dataInicio: "",
    dataFim: "",
    responsavelId: 0
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") fecharModal();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [fecharModal]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      responsavelId: 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/projetos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Projeto cadastrado com sucesso!");
        limparForm();
        fecharModal();
      } else {
        alert("Erro ao cadastrar. Verifique os dados.");
        console.log(formData);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-start justify-center overflow-y-auto p-4 z-50"
      onClick={fecharModal}
    >
      <div
        className="bg-[#1b1b1f] text-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-texto font-semibold text-lg">
            Adicionar Novo Projeto
          </h2>

          <button
            onClick={fecharModal}
            className="text-gray-300 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block font-semibold mb-1">
              Nome do Projeto
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="w-full p-2 rounded bg-[#3d3d40] border border-mist-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Código do Projeto
            </label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => handleChange("codigo", e.target.value)}
              className="w-full p-2 rounded bg-[#3d3d40] border border-mist-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Tipo</label>
            <select
              value={formData.tipoProjeto}
              onChange={(e) =>
                handleChange("tipoProjeto", e.target.value)
              }
              className="w-full p-2 rounded bg-[#3d3d40] border border-mist-500"
            >
              <option value="">Selecione</option>
              <option value="HORA_FECHADA">Hora Fechada</option>
              <option value="ALOCACAO">Alocação</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Valor Hora Base
            </label>
            <input
              type="number"
              value={formData.valorHoraBase}
              onChange={(e) =>
                handleChange("valorHoraBase", Number(e.target.value))
              }
              className="w-full p-2 rounded bg-[#3d3d40] border border-mist-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Horas Contratadas
            </label>
            <input
              type="number"
              value={formData.horasContratadas}
              onChange={(e) =>
                handleChange("horasContratadas", Number(e.target.value))
              }
              className="w-full p-2 rounded bg-[#3d3d40] border border-mist-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Data de Início
            </label>
            <input
              type="date"
              value={formData.dataInicio}
              onChange={(e) =>
                handleChange("dataInicio", e.target.value)
              }
              className="w-full p-2 rounded bg-[#3d3d40] border border-mist-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={formData.dataFim}
              onChange={(e) =>
                handleChange("dataFim", e.target.value)
              }
              className="w-full p-2 rounded bg-[#3d3d40] border border-mist-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Responsável ID
            </label>
            <input
              type="number"
              value={formData.responsavelId}
              onChange={(e) =>
                handleChange("responsavelId", Number(e.target.value))
              }
              className="w-full p-2 rounded bg-[#3d3d40] border border-mist-500"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={fecharModal}
              className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalCadastro;
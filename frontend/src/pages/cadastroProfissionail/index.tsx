import { useState } from "react";

function CadastroProfissional() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");

  const [busca, setBusca] = useState("");
  const [projetosSelecionados, setProjetosSelecionados] = useState<number[]>([]);

  const projetos = [
    { id: 1, nome: "Projeto A" },
    { id: 2, nome: "Projeto B" },
    { id: 3, nome: "Projeto C" }
  ];

  // 🔍 Filtrar projetos
  const projetosFiltrados = projetos.filter((proj) =>
    proj.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // ✅ Selecionar / desselecionar
  const toggleProjeto = (id: number) => {
    if (projetosSelecionados.includes(id)) {
      setProjetosSelecionados(projetosSelecionados.filter(p => p !== id));
    } else {
      setProjetosSelecionados([...projetosSelecionados, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !cargo) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    const dados = {
      nome,
      email,
      cargo,
      projetosIds: projetosSelecionados 
    };

    console.log(dados);
    alert("Profissional cadastrado!");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-8 text-center">
        Cadastro de Profissional
      </h1>

      <div className="bg-gray-800 p-8 rounded-xl shadow-md">

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Nome **/}
          <div>
            <label className="text-sm text-gray-300">Nome *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full mt-2 p-4 rounded-lg bg-gray-700 border border-gray-600 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-300">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 p-4 rounded-lg bg-gray-700 border border-gray-600 outline-none"
            />
          </div>

          {/* Cargo */}
          <div>
            <label className="text-sm text-gray-300">Cargo *</label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full mt-2 p-4 rounded-lg bg-gray-700 border border-gray-600 outline-none"
            />
          </div>

          {/* Projetos (OPCIONAL) */}
          <div>
            <label className="text-sm text-gray-300">
              Projetos vinculados (opcional)
            </label>

            {/* Busca */}
            <input
              type="text"
              placeholder="Buscar projeto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full mt-2 mb-3 p-3 rounded-lg bg-gray-700 border border-gray-600 outline-none"
            />

            {/* Lista */}
            <div className="max-h-40 overflow-y-auto flex flex-col gap-2">

              {projetosFiltrados.map((proj) => (
                <label
                  key={proj.id}
                  className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={projetosSelecionados.includes(proj.id)}
                    onChange={() => toggleProjeto(proj.id)}
                  />
                  {proj.nome}
                </label>
              ))}

            </div>
          </div>

          {/* Botão */}
          <button className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg font-semibold">
            Cadastrar
          </button>

        </form>

      </div>
    </div>
  );
}

export default CadastroProfissional;
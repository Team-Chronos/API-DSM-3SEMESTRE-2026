import { useState } from "react";

function GestaoProfissionais() {
    const [profissionais, setProfissionais] = useState([
        {
            id: 1,
            nome: "Aline Raquel Camargo de Oliveira",
            email: "aline.camargo_oliveira@hotmail.com",
            cargo: "Desenvolvedor",
            projetos: ["Projeto A", "Projeto B"]
        },
        {
            id: 2,
            nome: "Isabella Camargo de Olieira",
            email: "isabella.camargo@gmail.com",
            cargo: "QA",
            projetos: ["Projeto C"]
        },
        {
            id: 3,
            nome: "Roberto Camargo",
            email: "roberto.camargo@gmail.com",
            cargo: "Desenvolvedor",
            projetos: ["Projeto B, D"]
        }
        
    ]);

    const [busca, setBusca] = useState("");

    const profissionaisFiltrados = profissionais.filter((prof) =>
        `${prof.nome} ${prof.email} ${prof.cargo}`
            .toLowerCase()
            .includes(busca.toLowerCase())
    );

    const handleExcluir = (id: number) => {
        const confirmacao = confirm("Deseja excluir este profissional?");
        if (!confirmacao) return;

        setProfissionais(profissionais.filter(p => p.id !== id));
    };

    return (
        <div className="w-full max-w-5xl mx-auto">

            <h1 className="text-3xl font-bold mb-8 text-center text-white">
                Gestão de Profissionais
            </h1>

            <input
                type="text"
                placeholder="Buscar por nome, e-mail ou cargo"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full mb-6 p-3 rounded-lg bg-[#3e3e3e] border border-[#3e3e3e] outline-none text-white"
            />

            <div className="bg-[#252525] p-8 rounded-xl shadow-md">

                <div className="flex flex-col gap-4">

                    {profissionaisFiltrados.map((prof) => (
                        <div
                            key={prof.id}
                            className="bg-[#3e3e3e] p-4 rounded-lg flex justify-between items-center"
                        >

                            {/* INFO */}
                            <div>
                                <p className="font-semibold text-white">{prof.nome}</p>
                                <p className="text-sm text-gray-300">{prof.email}</p>
                                <p className="text-sm text-gray-400">{prof.cargo}</p>

                                <p className="text-xs text-purple-400 mt-1">
                                    {prof.projetos.join(", ")}
                                </p>
                            </div>

                            {/* AÇÕES */}
                            <div className="flex gap-3">

                                <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm">
                                    Editar
                                </button>

                                <button
                                    onClick={() => handleExcluir(prof.id)}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm"
                                >
                                    Excluir
                                </button>

                            </div>

                        </div>
                    ))}

                </div>

            </div>
        </div>
    );
}

export default GestaoProfissionais;
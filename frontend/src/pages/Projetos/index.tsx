import { useEffect, useState } from "react";
import ModalCadastro from "../../components/projetos/modalCadastro";

interface Projeto{
    id: number;
    nome: string;
    codigo: string;
    tipoProjeto: string
    valoHoraBase:number;
    horasContratadas:number
    dataInicio:string 
    dataFim: string
    responsavelId:number
}

function Projetos() {
        
        const [modalAberto, setModalAberto] = useState(false);
        const [projetos, setProjetos] = useState<Projeto[]>([])
        const [busca, setBusca] = useState("");
        const [loading, setLoading] = useState(true)
        //conexão com banco para trazer projetos
        useEffect(()=> {
            const carregarProjetos = async () => {
                try {
                    const resposta = await fetch("http://localhost:8080/projetos")
                    const dados = await resposta.json();
                    console.log('retorno da api', dados)
                    setProjetos(dados)
                } catch(erro) {
                    console.error("Erro ao buscar projeto ", erro)
 
                }finally{
                    setLoading(false)
                } 
            }
            carregarProjetos();
      
        },[])

        const projetosFiltrados = projetos.filter(projeto => {
            const termoBusca = busca.toLowerCase();
            return (
                projeto.nome.toLowerCase().includes(termoBusca) 
                // || projeto.responsavelId.toLowerCase().includes(termoBusca)
            )
        })
        return (
        <div className="p-1 ">
            <div className="flex justify-end items-center gap-2 mb-6">
                <button onClick={() => setModalAberto(true)}
                className="bg-backgroundCards text-white text-2xl font-semibold p-1.5 pr-5 pl-5 rounded-full hover:bg-blue-600 cursor-pointer">
                    +
                </button>
                <label className="text-white font-semibold">Pesquisa:</label>
                <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Nome ou gerente..."
                    className="p-1 px-3 bg-backgroundCards rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs" >
                {/* renderização dos cards */ }
                {loading ? (<h1 className="text-texto">carregando...</h1>) : ((projetosFiltrados.length > 0 ? (
                    projetosFiltrados.map((projeto) => (
                        <div key={projeto.id} className="bg-backgroundCards hover:bg-blue-700 text-white rounded-2xl p-4 transition-colors cursor-pointer">
                            <div className="border-b border-slate-600 w-full mx-auto mb-2 pb-1">
                                <h1 className="text-white text-center text-lg font-semibold">
                                    {projeto.nome}
                                </h1>
                        </div>
                            <p className="mt-2"><span className="font-semibold text-slate-300">Tipo:</span> {projeto.tipoProjeto}</p>
                            <p><span className="font-semibold text-slate-300">Data Inicio:</span> {projeto.dataInicio}</p>
                            <p><span className="font-semibold text-texto">Responsável:</span> {projeto.responsavelId}</p>
                        </div>
                    ))
                ) : 
                    <p className="text-slate-400 col-span-full text-center text-sm mt-10">
                        Nenhum projeto encontrado com "{busca}".
                    </p>
                ))}
            </div>
                {modalAberto && (
                    <ModalCadastro fecharModal={() => setModalAberto(false)} />

                )}            
        </div>
    )
}

export default Projetos
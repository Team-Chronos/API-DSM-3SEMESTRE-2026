import { useEffect, useState } from "react"
import type { Tarefa } from "../../../types/tarefa"
import type { RegistroHorasTarefa } from "../../../types/registroTempo"
import type { Item } from "../../../types/item"
import TabelaRegistroHoras from "./TabelaRegistroHoras"
import ModalCadastro from "./ModalCadastro"
import axios from "axios"

interface TarefasInfoProps {
    tarefa: Tarefa
    item?: Item
    setTarefa: (tarefa: Tarefa | undefined) => void
    reloadTarefas: () => Promise<void>
}

function TarefasInfo({ tarefa, item, setTarefa, reloadTarefas }: TarefasInfoProps) {
    const [registroHorasTarefa, setRegistroHorasTarefa] = useState<RegistroHorasTarefa>()
    const [ porcentagemTempo, setPorcentagemTempo ] = useState<number>(0)
    const [ modalCadastro, setModalCadastro ] = useState<boolean>(false)

    async function buscarRegistroHorasTarefa() {
        try {
            const response = await axios.get<RegistroHorasTarefa>("http://localhost:8082/registros/tarefa/" + tarefa.id)
            setRegistroHorasTarefa(response.data)
        } catch (error: any) {
            console.error("Erro ao buscar registro de horas da tarefa")
        }
    }

    useEffect(() => {
        if (!registroHorasTarefa || !registroHorasTarefa.tempoMinutos) {
            setPorcentagemTempo(0)
            return
        }

        setPorcentagemTempo(registroHorasTarefa.tempoMinutos / tarefa.tempoMaximoMinutos)
    }, [registroHorasTarefa, tarefa])

    function handleFechar() {
        setTarefa(undefined)
    }

    useEffect(() => {
        buscarRegistroHorasTarefa()
    }, [tarefa])

    return (
        <>
            <div className={`relative`}>
                <button className={`absolute cursor-pointer top-4 right-4`}
                    onClick={handleFechar}
                >
                    ✕
                </button>
                <div className={`flex flex-col gap-y-3 p-4`}>
                    <h2 className={`text-lg font-medium pr-6`}>
                        {tarefa.titulo}
                    </h2>
                    <div className={`relative flex flex-col lg:flex-row gap-8`}>
                        <div className={`flex flex-col grow gap-y-4`}>
                            {tarefa.descricao && (
                                <p className={`text-sm`}>
                                    {tarefa.descricao}
                                </p>
                            )}

                            <div className={`w-full max-h-64 overflow-auto `}>
                                <TabelaRegistroHoras registroHorasTarefa={registroHorasTarefa} />
                            </div>
                        </div>

                        <div className={`max-w-full lg:max-w-4/12 min-w-60 grow flex flex-col gap-y-4 lg:mr-4`}>
                            <div className={`flex flex-col bg-mist-700 rounded-lg p-3`}>
                                <h4 className={`mb-3`}>Controle de tempo</h4>
                                <div className={`w-full bg-mist-800 h-3 rounded-full`}>
                                    <div className={`h-3 max-w-full bg-violet-700 shadow-violet-800 shadow-inner rounded-full`}
                                        style={{width: `${porcentagemTempo * 100}%`}}
                                    ></div>
                                </div>
                                <p className={`mt-2 text-gray-200 text-sm`}>{registroHorasTarefa?.tempoMinutos || 0} min / {tarefa.tempoMaximoMinutos} min</p>
                                <button
                                    className={`text-sm w-fit self-center bg-violet-700 hover:bg-violet-800 active:bg-violet-900 shadow-violet-600 hover:shadow-none shadow-inner cursor-pointer rounded-lg py-2 px-4 mt-4`}
                                    onClick={() => setModalCadastro(true)}
                                >
                                    Registrar tempo
                                </button>
                            </div>
                            <div className={`flex flex-col bg-mist-700 rounded p-3 gap-y-1`}>
                                <h4>Item</h4>
                                <h5>{item?.nome || "Essa tarefa não possui um item"}</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModalCadastro
                tempoMaximoMinutos={tarefa.tempoMaximoMinutos}
                tempoRegistradoMinutos={registroHorasTarefa?.tempoMinutos || 0}
                tarefaId={tarefa.id}
                open={modalCadastro}
                reloadTarefas={reloadTarefas}
                reloadRegistros={buscarRegistroHorasTarefa}
                onClose={() => {
                    setModalCadastro(false)
                }}
            >

            </ModalCadastro>
        </>
    )
}

export default TarefasInfo
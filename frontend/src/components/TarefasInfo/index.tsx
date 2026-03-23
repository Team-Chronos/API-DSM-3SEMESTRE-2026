import type { Tarefa } from "../../types/tarefa"

interface TarefasInfoProps {
    tarefa: Tarefa
    setTarefa: (tarefa: Tarefa | undefined) => void
}

function TarefasInfo({ tarefa, setTarefa }: TarefasInfoProps){

    function handleFechar(){
        setTarefa(undefined)
    }

    return(
        <>
            <div className={`relative`}>
                <button className={`absolute cursor-pointer top-4 right-4`}
                    onClick={handleFechar}
                >
                    X
                </button>
                <div className={`flex flex-col gap-y-2 p-4`}>
                    <h2 className={`text-lg font-medium  pr-6`}>
                        {tarefa.titulo}
                    </h2>
                    <div>
                        {tarefa.descricao && (
                            <p className={`text-sm`}>
                                {tarefa.descricao}  
                            </p>
                        )}
                        
                        <div>
                            <p>Tempo Máximo</p>
                            <p>{tarefa.tempoMaximoMinutos}</p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default TarefasInfo
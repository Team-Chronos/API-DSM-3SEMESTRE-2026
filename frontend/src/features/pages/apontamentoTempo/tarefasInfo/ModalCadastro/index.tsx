import type React from "react"
import Modal from "../../../../../components/modals/ModalBase"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import apiApontamento from "../../../../../services/apontamento/apiApontamento"

interface ModalCadastroProps {
  tempoMaximoMinutos: number
  tempoRegistradoMinutos: number
  tarefaId: number
  open: boolean
  reloadTarefas: () => Promise<void>
  reloadRegistros: () => Promise<void>
  onClose: () => void
}

type form = {
  data_inicio: string
  data_fim?: string
}

function ModalCadastro({tempoMaximoMinutos, tempoRegistradoMinutos, tarefaId, open, reloadTarefas, reloadRegistros, onClose}: ModalCadastroProps){
  if (open == false) return

  const [ form, setForm ] = useState<form>({
    data_inicio: ""
  })
  const [ erroDataInicio, setErroDataInicio ] = useState<string | null>(null)
  const [ erroDataFim, setErroDataFim ] = useState<string | null>(null)
  const [ erroDuracao, setErroDuracao ] = useState<string | null>(null)

  const [ duracaoMinutos, setDuracaoMinutos ] = useState<number>(0)

  const tempoRestanteMinutos = tempoMaximoMinutos - tempoRegistradoMinutos
  
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>){
    const { name, value } = e.target

    setForm({
      ...form,
      [name]: value
    })
  }

  async function handleFormSubmit(e: React.SubmitEvent){
    e.preventDefault()
    
    if (form.data_inicio == null || form.data_inicio == undefined){
      setErroDataInicio("A data de início não pode ser nula")
      return
    }
    
    if (form.data_fim){
      if (!validarData(form.data_inicio, form.data_fim)){
        return
      }
      if (!validarDuracao(calcularDuracao(form.data_inicio, form.data_fim))){
        return
      }
    }
    
    if (!tarefaId){
      console.error("Não foi passado tarefaId")
      return
    }
    
    const data = {
      data_inicio: new Date(form.data_inicio).toISOString(),
      data_fim: form.data_fim ? new Date(form.data_fim).toISOString() : undefined,
      tarefa_id: tarefaId
    }
    onClose()
    try {
      await toast.promise(apiApontamento.post("/registros", data),
        {
          pending: "Esperando resposta",
          success: "Registrado com sucesso!",
          error: "Erro ao obter resposta"
        }
      )
      await reloadTarefas()
      await reloadRegistros()
    } catch (error: any) {
      console.error("Erro ao enviar formulário", error)
    }
  }

  function calcularDuracao(data_inicio: string | Date, data_fim: string | Date){
    return Math.round((new Date(data_fim).getTime() - new Date(data_inicio).getTime()) / 60000)
  }

  function validarData(data_inicio: string | Date, data_fim: string | Date): boolean{
    const inicio = new Date(data_inicio)
    const fim = new Date(data_fim)

    if (fim <= inicio) {
      setErroDataFim("A data de término não pode ser igual ou menor que da data de início")
      return false
    }

    setErroDataFim(null)
    return true
  }

  function validarDuracao(duracao: number): boolean{
    if (duracao > tempoRestanteMinutos){
      setErroDuracao("A duração não pode ser maior que o tempo restante")
      return false
    }

    setErroDuracao(null)
    return true
  }

  useEffect(() => {
    if (!form.data_inicio || !form.data_fim) {
      setErroDataFim(null)
      return
    }

    validarData(form.data_inicio, form.data_fim)
    validarDuracao(calcularDuracao(form.data_inicio, form.data_fim))

    setDuracaoMinutos(calcularDuracao(form.data_inicio, form.data_fim))
    
  }, [form.data_inicio, form.data_fim])

  return(
    <>
      <Modal
        open={open}
        onClose={onClose}
      >
        <div>
          <h1 className={`text-lg font-medium`}>Registro de tempo</h1>
        </div>
        <hr className={`my-3 opacity-15`} />
        <div>
          <form id="formRegistroHoras" onSubmit={handleFormSubmit}>
            <div className={`flex flex-col gap-6`}>
              <div className={`flex flex-row justify-around gap-4`}>
                <div>
                  <p>Tempo Máximo:</p>
                  <p className={`text-center`}>{tempoMaximoMinutos} minutos</p>
                </div>
                <div>
                  <p>Tempo Restante:</p>
                  <p className={`text-center`}>{tempoRestanteMinutos} minutos</p>
                </div>
              </div>
              <div className={`flex flex-col gap-y-3`}>
                <label htmlFor="data_inicio">Data de Início:</label>
                <input type="datetime-local" id="data_inicio" name="data_inicio" required
                  value={form.data_inicio}
                  onChange={handleFormChange}
                  className={`border ${erroDataInicio ? "border-red-500" : "border-mist-700"} border-mist-700 bg-mist-800 p-1.5 pl-3 rounded-lg`}
                />
                {erroDataInicio && (
                  <span className="text-red-500 text-sm">
                    {erroDataInicio}
                  </span>
                )}
              </div>
              <div className={`flex flex-col gap-y-2`}>
                <label htmlFor="data_fim">Data de Término:</label>
                <input type="datetime-local" id="data_fim" name="data_fim"
                  value={form.data_fim || ""}
                  onChange={handleFormChange}
                  min={form.data_inicio}
                  readOnly={!form.data_inicio}
                  className={`border ${erroDataFim ? "border-red-500" : "border-mist-700"} bg-mist-800 p-1.5 pl-3 rounded-lg read-only:focus:outline-none read-only:opacity-75`}
                />
                {erroDataFim && (
                  <span className="text-red-500 text-sm">
                    {erroDataFim}
                  </span>
                )}
              </div>
              <div className={`flex flex-col gap-y-2`}>
                <label htmlFor="tempoMinutos">Duração em Minutos:</label>
                <input type="text" id="tempoMinutos" readOnly
                value={duracaoMinutos?  duracaoMinutos + " minutos" : ""}
                  className={`border ${erroDuracao ? "border-red-500" : "border-mist-700"} bg-mist-800 p-1.5 pl-3 rounded-lg focus:outline-none opacity-75`}
                />
                {erroDuracao && (
                  <span className="text-red-500 text-sm">
                    {erroDuracao}
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>
        <hr className={`my-3 opacity-15`} />
        <div className={`flex justify-end`}>
          <button type="submit" form="formRegistroHoras"
            disabled={!!erroDataFim || !!erroDataInicio || !!erroDuracao}
            className={`bg-violet-700 hover:bg-violet-800 active:bg-violet-900 shadow-violet-600 hover:shadow-none shadow-inner cursor-pointer rounded-lg py-2 px-4 disabled:pointer-events-none disabled:select-none disabled:opacity-75`}
          >
            Enviar
          </button>
        </div>
      </Modal>
    </>
  )
}

export default ModalCadastro
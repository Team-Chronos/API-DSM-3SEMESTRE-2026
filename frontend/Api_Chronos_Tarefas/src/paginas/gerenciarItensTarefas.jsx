import { useState } from "react";
import ModalCadastroItem from "../componentes/modal/formularioItem";
import ModalCadastroTarefa from "../componentes/modal/formularioTarefas";
import DragDropTarefas from "./DragDropTarefas";

export default function TelaTarefas() {
  const [modalItemAberto, setModalItemAberto] = useState(false);
  const [modalTarefaAberto, setModalTarefaAberto] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tarefaSelecionadaId, setTarefaSelecionadaId] = useState(null);

  const handleSucesso = () => {
    setRefreshKey(prev => prev + 1);
  };

  const abrirModalItem = (tarefaId) => {
    setTarefaSelecionadaId(tarefaId);
    setModalItemAberto(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1f1f1f' }}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setModalTarefaAberto(true)}
              className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#3e3e3e' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4e4e4e'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Tarefa
            </button>
          </div>
        </div>

        <DragDropTarefas 
          key={refreshKey} 
          onAbrirModalItem={abrirModalItem}
        />

        <ModalCadastroItem
          tarefaId={tarefaSelecionadaId || 0}
          isOpen={modalItemAberto}
          onFechar={() => setModalItemAberto(false)}
          onSucesso={handleSucesso}
        />

        <ModalCadastroTarefa
          isOpen={modalTarefaAberto}
          onFechar={() => setModalTarefaAberto(false)}
          onSucesso={handleSucesso}
        />
      </div>
    </div>
  );
}
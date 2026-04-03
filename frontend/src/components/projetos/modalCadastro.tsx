import { useState } from "react";

function ModalCadastro({fecharModal}: {fecharModal: () => void}) {
    const [formData, setFormData] = useState({
        nome:"",
        codigo:"",
        tipoProjeto:"",
        valorHoraBase: 0,
        horasContratadas:0,
        dataInicio:"",
        dataFim:"",
        responsavelId:0

    })

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    try {
        const response = await fetch("http://localhost:8080/projetos", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData), 
        });

        if (response.ok) {
            alert("Projeto cadastrado com sucesso!");
            fecharModal(); 
        } else {
            alert("Erro ao cadastrar. Verifique os dados.");
            console.log(formData)
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
};
    
    return( 
        <>
         <div className="fixed overflow-y-auto inset-0 bg-background/60 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-backgroundCards p-6 rounded-lg w-96">
                            <h2 className="text-texto font-semibold mb-4">Adicionar Novo Projeto</h2>
                            
                            <form onSubmit={handleSubmit} className="overflow">
                                <div className="mb-4">
                                    <label className="block text-texto font-bold mb-2">Nome do Projeto:</label>
                                    <input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome : e.target.value})} type="text" 
                                    className="w-full text-texto p-2 border border-gray-300 rounded" />

                                    <label className="block text-texto font-bold mb-2">Codigo do Projeto:</label>
                                    <input value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo : e.target.value})} type="text" 
                                    className="w-full text-texto p-2 border border-gray-300 rounded" />

                                    <label className="block text-texto font-bold mb-2">Valor hora base:</label>
                                    <input type="number" value={formData.valorHoraBase} onChange={(e)=> setFormData({...formData, valorHoraBase: Number(e.target.value)})} 
                                    className="w-full text-texto p-2 border border-gray-300 rounded" />

                                    <label className="block text-texto font-bold mb-2">Horas Contratadas</label>
                                    <input type="number" value={formData.horasContratadas} onChange={(e) => setFormData({...formData, horasContratadas: Number(e.target.value)})}   
                                    className="w-full text-texto p-2 border border-gray-300 rounded" />
                                    
                                </div>
                                <div className="mb-4">
                                    <label className="block text-texto font-bold mb-2">Tipo:</label>
                                    <select value={formData.tipoProjeto} onChange={(e) => setFormData({...formData, tipoProjeto:e.target.value})} className="w-full text-texto p-2 border border-gray-300 rounded">
                                        <option value="">Selecione o tipo</option>
                                        <option value="HORA_FECHADA" >Hora Fechada</option>
                                        <option value="ALOCACAO">Alocação</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-texto font-bold mb-2">Data de Início:</label>
                                    <input type="date" value={formData.dataInicio} onChange={(e) => setFormData({...formData, dataInicio:e.target.value})} className="w-full text-texto p-2 border border-gray-300 rounded" />
                                </div>
                                 <div className="mb-4">
                                    <label className="block text-texto font-bold mb-2">Data fim:</label>
                                    <input type="date" value={formData.dataFim} onChange={(e) => setFormData({... formData, dataFim: e.target.value})} className="w-full text-texto p-2 border border-gray-300 rounded" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-texto font-bold mb-2">Responsável:</label>
                                    <input value={formData.responsavelId} onChange={(e) => setFormData({...formData, responsavelId:Number(e.target.value)})} className="w-full text-texto p-2 border border-gray-300 rounded" />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={fecharModal} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                        Cancelar</button>
                                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Adicionar</button>
                                </div>
                            </form>
                        </div>
                    </div>
        </>
    )
}
export default ModalCadastro; 

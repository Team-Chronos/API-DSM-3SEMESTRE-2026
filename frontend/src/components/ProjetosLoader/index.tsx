import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';

function ProjetoLoader() {
  const { projetoId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projetoId) {
      setError('ID do projeto não fornecido');
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [projetoId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1b1b1f]">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-[#1b1b1f]">
        <div className="bg-red-500 text-white p-4 rounded-lg">
          <strong>Erro:</strong> {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return <Outlet />;
}

export default ProjetoLoader;
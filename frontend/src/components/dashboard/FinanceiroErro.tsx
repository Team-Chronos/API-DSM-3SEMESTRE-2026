import SemConteudo from "../ui/SemConteudo";

interface FinanceiroErroProps {
  error: string | null;
  onRecarregar: () => void;
}

export default function FinanceiroErro({ error, onRecarregar }: FinanceiroErroProps) {
  return (
    <section className="min-h-full w-full overflow-x-hidden bg-[#1b1b1f] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <SemConteudo
          title="Erro ao carregar financeiro"
          description={error ?? "Não foi possível carregar os dados."}
        />

        <div className="mt-6">
          <button
            type="button"
            onClick={onRecarregar}
            className="rounded-xl bg-gradient-to-r from-[#6627cc] to-[#4a1898] px-5 py-3 font-medium text-white transition hover:brightness-110"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mensagem, setMensagem] = useState<{
    tipo: "erro";
    texto: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !senha) {
      setMensagem({
        tipo: "erro",
        texto: "Preencha todos os campos",
      });

      setTimeout(() => setMensagem(null), 3000);
      return;
    }

    setCarregando(true);
    const autenticado = await login(email, senha);
    setCarregando(false);

    if (autenticado) {
      navigate("/profissionais");
      return;
    }

    setMensagem({
      tipo: "erro",
      texto: "Email ou senha invalidos",
    });

    setTimeout(() => setMensagem(null), 3000);
  };

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-gray-700">
      <div className="max-w-md -translate-y-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-white">Login</h1>

        <div className="rounded-xl bg-[#252525] p-8 shadow-md">
          {mensagem && (
            <div className="mb-4 rounded-lg border border-red-500 bg-red-600/20 p-3 text-center font-medium text-red-400">
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div>
              <label className="text-sm text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[#3e3e3e] bg-[#3e3e3e] p-4 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[#3e3e3e] bg-[#3e3e3e] p-4 text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="rounded-lg bg-gradient-to-r from-[#4e31aa] to-[#3a1078] p-4 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

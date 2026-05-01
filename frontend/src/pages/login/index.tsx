import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logoGSW from "../../assets/inteiro.png";
import { Eye, EyeOff } from "lucide-react";
import { toastError } from "../../utils/toastUtils";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mensagem, setMensagem] = useState<{ tipo: "erro"; texto: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      setMensagem({ tipo: "erro", texto: "Preencha todos os campos" });
      setTimeout(() => setMensagem(null), 3000);
      return;
    }
    setCarregando(true);
    const autenticado = await login(email, senha);
    setCarregando(false);
    if (autenticado) {
      navigate("/projetos");
      return;
    }
    setMensagem({ tipo: "erro", texto: "Email ou senha inválidos" });
    setTimeout(() => setMensagem(null), 3000);

    toastError("Email ou senha inválidos");
  };

  return (
    <div className="min-h-screen flex bg-[#0b0b0f] text-white">
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-purple-600/20 blur-3xl rounded-full -top-40 -left-40" />
        <div className="absolute w-[500px] h-[500px] bg-blue-600/20 blur-3xl rounded-full bottom-[-200px] right-[-200px]" />
        <div className="relative z-10 flex flex-col justify-center px-20">
          <img src={logoGSW} alt="Logo do site" />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold">Entrar</h2>
              <p className="text-sm text-gray-400 mt-1">Acesse sua conta para continuar</p>
            </div>
            {mensagem && (
              <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
                {mensagem.texto}
              </div>
            )}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-12 text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={carregando}
                className="mt-2 h-11 rounded-xl bg-gradient-to-b from-[#6627cc] to-[#4a1898] font-medium text-white shadow-lg transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {carregando ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">© 2026 Team Chronos</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
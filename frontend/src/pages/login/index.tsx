import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [mensagem, setMensagem] = useState<{
    tipo: "erro";
    texto: string;
  } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !senha) {
      setMensagem({
        tipo: "erro",
        texto: "Preencha todos os campos",
      });

      setTimeout(() => setMensagem(null), 3000);
      return;
    }

    // teste de login retirar quando for integrar com back
    if (email === "admin@email.com" && senha === "123") {
      alert("Login realizado com sucesso!");
      
    } else {
      setMensagem({
        tipo: "erro",
        texto: "Email ou senha inválidos",
      });

      setTimeout(() => setMensagem(null), 3000);
    }
  };

  return (
    <div className={`flex h-dvh w-full justify-center items-center bg-gray-700`}>
      <div className="max-w-md -translate-y-8">

        <h1 className="text-3xl font-bold mb-8 text-center text-white">
          Login
        </h1>

        <div className="bg-[#252525] p-8 rounded-xl shadow-md">

          {/* MENSAGEM */}
          {mensagem && (
            <div className="mb-4 p-3 rounded-lg text-center font-medium bg-red-600/20 text-red-400 border border-red-500">
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">

            {/* EMAIL */}
            <div>
              <label className="text-sm text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 p-4 rounded-lg bg-[#3e3e3e] border border-[#3e3e3e] outline-none text-white"
              />
            </div>

            {/* SENHA */}
            <div>
              <label className="text-sm text-gray-300">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full mt-2 p-4 rounded-lg bg-[#3e3e3e] border border-[#3e3e3e] outline-none text-white"
              />
            </div>

            {/* BOTÃO */}
            <button
              type="submit"
              className="p-4 rounded-lg font-semibold text-white 
                        bg-gradient-to-r from-[#4e31aa] to-[#3a1078] 
                        hover:opacity-90 transition"
            >
              Entrar
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}

export default Login;
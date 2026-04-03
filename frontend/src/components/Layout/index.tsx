import { NavLink, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">

      {/* SIDEBAR */}
      <aside className="w-20 bg-gray-800 flex flex-col items-center py-6 gap-6">

        <div className="text-purple-500 text-xl">🏠</div>
        <NavLink
          to="/profissionais"
          className={({ isActive }) =>
            isActive ? "text-white text-xl" : "text-gray-400 hover:text-white text-xl"
          }
          title="Cadastro de profissionais"
        >
          👤
        </NavLink>
        <NavLink
          to="/associacoes"
          className={({ isActive }) =>
            isActive ? "text-white text-xl" : "text-gray-400 hover:text-white text-xl"
          }
          title="Associacao profissional/projeto"
        >
          🔗
        </NavLink>

        <div className="mt-auto text-gray-400 hover:text-red-500 cursor-pointer">
          ⏻
        </div>
      </aside>

      {/* CONTEÚDO */}
      <div className="flex-1 flex flex-col">

        {/* MAIN CENTRALIZADO */}
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <Outlet />
        </main>

        {/* FOOTER */}
        <footer className="h-10 bg-gray-800 flex items-center justify-center text-sm text-gray-400">
          © 2026 Chronos
        </footer>

      </div>
    </div>
  );
}
export default Layout;

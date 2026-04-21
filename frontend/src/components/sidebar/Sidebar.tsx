import { useState } from "react";
import { NavLink } from "react-router-dom";
import {LayoutDashboard,FolderKanban,Users,ChevronLeft,Link,LogOut,ClipboardList} from "lucide-react";
import logoInteiro from "../../assets/inteiro.png";
import logoMetade from "../../assets/metade.png";
import { useAuth } from "../../contexts/AuthContext";

const NAV_ITEMS = [
  { to: "/financeiro", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projetos", icon: FolderKanban, label: "Projetos" },
  { to: "/profissionais", icon: Users, label: "Profissionais" },
  { to: "/associacoes", icon: Link, label: "Associações" },
  { to: "/tarefas", icon: ClipboardList, label: "Tarefas" }
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const [expanded, setExpanded] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState<boolean>(false);

  function handleLogout() {
    console.log("Logout");
    setConfirmLogout(false);
    logout();
  }

  return (
    <>
      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1b1b1f] border border-white/10 rounded-2xl shadow-2xl p-6 w-80 text-white">
            <h2 className="text-base font-semibold mb-1">Sair da conta</h2>
            <p className="text-sm text-white/50 mb-6">
              Tem certeza que deseja sair?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/15 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-lg text-sm bg-red-500 hover:bg-red-600 transition-colors font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`
          relative flex flex-col h-screen bg-[#151519] text-white border-r border-white/5
          transition-all duration-300 ease-in-out shrink-0
          ${expanded ? "w-60" : "w-16"}
        `}
      >
        <div className="flex items-center justify-between h-16 px-3 border-b border-white/10">
          {expanded ? (
            <img src={logoInteiro} alt="GSW Logo" className="h-9 object-contain" />
          ) : (
            <img src={logoMetade} alt="GSW Icon" className="h-8 w-8 object-contain mx-auto" />
          )}

          {expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-colors shrink-0 ml-2"
              aria-label="Fechar sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="absolute inset-0 w-full h-16 cursor-e-resize"
              aria-label="Abrir sidebar"
            />
          )}
        </div>

        <nav className="flex flex-col gap-1 flex-1 px-2 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={!expanded ? label : undefined}
              className={({ isActive }) => `
                flex items-center gap-3 px-2 py-2.5 rounded-lg
                transition-colors duration-150
                ${
                  isActive
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon size={20} className="shrink-0" />
              {expanded && <span className="text-sm truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 py-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold shrink-0">
              {user?.nome?.slice(0, 1).toUpperCase() || "U"}
            </div>

            {expanded && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium truncate">{user?.nome}</p>
                  <p className="text-xs text-white/50 truncate">{user?.sub}</p>
                </div>
                <button onClick={() => setConfirmLogout(true)} aria-label="Sair">
                  <LogOut
                    size={16}
                    className="text-white/40 hover:text-red-400 transition-colors"
                  />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

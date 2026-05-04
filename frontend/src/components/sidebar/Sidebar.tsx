import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ChevronLeft,
  Link,
  LogOut

} from "lucide-react";
import logoInteiro from "../../assets/inteiro.png";
import logoMetade from "../../assets/metade.png";
import { useAuth } from "../../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";

const ALL_NAV_ITEMS = [
  { to: "/financeiro", icon: LayoutDashboard, label: "Dashboard", allowedRoles: ["ROLE_FINANCE"] },
  { to: "/projetos", icon: FolderKanban, label: "Projetos", allowedRoles: ["ROLE_FINANCE", "ROLE_GERENTE_PROJETO", "ROLE_USER"] },
  { to: "/profissionais", icon: Users, label: "Profissionais", allowedRoles: ["ROLE_FINANCE", "ROLE_GERENTE_PROJETO"] },
  { to: "/associacoes", icon: Link, label: "Associações", allowedRoles: ["ROLE_FINANCE", "ROLE_GERENTE_PROJETO"] }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user?.roles) {
      setUserRoles(user.roles);
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode<{ roles?: string[] }>(token);
          setUserRoles(decoded.roles || []);
        } catch (e) {
          setUserRoles([]);
        }
      }
    }
  }, [user]);

  if (userRoles.length === 0 && !user) {
    return (
      <aside className="w-16 bg-[#151519] h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </aside>
    );
  }

  const visibleNavItems = ALL_NAV_ITEMS.filter(item =>
    item.allowedRoles.some(role => userRoles.includes(role))
  );

  function handleLogout() {
    setConfirmLogout(false);
    logout();
  }

  return (
    <>
      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1b1b1f] border border-white/10 rounded-2xl shadow-2xl p-6 w-80 text-white">
            <h2 className="text-base font-semibold mb-1">Sair da conta</h2>
            <p className="text-sm text-white/50 mb-6">Tem certeza que deseja sair?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmLogout(false)} className="flex-1 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/15">
                Cancelar
              </button>
              <button onClick={handleLogout} className="flex-1 py-2 rounded-lg text-sm bg-red-500 hover:bg-red-600 font-medium">
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className={`relative flex flex-col h-screen bg-[#151519] text-white border-r border-white/5 transition-all duration-300 ease-in-out shrink-0 ${expanded ? "w-60" : "w-16"}`}>
        <div className="flex items-center justify-between h-16 px-3 border-b border-white/10">
          {expanded ? <img src={logoInteiro} alt="GSW Logo" className="h-9 object-contain" /> : <img src={logoMetade} alt="GSW Icon" className="h-8 w-8 object-contain mx-auto" />}
          {expanded && (
            <button onClick={() => setExpanded(false)} className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 shrink-0 ml-2">
              <ChevronLeft size={18} />
            </button>
          )}
          {!expanded && <button onClick={() => setExpanded(true)} className="absolute inset-0 w-full h-16 cursor-e-resize" />}
        </div>

        <nav className="flex flex-col gap-1 flex-1 px-2 py-4 overflow-y-auto">
          {visibleNavItems.length === 0 && <div className="text-white/40 text-sm px-2 py-2">Nenhum item disponível</div>}
          {visibleNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={!expanded ? label : undefined}
              className={({ isActive }) => `
                flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors duration-150
                ${isActive ? "bg-white/15 text-white font-medium" : "text-white/60 hover:bg-white/10 hover:text-white"}
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
                  <p className="text-sm font-medium truncate">{user?.nome || "Usuário"}</p>
                  <p className="text-xs text-white/50 truncate">{user?.sub || ""}</p>
                </div>
                <button onClick={() => setConfirmLogout(true)} aria-label="Sair">
                  <LogOut size={16} className="text-white/40 hover:text-red-400 transition-colors" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
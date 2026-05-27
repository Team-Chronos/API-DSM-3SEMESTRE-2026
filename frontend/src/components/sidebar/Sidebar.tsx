import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Users, ChevronLeft, Link, LogOut } from "lucide-react";
import logoInteiro from "../../assets/inteiro.png";
import logoMetade from "../../assets/metade.png";
import { useAuth } from "../../contexts/AuthContext";
import { useIsMobile } from "../../hooks/useIsMobile";

const ALL_NAV_ITEMS = [
  { to: "/financeiro", icon: LayoutDashboard, label: "Financeiro", allowedCargos: [3] },
  { to: "/projetos", icon: FolderKanban, label: "Projetos" },
  { to: "/profissionais", icon: Users, label: "Profissionais", allowedCargos: [2, 3] },
  { to: "/associacoes", icon: Link, label: "Associações", allowedCargos: [2, 3] },
];

export default function Sidebar() {
  const { user, logout, hasAnyCargo } = useAuth();
  const isMobile = useIsMobile();

  const [expanded, setExpanded] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => {
    if (!item.allowedCargos) return true;
    return hasAnyCargo(item.allowedCargos);
  });

  function handleLogout() {
    setConfirmLogout(false);
    logout();
  }

  return (
    <>
      {confirmLogout && (
        <div className="fixed inset-0 z-101 flex items-center justify-center bg-black/50">
          <div className="w-80 rounded-2xl border border-white/10 bg-[#1b1b1f] p-6 text-white shadow-2xl">
            <h2 className="mb-1 text-base font-semibold">Sair da conta</h2>
            <p className="mb-6 text-sm text-white/50">Tem certeza que deseja sair?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="flex-1 rounded-lg bg-white/10 py-2 text-sm hover:bg-white/15"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-medium hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobile ? (
        <div className="fixed bottom-0 inset-x-0 m-2 h-15 z-100 bg-[#151519] rounded-full">
          <div className={`flex *:flex-1 h-full`}>
            {visibleNavItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `
                flex flex-col justify-center gap-1 items-center rounded-full transition-colors duration-150
                ${isActive ? "bg-white/15 text-white font-medium border border-zinc-500" : "text-white/60 hover:bg-white/10 hover:text-white"}
              `}
              >
                <Icon size={20} className="" />
                <span className="text-[10px]">{label}</span>
              </NavLink>
            ))}

            <button
              className="flex flex-col justify-center gap-px items-center rounded-full transition-colors duration-150"
              onClick={() => setConfirmLogout(true)}
            >
              <div className="w-11 h-11 rounded-full bg-indigo-500 flex items-center text-lg justify-center font-bold shrink-0">
                {user?.nome?.slice(0, 1).toUpperCase() || "U"}
              </div>
            </button>
          </div>
        </div>
      ) : (
        <aside
          className={`relative flex h-screen shrink-0 flex-col border-r border-white/5 bg-[#151519] text-white transition-all duration-300 ease-in-out ${
            expanded ? "w-60" : "w-16"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-3">
            {expanded ? (
              <img src={logoInteiro} alt="Logo" className="h-9 object-contain" />
            ) : (
              <img src={logoMetade} alt="Logo" className="mx-auto h-8 w-8 object-contain" />
            )}

            {expanded && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-white/10"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            {!expanded && (
              <button
                type="button"
                aria-label="Expandir menu"
                onClick={() => setExpanded(true)}
                className="absolute inset-0 h-16 w-full cursor-e-resize"
              />
            )}
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
            {visibleNavItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                title={!expanded ? label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150 ${
                    isActive
                      ? "bg-white/15 font-medium text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                {expanded && <span className="truncate text-sm">{label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/10 px-2 py-3">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/10">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold">
                {user?.nome?.slice(0, 1).toUpperCase() || "U"}
              </div>

              {expanded && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium">{user?.nome || "Usuário"}</p>
                    <p className="truncate text-xs text-white/50">{user?.sub || ""}</p>
                  </div>
                  <button type="button" onClick={() => setConfirmLogout(true)} aria-label="Sair">
                    <LogOut
                      size={16}
                      className="text-white/40 transition-colors hover:text-red-400"
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}

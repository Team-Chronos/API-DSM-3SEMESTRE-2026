import { useAuth } from "../../contexts/AuthContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import Sidebar from "../sidebar/Sidebar";
import { Navigate, Outlet } from "react-router-dom";

export default function AppLayout() {
  const { user } = useAuth()
  const isMobile = useIsMobile()

  if (!user){
    return <Navigate to={"/login"} replace/>
  }

  return (
    <div className="flex relative h-screen overflow-hidden bg-[#0f1020]">
      <Sidebar />
      <main className={`flex-1 overflow-y-auto bg-[#1b1b1f] ${isMobile && "pb-18"}`}>
        <Outlet />
      </main>
    </div>
  );
}

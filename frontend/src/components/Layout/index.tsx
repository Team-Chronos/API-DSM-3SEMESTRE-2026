import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "../sidebar/Sidebar";
import { Navigate, Outlet } from "react-router-dom";

export default function AppLayout() {
  const { user } = useAuth()

  if (!user){
    return <Navigate to={"/login"} replace/>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1020]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1020]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#1b1b1f]">
        <Outlet />
      </main>
    </div>
  );
}

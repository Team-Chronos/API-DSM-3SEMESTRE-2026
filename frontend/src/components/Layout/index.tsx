import { useIsMobile } from "../../hooks/useIsMobile";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";

export default function AppLayout() {
  const isMobile = useIsMobile();
  return (
    <div className="flex relative h-screen overflow-hidden bg-[#0f1020]">
      <Sidebar />
      <main className={`@container flex-1 overflow-y-auto bg-[#1b1b1f] ${isMobile && "pb-18"}`}>
        <Outlet />
      </main>
    </div>
  );
}

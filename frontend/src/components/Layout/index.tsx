import { Outlet } from "react-router-dom"

function Layout() {
  return (
    
    
    <div className="flex h-screen bg-slate-900 font-sans text-slate-900">
      
      <aside className="w-20 bg-black text-slate-200 flex flex-col shadow-lg">
        <div className="p-10 text-2xl font-bold border-b border-slate-700">
          si
        </div>
        <nav className="flex-1 p-4 space-y-2">
          
          <span className="block py-3 px-4 bg-blue-600 text-white rounded-lg font-medium shadow cursor-pointer">
            
          </span> 
        </nav>
      </aside>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-black shadow-sm px-8 py-5 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-slate-700">header</h2>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          {/* O Outlet renderiza a página da rota atual */}
          <Outlet />
        </main>
        <footer className="bg-black border-slate-200 p-4 text-center text-sm text-slate-400">
          © footer
        </footer>
      </div>
    </div>
  )
}

export default Layout
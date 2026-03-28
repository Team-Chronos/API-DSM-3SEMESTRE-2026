import { Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify"

function Layout(){
    return(
        <>
            <header></header>
            <aside></aside>
            <main>
                <Outlet />
            </main>
            <footer></footer>
            <ToastContainer
                theme="dark"
            />
        </>
    )
}
export default Layout
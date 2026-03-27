import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="layout-container" >
      <nav className="navbar min-w-dvh bg-amber-400 border-r border-gray-200 flex flex-col">
        <p>Navbar</p>
      </nav>
      <div style={{display:"flex"}}>
        <aside className="sidebar" style={{backgroundColor:"#83ff6a", width:"200px", height:"600px"}}>
        Sidebar
      </aside>
      <Outlet/>
      </div>
      <footer className="footer" style={{height:"80px", backgroundColor:"#32aeea"}}>
        Footer
      </footer>
    </div>
  );
}

export default Layout;

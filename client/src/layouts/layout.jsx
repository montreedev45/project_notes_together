import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

function Layout() {
  const location = useLocation();

  const pathNoFooter = ['/login', '/sign-up']

  const showFooter = !pathNoFooter.includes(location.pathname)

  console.log(showFooter)
  return (
    <div className="layout-container">
      <Navbar />
      <main className="w-full flex justify-center">
        <Outlet />
      </main>
      {showFooter && <Footer/>}
    </div>
  );
}

export default Layout;

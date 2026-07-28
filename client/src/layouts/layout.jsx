import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

function Layout() {
  const location = useLocation();

  const isResetPasswordPath = location.pathname.startsWith("/reset-password");
  const isAuthPage = ["/login", "/sign-up"].includes(location.pathname);

  const showFooter = !(isAuthPage || isResetPasswordPath);

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

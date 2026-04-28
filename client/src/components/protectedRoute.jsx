import { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const ProtectedRoute = ()=> {
    const location = useLocation();
    const {isAuthenticated, loading, checkAuth} = useAuthStore();

    useEffect(()=>{
        checkAuth();
    }, [])


    if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-3 border-primary"></div>
      </div>
    );
  }

    if(!isAuthenticated){
        return <Navigate to="/login" state={{ from: location}} replace/>
    }

    return <Outlet/>
}

export default ProtectedRoute;
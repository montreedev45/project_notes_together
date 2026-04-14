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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

    if(!isAuthenticated){
        return <Navigate to="/login" state={{ from: location}} replace/>
    }

    return <Outlet/>
}

export default ProtectedRoute;
import { Navigate, Outlet } from "react-router-dom";

import { FullPageLoader } from "./ui/FullPageLoader";
import { useAuth } from "../context/AuthContext";

export function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

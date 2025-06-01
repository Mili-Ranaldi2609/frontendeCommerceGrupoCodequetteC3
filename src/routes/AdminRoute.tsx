
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { JSX } from "react";

export const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated || role !== "ADMIN") {
    return <Navigate to="/" />;
  }

  return children;
};

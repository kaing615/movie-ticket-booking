// src/routes/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RequireAuth() {
  const token = useSelector(s => s.auth?.accessToken) ?? localStorage.getItem("actkn");
  const location = useLocation();
  if (!token) return <Navigate to="/auth/signin" replace state={{ from: location }} />;
  return <Outlet />;
}

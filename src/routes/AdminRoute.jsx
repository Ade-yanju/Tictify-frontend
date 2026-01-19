import { Navigate } from "react-router-dom";
import { getUser } from "../services/authService";

export default function AdminRoute({ children }) {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "admin") {
    return <Navigate to="/organizer/dashboard" replace />;
  }

  return children;
}

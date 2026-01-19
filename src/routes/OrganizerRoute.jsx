import { Navigate } from "react-router-dom";
import { getUser } from "../services/authService";

export default function OrganizerRoute({ children }) {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "organizer") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

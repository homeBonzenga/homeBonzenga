import { Navigate } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("ADMIN" | "MANAGER" | "VENDOR" | "CUSTOMER")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useSupabaseAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    // 🚨 Not logged in
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // 🚨 Logged in but role not allowed
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

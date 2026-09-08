import { Spinner } from "@chakra-ui/react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/providers/AuthProvider";
import styles from "./ProtectedRoute.module.css";

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className={styles.loading}>
        <Spinner color="fg.muted" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "./stores/authStore";
import { socketConnect } from "./services/socketService";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

// Components
import ProtectedRoute from "./components/Common/ProtectedRoute";
import LoadingSpinner from "./components/Common/LoadingSpinner";

function App() {
  const { isAuthenticated, user, checkAuth, loading } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  // ✅ Check authentication status on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
        console.log("✅ Authentication checked");
      } catch (error) {
        console.error("❌ Authentication check failed:", error);
      } finally {
        setAppReady(true);
      }
    };

    initializeAuth();
  }, [checkAuth]);

  // ✅ Connect to Socket.IO when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        socketConnect(user.id);
        console.log("🔌 Socket connected for user:", user.id);
      } catch (error) {
        console.error("❌ Socket connection failed:", error);
      }
    }
  }, [isAuthenticated, user]);

  // ✅ Show a full-screen loader while authentication is being verified
  if (!appReady || loading) {
    return <LoadingSpinner fullScreen />;
  }

  // Debug authentication state
  console.log("Auth state:", { isAuthenticated, user });

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />}
      />

      {/* Protected Routes (Requires Authentication) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Handle nested dashboard routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* Add other dashboard routes here */}
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />

      {/* Catch-All (Redirects unknown paths to home) */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

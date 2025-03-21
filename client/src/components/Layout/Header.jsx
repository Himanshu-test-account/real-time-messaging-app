import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold">
        <Link to={isAuthenticated ? "/dashboard" : "/"}>Messaging App</Link>
      </h1>

      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.name || "User"}!</span>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      ) : (
        <nav>
          <Link to="/login" className="px-4">Login</Link>
          <Link to="/register" className="px-4">Register</Link>
        </nav>
      )}
    </header>
  );
};

export default Header;

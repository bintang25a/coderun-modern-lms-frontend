import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const getAuthUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return null;
    }

    return decoded;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default function ProtectedRole({ allowedRoles }) {
  const user = getAuthUser();
  const location = useLocation();

  console.log(user.role);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAllowed = allowedRoles.includes(user.role);

  return isAllowed ? (
    <Outlet />
  ) : (
    <Navigate
      to={
        user.role === "Admin"
          ? "/admin"
          : user.role === "Asisten"
          ? "/assistant"
          : "/student"
      }
      replace
    />
  );
}

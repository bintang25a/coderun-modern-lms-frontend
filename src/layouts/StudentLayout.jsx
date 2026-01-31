import { Link, useNavigate } from "react-router-dom";
import "./layout.css";
import { logout } from "../_services/auth";
import { useEffect, useState } from "react";
import Loading from "../components/screen/Loading";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function StudentLayout() {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));

    if (userData) {
      setUser(userData);
    }
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await logout();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);

      navigate("/login", { replace: true });
    }
  };

  const handleRefresh = async () => {
    alert("REFRESHHH");
  };

  return (
    <>
      <Sidebar role={user.role} />
      <div className="layout">
        <Header
          user={user}
          handleLogout={handleLogout}
          handleRefresh={handleRefresh}
        />
        <main>INI MAIN</main>
        <Footer />
      </div>

      <Loading isActive={isLoading} />
    </>
  );
}

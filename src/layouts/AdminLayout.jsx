import { Outlet, useNavigate } from "react-router-dom";
import "./layout.css";
import { logout } from "../_services/auth";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Loading from "../components/screen/Loading";
import Alert from "../components/screen/Alert";
import Confirm from "../components/screen/Confirm";

export default function AdminLayout() {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alertSetting, setAllertSetting] = useState({});
  const [confirmSetting, setConfirmSetting] = useState({});
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

  const switchLoading = (on) => {
    on ? setIsLoading(true) : setIsLoading(false);
  };

  const switchAlert = (on) => {
    setAllertSetting({
      ...alertSetting,
      isActive: on ? true : false,
    });
  };

  const switchConfirm = (on) => {
    setConfirmSetting({
      ...confirmSetting,
      isActive: on ? true : false,
    });
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
        <Outlet
          context={{
            switchLoading,
            switchAlert,
            switchConfirm,
            setAllertSetting,
            setConfirmSetting,
          }}
        />
        <Footer />
      </div>

      <Loading isActive={isLoading} />
      <Alert alertSetting={alertSetting} onClose={() => switchAlert(false)} />
      <Confirm confirmSetting={confirmSetting} />
    </>
  );
}

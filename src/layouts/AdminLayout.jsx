import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./layout.css";
import { logout } from "../_services/auth";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Loading from "../components/screen/Loading";
import Alert from "../components/screen/Alert";
import Confirm from "../components/screen/Confirm";
import { getAssignments } from "../_services/assignments";
import { getClassrooms } from "../_services/classrooms";
import { getUsers } from "../_services/users";
import { getMaterials } from "../_services/materials";
import { getSubmissions } from "../_services/submissions";

export default function AdminLayout() {
  const [user, setUser] = useState({});
  const [state, setState] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alertSetting, setAllertSetting] = useState({});
  const [confirmSetting, setConfirmSetting] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const userRole = pathParts[0];
  const pageName = pathParts[1];

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

  const refreshData = async () => {
    switchLoading(true);

    if (pageName === "assignments") {
      const [storageData, classroomsData] = await Promise.all([
        getAssignments(),
        getClassrooms(),
      ]);

      setState({
        data: storageData,
        classrooms: classroomsData,
      });
    } else if (pageName === "classrooms") {
      const [storageData, usersData, materialsData] = await Promise.all([
        getClassrooms(),
        getUsers(),
        getMaterials(),
      ]);

      setState({
        data: storageData,
        users: usersData,
        materials: materialsData,
      });
    } else if (pageName === "materials") {
      const [storageData] = await Promise.all([getMaterials()]);

      setState({
        data: storageData,
      });
    } else if (pageName === "submissions") {
      const [storageData] = await Promise.all([getSubmissions()]);

      setState({
        data: storageData,
      });
    } else if (pageName === "users") {
      const [storageData] = await Promise.all([getUsers()]);

      setState({
        data: storageData,
      });
    }

    setTimeout(() => switchLoading(false), 50);
  };

  const handleRefresh = async () => {
    refreshData();
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
          role={userRole}
        />
        <Outlet
          context={{
            switchLoading,
            switchAlert,
            switchConfirm,
            setAllertSetting,
            setConfirmSetting,
            refreshData,
            state,
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

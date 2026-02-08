import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import "./layout.css";
import { logout } from "../_services/auth";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Loading from "../components/screen/Loading";
import Alert from "../components/screen/Alert";
import Confirm from "../components/screen/Confirm";
import { showUser } from "../_services/users";
import { showAssignment } from "../_services/assignments";
import LoadingMessage from "../components/screen/LoadingMessage";
import { showClassroom } from "../_services/classrooms";
import { getMaterials } from "../_services/materials";

export default function PublicLayout() {
  const [user, setUser] = useState({});
  const [state, setState] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSetting, setLoadingSetting] = useState({});
  const [alertSetting, setAllertSetting] = useState({});
  const [confirmSetting, setConfirmSetting] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;
  const pathParts = location.pathname.split("/").filter(Boolean);
  const userRole = pathParts[0];
  const pageName = pathParts[1];
  const paramId = pathParts[2];

  const { id } = useParams();

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

    // ===== USER INFO =====
    const tempUser = localStorage.getItem("user");
    const fixUser = tempUser ? JSON.parse(tempUser) : "";
    const class_code = localStorage.getItem("class_code");

    // ===== KONDISI =====
    const isAssignment = pathname.startsWith(
      `/${userRole}/classrooms/assignments/`
    );
    const isMaterials = pathname.startsWith(
      `/${userRole}/classrooms/materials/`
    );
    const isClassroom = pathname.startsWith(`/${userRole}/classrooms/`);

    if ((pageName === "classrooms" || pageName === "assignments") && !paramId) {
      const [user] = await Promise.all([showUser(fixUser?.uid)]);

      setState({
        user: user,
        classrooms: user?.role === "Asisten" ? user?.assists : user?.classrooms,
      });
    } else if (isAssignment) {
      const [assignmentData] = await Promise.all([
        showAssignment(class_code, id),
      ]);

      setState({
        assignment: assignmentData,
        submissions: assignmentData?.submissions,
      });
    } else if (isMaterials) {
      const [classroomData, materialsData] = await Promise.all([
        showClassroom(class_code),
        getMaterials(),
      ]);

      setState({
        classroom: classroomData,
        materials: materialsData,
        classMaterials: classroomData?.materials,
      });
    } else if (isClassroom) {
      const [classroomData] = await Promise.all([showClassroom(class_code)]);

      setState({
        classroom: classroomData,
      });
    } else if (paramId) {
      const [user] = await Promise.all([showUser(fixUser?.uid)]);

      setState({
        user: user,
        classrooms: user?.role === "Asisten" ? user?.assists : user?.classrooms,
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
            setLoadingSetting,
            setAllertSetting,
            setConfirmSetting,
            refreshData,
            userRole,
            state,
          }}
        />
        <Footer />
      </div>

      <Loading isActive={isLoading} />
      <LoadingMessage loadingSetting={loadingSetting} />
      <Alert alertSetting={alertSetting} onClose={() => switchAlert(false)} />
      <Confirm confirmSetting={confirmSetting} />
    </>
  );
}

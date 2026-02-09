import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { logout } from "../_services/auth";
import { showUser } from "../_services/users";
import { showAssignment } from "../_services/assignments";
import { showClassroom } from "../_services/classrooms";
import { getMaterials } from "../_services/materials";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Alert from "../components/screen/Alert";
import Confirm from "../components/screen/Confirm";
import Loading from "../components/screen/Loading";
import LoadingMessage from "../components/screen/LoadingMessage";
import "./layout.css";
import { showSubmission } from "../_services/submissions";

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const pathname = location.pathname;

  const [user, setUser] = useState({});
  const [userUid, setUserUid] = useState("");
  const [userRole, setUserRole] = useState("");

  const [state, setState] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSetting, setLoadingSetting] = useState({});
  const [alertSetting, setAllertSetting] = useState({});
  const [confirmSetting, setConfirmSetting] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAllertSetting({
        isActive: true,
        message: "Token not found, returning to login",
      });

      return navigate("/login", { replace: true });
    }

    const fetchUser = async (id) => {
      try {
        const userData = await showUser(id);

        setUser(userData);
      } catch (error) {
        setAllertSetting({
          isActive: true,
          message: error,
        });
      }
    };

    try {
      const decoded = jwtDecode(token);

      const role = {
        Praktikan: "student",
        Asisten: "assistant",
        Admin: "admin",
      };

      setUserUid(decoded?.uid);
      setUserRole(role[decoded?.role]);

      fetchUser(decoded?.uid);
    } catch (error) {
      setAllertSetting({
        isActive: true,
        message: error,
      });
    }
  }, [navigate]);

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

    try {
      const [userData] = await Promise.all([showUser(userUid)]);

      if (pathname === `/${userRole}/classrooms`) {
        const classroomsData =
          userRole === "assistant" ? userData?.assists : userData?.classrooms;

        setState({
          classrooms: classroomsData,
        });
      } else if (pathname === `/${userRole}/classrooms/assignments`) {
        const class_code = sessionStorage.getItem("class_code");

        if (!class_code) {
          setAllertSetting({
            isActive: true,
            message: "Classroom not found, returning...",
          });

          return navigate(`/${userRole}/classrooms`);
        }

        const [classroomsData] = await Promise.all([showClassroom(class_code)]);

        const assignmentsData = classroomsData?.assignments;

        setState({
          classroom: classroomsData,
          assignments: assignmentsData,
        });
      } else if (pathname.startsWith(`/${userRole}/classrooms/assignments/`)) {
        const class_code = sessionStorage.getItem("class_code");
        const submission_number = sessionStorage.getItem("submission_number");

        if (!class_code) {
          setAllertSetting({
            isActive: true,
            message: "Classroom not found, returning...",
          });

          return navigate(`/${userRole}/classrooms`);
        }

        const [assignmentData, submissionData] = await Promise.all([
          showAssignment(class_code, id),
          showSubmission(id, submission_number),
        ]);

        setState({
          assignment: assignmentData,
          submissions: assignmentData?.submissions,
          submission: submissionData ? submissionData : {},
        });
      } else if (pathname === `/${userRole}/classrooms/materials`) {
        const class_code = sessionStorage.getItem("class_code");

        if (!class_code) {
          setAllertSetting({
            isActive: true,
            message: "Classroom not found, returning...",
          });

          return navigate(`/${userRole}/classrooms`);
        }

        const [classroomsData, materialsData] = await Promise.all([
          showClassroom(class_code),
          getMaterials(),
        ]);

        const classMaterialsData = classroomsData?.materials;

        setState({
          classroom: classroomsData,
          materials: materialsData,
          classMaterials: classMaterialsData,
        });
      } else if (pathname.startsWith(`/${userRole}/classrooms/`)) {
        const [classroomData] = await Promise.all([showClassroom(id)]);

        setState({
          classroom: classroomData,
        });
      }
    } catch (error) {
      setAllertSetting({
        isActive: true,
        message: error,
      });
    } finally {
      setTimeout(() => switchLoading(false), 200);
    }
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
      <Sidebar role={userRole} />
      <div className="layout">
        <Header
          user={user}
          handleLogout={handleLogout}
          handleRefresh={handleRefresh}
          role={userRole}
        />
        <Outlet
          context={{
            user,
            userUid,
            userRole,
            state,
            switchLoading,
            switchAlert,
            switchConfirm,
            setLoadingSetting,
            setAllertSetting,
            setConfirmSetting,
            refreshData,
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

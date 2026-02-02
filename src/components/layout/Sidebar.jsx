import { Link } from "react-router-dom";
import {
  FaGraduationCap,
  FaHome,
  FaChalkboard,
  FaBookOpen,
  FaClipboardList,
  FaUser,
  FaClipboardCheck,
  FaUsers,
  FaUserFriends,
} from "react-icons/fa";
import { FaUsersBetweenLines } from "react-icons/fa6";

const MainGeneral = () => {
  const fixRole = "student";

  return (
    <main className="content">
      <Link to={`/${fixRole}`} className="nav-list">
        <FaHome className="icon" />
        Dashboard
      </Link>
      <Link to={`/${fixRole}/classrooms`} className="nav-list">
        <FaChalkboard className="icon" />
        Classroom
      </Link>
      <Link to={`/${fixRole}/materials`} className="nav-list">
        <FaBookOpen className="icon" />
        Material
      </Link>
      <Link to={`/${fixRole}/assignments`} className="nav-list">
        <FaClipboardList className="icon" />
        Assignment
      </Link>
      <Link to={"profile"} className="nav-list">
        <FaUser className="icon" />
        Profile
      </Link>
    </main>
  );
};

const MainAdmin = () => {
  return (
    <main className="content">
      <Link to={"/admin"} className="nav-list">
        <FaHome className="icon" />
        Dashboard
      </Link>
      <Link to={"/admin/users"} className="nav-list">
        <FaUsers className="icon" />
        Users
      </Link>
      <Link to={"/admin/assistants"} className="nav-list">
        <FaUserFriends className="icon" />
        Assistants
      </Link>
      <Link to={"/admin/students"} className="nav-list">
        <FaUsersBetweenLines className="icon" />
        Students
      </Link>
      <Link to={"/admin/classrooms"} className="nav-list">
        <FaChalkboard className="icon" />
        Classrooms
      </Link>
      <Link to={"/admin/materials"} className="nav-list">
        <FaBookOpen className="icon" />
        Materials
      </Link>
      <Link to={"/admin/assignments"} className="nav-list">
        <FaClipboardList className="icon" />
        Assignments
      </Link>
      <Link to={"/admin/submissions"} className="nav-list">
        <FaClipboardCheck className="icon" />
        Submissions
      </Link>
    </main>
  );
};

const Sidebar = ({ role }) => {
  return (
    <aside className="layout-aside">
      <header className="header">
        <FaGraduationCap className="icon" />
        <div className="text">
          <h1>Coderun Modern</h1>
          <h2>Learning Management System</h2>
        </div>
      </header>
      {role === "Admin" ? <MainAdmin /> : <MainGeneral />}
    </aside>
  );
};

export default Sidebar;

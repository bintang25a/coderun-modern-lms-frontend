import { Link } from "react-router-dom";
import {
  FaGraduationCap,
  FaChalkboard,
  FaBookOpen,
  FaClipboardList,
  FaUser,
  FaClipboardCheck,
  FaUsers,
  FaHouse,
  FaBriefcase,
} from "react-icons/fa6";

const MainGeneral = ({ role }) => {
  const path = role == "assistant" ? "assistant" : "student";

  return (
    <main className="content__layout-component">
      <Link to={`/${path}`} className="nav-list__layout-component">
        <FaHouse className="icon__layout-component" />
        Dashboard
      </Link>
      <Link to={`/${path}/classrooms`} className="nav-list__layout-component">
        <FaChalkboard className="icon__layout-component" />
        Classroom
      </Link>
      {path === "assistant" ? (
        <Link to={`/${path}/workspaces`} className="nav-list__layout-component">
          <FaBriefcase className="icon__layout-component" />
          Workspace
        </Link>
      ) : (
        <>
          <Link
            to={`/${path}/materials`}
            className="nav-list__layout-component"
          >
            <FaBookOpen className="icon__layout-component" />
            Material
          </Link>
          <Link
            to={`/${path}/assignments`}
            className="nav-list__layout-component"
          >
            <FaClipboardList className="icon__layout-component" />
            Assignment
          </Link>
        </>
      )}
      <Link to={"../profile"} className="nav-list__layout-component">
        <FaUser className="icon__layout-component" />
        Profile
      </Link>
    </main>
  );
};

const MainAdmin = () => {
  return (
    <main className="content__layout-component">
      <Link to={"/admin"} className="nav-list__layout-component">
        <FaHouse className="icon__layout-component" />
        Dashboard
      </Link>
      <Link to={"/admin/users"} className="nav-list__layout-component">
        <FaUsers className="icon__layout-component" />
        Users
      </Link>
      <Link to={"/admin/classrooms"} className="nav-list__layout-component">
        <FaChalkboard className="icon__layout-component" />
        Classrooms
      </Link>
      <Link to={"/admin/materials"} className="nav-list__layout-component">
        <FaBookOpen className="icon__layout-component" />
        Materials
      </Link>
      <Link to={"/admin/assignments"} className="nav-list__layout-component">
        <FaClipboardList className="icon__layout-component" />
        Assignments
      </Link>
      <Link to={"/admin/submissions"} className="nav-list__layout-component">
        <FaClipboardCheck className="icon__layout-component" />
        Submissions
      </Link>
    </main>
  );
};

const Sidebar = ({ role }) => {
  return (
    <aside className="__sidebar__layout-component">
      <header className="header__layout-component">
        <FaGraduationCap className="icon__layout-component" />
        <div className="text__layout-component">
          <h1 className="text-top__layout-component">Coderun Modern</h1>
          <h2 className="text-bottom__layout-component">
            Learning Management System
          </h2>
        </div>
      </header>
      {role === "admin" ? <MainAdmin /> : <MainGeneral role={role} />}
    </aside>
  );
};

export default Sidebar;

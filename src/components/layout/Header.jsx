import { Link, useNavigate } from "react-router-dom";
import {
  FaHouse,
  FaUser,
  FaRotateRight,
  FaRightFromBracket,
  FaBackward,
} from "react-icons/fa6";

const Header = ({ user, handleLogout, handleRefresh, role }) => {
  const navigate = useNavigate();

  return (
    <header className="__header__layout-component">
      <section className="left__layout-component">
        {role.toLowerCase() !== "admin" ? (
          <button
            className="action-list__layout-component"
            title="Back"
            onClick={() => navigate(-1)}
          >
            <FaBackward />
          </button>
        ) : null}
        <Link
          to={`/${role}`}
          className="action-list__layout-component"
          title="Dashboard"
        >
          <FaHouse className="icon__layout-component" />
        </Link>
        <Link
          to={"/profile"}
          className="action-list__layout-component"
          title="Profile"
        >
          <FaUser className="icon__layout-component" />
        </Link>
        <button
          className="action-list__layout-component"
          title="Refresh"
          onClick={handleRefresh}
        >
          <FaRotateRight className="icon" />
        </button>
        <button
          className="action-list__layout-component"
          title="Logout"
          onClick={handleLogout}
        >
          <FaRightFromBracket className="icon__layout-component" />
        </button>
      </section>
      <section className="right__layout-component">
        <div className="text__layout-component">
          <h1 className="name__layout-component">{user.name}</h1>
          <span className="role__layout-component">{user.role}</span>
        </div>
        <div className="image__layout-component">B</div>
      </section>
    </header>
  );
};

export default Header;

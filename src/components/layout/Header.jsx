import { Link } from "react-router-dom";
import {
  FaHouse,
  FaUser,
  FaRotateRight,
  FaRightFromBracket,
} from "react-icons/fa6";

const Header = ({ user, handleLogout, handleRefresh, role }) => {
  return (
    <header className="__header__layout-component">
      <section className="left__layout-component">
        <button
          className="action-list__layout-component"
          title="refresh"
          onClick={handleRefresh}
        >
          <FaRotateRight className="icon" />
        </button>
        <Link
          to={`/${role}`}
          className="action-list__layout-component"
          title="dashboard"
        >
          <FaHouse className="icon__layout-component" />
        </Link>
        <Link
          to={"/profile"}
          className="action-list__layout-component"
          title="profile"
        >
          <FaUser className="icon__layout-component" />
        </Link>
        <button
          className="action-list__layout-component"
          title="logout"
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

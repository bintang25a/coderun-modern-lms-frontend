import { Link } from "react-router-dom";
import { FaHome, FaUser, FaRedo, FaSignOutAlt } from "react-icons/fa";

const Header = ({ user, handleLogout, handleRefresh }) => {
  return (
    <header className="header">
      <section className="left">
        <button className="action-list" title="refresh" onClick={handleRefresh}>
          <FaRedo className="icon" />
        </button>
        <Link
          to={"/student/dashboard"}
          className="action-list"
          title="dashboard"
        >
          <FaHome className="icon" />
        </Link>
        <Link to={"/profile"} className="action-list" title="profile">
          <FaUser className="icon" />
        </Link>
        <button className="action-list" title="logout" onClick={handleLogout}>
          <FaSignOutAlt className="icon" />
        </button>
      </section>
      <section className="right">
        <div className="text">
          <h1>{user.name}</h1>
          <span>{user.role}</span>
        </div>
        <div className="image">B</div>
      </section>
    </header>
  );
};

export default Header;

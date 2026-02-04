import { Link } from "react-router-dom";
import {
  FaHouse,
  FaUser,
  FaRotateRight,
  FaRightFromBracket,
} from "react-icons/fa6";

const Header = ({ user, handleLogout, handleRefresh, role }) => {
  return (
    <header className="header">
      <section className="left">
        <button className="action-list" title="refresh" onClick={handleRefresh}>
          <FaRotateRight className="icon" />
        </button>
        <Link to={`/${role}`} className="action-list" title="dashboard">
          <FaHouse className="icon" />
        </Link>
        <Link to={"/profile"} className="action-list" title="profile">
          <FaUser className="icon" />
        </Link>
        <button className="action-list" title="logout" onClick={handleLogout}>
          <FaRightFromBracket className="icon" />
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

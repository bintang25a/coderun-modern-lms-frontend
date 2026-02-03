import { useEffect, useState } from "react";
import { login, logout } from "../../_services/auth";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaMailBulk,
  FaRegPaperPlane,
  FaEye,
} from "react-icons/fa";
import Loading from "../../components/screen/Loading";
import "./auth.css";
import Alert from "../../components/screen/Alert";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [allertSetting, setAllertSetting] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    uid: "",
    password: "",
    role: "Praktikan",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const forceLogout = async () => {
      const token = localStorage.getItem("token");

      try {
        if (token) {
          await logout();
        }
      } catch (error) {
        console.log(error);
      }
    };

    forceLogout();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const alertClose = () => {
    setAllertSetting({ ...allertSetting, isActive: false });
  };

  const handleSubmit = async () => {
    const data = JSON.stringify(formData);
    setIsLoading(true);

    let path =
      formData.role === "Praktikan"
        ? "/student"
        : formData.role === "Asisten"
        ? "/assistant"
        : "/admin";

    try {
      await login(data);

      setTimeout(() => {
        navigate(path, { replace: true });
      }, 500);
    } catch (error) {
      setAllertSetting({
        isActive: true,
        message: error,
        isSuccess: false,
      });

      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPassword = () => {
    setShowPass(!showPass);
  };

  return (
    <main id="login">
      <div className="left-container">
        <header className="header">
          <FaGraduationCap className="icon" />
          <h1>
            Coderun Modern LMS <br /> Improve Your Assessment Experience!
          </h1>
        </header>
        <main className="content">
          <ul>
            <li>
              Sistem LMS ini hadir sebagai platform praktikum pemrograman yang
              modern, interaktif, dan terpercaya.
            </li>
            <li>
              Website ini mendukung kompilasi kode langsung serta penilaian
              otomatis untuk mempermudah mahasiswa dan asisten.{" "}
            </li>
            <li>
              Dirancang dengan fokus pada efisiensi dan pengalaman pengguna,
              platform ini menjadi langkah nyata menuju pembelajaran pemrograman
              yang lebih cepat dan tepat.
            </li>
          </ul>
        </main>
        <footer className="footer">
          <h2>Get to know, Bintang Al Fizar</h2>
          <div className="social-container">
            <a
              className="social"
              href="https://linkedin.com/in/bintang25a"
              target="_blank"
              title="LinkedIn"
            >
              <FaLinkedin className="icon" />
              Bintang Al Fizar
            </a>
            <a
              className="social"
              href="https://github.com/bintang25a"
              target="_blank"
              title="Github"
            >
              <FaGithub className="icon" />
              bintang25a
            </a>
            <a
              className="social"
              href="https://instagram.com/bintang_alfizar_"
              target="_blank"
              title="Instagram"
            >
              <FaInstagram className="icon" />
              bintang_alfizar_
            </a>
            <a
              className="social"
              href="mailto:bintangalfizar25@gmail.com"
              target="_blank"
              title="Email"
            >
              <FaMailBulk className="icon" />
              bintangalfizar25@gmail.com
            </a>
          </div>
        </footer>
      </div>
      <div className="right-container">
        <header className="header">
          <FaGraduationCap className="icon" />
          <h1>Learning Management System</h1>
        </header>
        <div className="greetings">
          <h2>Welcome Back!</h2>
          <h3>Sign in to continue your learning journey</h3>
        </div>
        <div className="login-container">
          <div className="input-field">
            <label htmlFor="uid">Unique Identity</label>
            <input
              type="text"
              name="uid"
              id="uid"
              placeholder="Enter your NIM/NIDN/NIP"
              onChange={handleChange}
            />
          </div>
          <div className="input-field">
            <label htmlFor="password">
              Password{" "}
              <FaEye
                className="icon"
                title={showPass ? "Hide Password" : "Show Password"}
                onClick={handleShowPassword}
              />
            </label>
            <input
              type={showPass ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Enter your password"
              autoComplete="new-password"
              onChange={handleChange}
            />
          </div>
          <div className="input-field">
            <label htmlFor="role">Role</label>
            <select name="role" id="role" onChange={handleChange}>
              <option value="Praktikan">Praktikan</option>
              <option value="Asisten">Asisten</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button type="submit" onClick={handleSubmit}>
            <FaRegPaperPlane />
            Login
          </button>
        </div>
      </div>

      <Loading isActive={isLoading} />
      <Alert alertSetting={allertSetting} onClose={alertClose} />
    </main>
  );
}

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
      }, 250);
    } catch (error) {
      setAllertSetting({
        isActive: true,
        message: error,
        isSuccess: false,
      });

      console.log(error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const handleShowPassword = () => {
    setShowPass(!showPass);
  };

  return (
    <main className="login__auth-page">
      <div className="left-container__auth-page">
        <header className="header__auth-page">
          <FaGraduationCap className="icon__auth-page" />
          <h1 className="title-1__auth-page">
            Coderun Modern LMS <br /> Improve Your Assessment Experience!
          </h1>
        </header>
        <main className="content__auth-page">
          <ul className="list-container__auth-page">
            <li className="list__auth-page">
              Sistem LMS ini hadir sebagai platform praktikum pemrograman yang
              modern, interaktif, dan terpercaya.
            </li>
            <li className="list__auth-page">
              Website ini mendukung kompilasi kode langsung serta penilaian
              otomatis untuk mempermudah mahasiswa dan asisten.{" "}
            </li>
            <li className="list__auth-page">
              Dirancang dengan fokus pada efisiensi dan pengalaman pengguna,
              platform ini menjadi langkah nyata menuju pembelajaran pemrograman
              yang lebih cepat dan tepat.
            </li>
          </ul>
        </main>
        <footer className="footer__auth-page">
          <h2 className="title-2__auth-page">Get to know, Bintang Al Fizar</h2>
          <div className="social-container__auth-page">
            <a
              className="social__auth-page"
              href="https://linkedin.com/in/bintang25a"
              target="_blank"
              title="LinkedIn"
            >
              <FaLinkedin className="icon__auth-page" />
              Bintang Al Fizar
            </a>
            <a
              className="social__auth-page"
              href="https://github.com/bintang25a"
              target="_blank"
              title="Github"
            >
              <FaGithub className="icon__auth-page" />
              bintang25a
            </a>
            <a
              className="social__auth-page"
              href="https://instagram.com/bintang_alfizar_"
              target="_blank"
              title="Instagram"
            >
              <FaInstagram className="icon__auth-page" />
              bintang_alfizar_
            </a>
            <a
              className="social__auth-page"
              href="mailto:bintangalfizar25@gmail.com"
              target="_blank"
              title="Email"
            >
              <FaMailBulk className="icon__auth-page" />
              bintangalfizar25@gmail.com
            </a>
          </div>
        </footer>
      </div>
      <div className="right-container__auth-page">
        <header className="header__auth-page">
          <FaGraduationCap className="icon__auth-page" />
          <h1 className="title-1__auth-page">Learning Management System</h1>
        </header>
        <div className="greetings__auth-page">
          <h2 className="title-2__auth-page">Welcome Back!</h2>
          <h3 className="title-3__auth-page">
            Sign in to continue your learning journey
          </h3>
        </div>
        <div className="login-container__auth-page">
          <div className="input-field__auth-page">
            <label className="label__auth-page" htmlFor="uid">
              Unique Identity
            </label>
            <input
              className="input__auth-page"
              type="text"
              name="uid"
              id="uid"
              placeholder="Enter your NIM/NIDN/NIP"
              onChange={handleChange}
            />
          </div>
          <div className="input-field__auth-page">
            <label className="label__auth-page" htmlFor="password">
              Password{" "}
              <FaEye
                className="icon__auth-page"
                title={showPass ? "Hide Password" : "Show Password"}
                onClick={handleShowPassword}
              />
            </label>
            <input
              className="input__auth-page"
              type={showPass ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Enter your password"
              autoComplete="new-password"
              onChange={handleChange}
            />
          </div>
          <div className="input-field__auth-page">
            <label className="label__auth-page" htmlFor="role">
              Role
            </label>
            <select
              className="select__auth-page"
              name="role"
              id="role"
              onChange={handleChange}
            >
              <option value="Praktikan">Praktikan</option>
              <option value="Asisten">Asisten</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            className="button__auth-page"
            type="submit"
            onClick={handleSubmit}
          >
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

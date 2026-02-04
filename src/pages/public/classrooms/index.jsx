import { FaChalkboardUser, FaMagnifyingGlass } from "react-icons/fa6";
import "../public.css";

import { showUser } from "../../../_services/users";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { createStudent } from "../../../_services/studentClassroom";
import ManageDataField from "../../../components/action/ManageDataField";

export default function Classrooms() {
  const { switchLoading, setAllertSetting, refreshData, state } =
    useOutletContext();

  const [user, setUser] = useState({});
  const [classrooms, setClassrooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const tempUser = localStorage.getItem("user");
      const fixUser = tempUser ? JSON.parse(tempUser) : "";

      try {
        switchLoading(true);

        const [storageData] = await Promise.all([showUser(fixUser?.uid)]);

        setUser(storageData);
        setClassrooms(
          fixUser?.role === "Asisten"
            ? storageData?.assists
            : storageData?.classrooms
        );
      } catch (error) {
        console.log("Fetch error:", error);

        setAllertSetting({
          isActive: true,
          message: error,
          isSuccess: false,
        });
      } finally {
        setTimeout(() => switchLoading(false), 100);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tempUser = localStorage.getItem("user");
    const fixUser = tempUser ? JSON.parse(tempUser) : "";

    setUser(state?.data);
    setClassrooms(
      fixUser?.role === "Asisten"
        ? state?.data?.assists
        : state?.data?.classrooms
    );
  }, [state]);

  const getClassColor = (classCode) => {
    const savedColors = JSON.parse(
      localStorage.getItem("classroom_colors") || "{}"
    );

    if (savedColors[classCode]) {
      return savedColors[classCode];
    }

    const randomNum = Math.floor(Math.random() * 10) + 1;
    const newColorClass = `color-${randomNum}`;

    savedColors[classCode] = newColorClass;
    localStorage.setItem("classroom_colors", JSON.stringify(savedColors));

    return newColorClass;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = classrooms?.filter((item) => {
    const columnsToSearch = ["class_code", "name"];

    return columnsToSearch.some((key) => {
      const value = item[key];

      if (value === null || value === undefined) return false;

      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const closeModal = () => {
    setModal({ ...modal, isActive: false });
  };

  const handleJoinClassroom = async (formData) => {
    const submitForm = {
      ...formData,
      uid: user?.uid,
    };

    await createStudent(submitForm);
  };

  const toggleModal = (param) => {
    const {
      mode = "field",
      isActive = false,
      type,
      fields,
      onClose = closeModal,
      onSubmit,
    } = param;

    setModal({
      mode,
      isActive,
      type,
      fields,
      onClose,
      onSubmit,
    });
  };

  return (
    <main className="__public-page">
      <nav className="navbar__public-page">
        <section className="left__public-page">
          <h1 className="title__public-page">Classrooms</h1>
        </section>
        <section className="right__public-page">
          <div className="action__public-page">
            <button
              title="Join Classroom"
              className="button__public-page"
              onClick={() =>
                toggleModal({
                  isActive: true,
                  type: "or Join Classroom",
                  fields: [
                    {
                      name: "class_code",
                      label: "Class Code",
                      placeholder: "Enter class code to join",
                    },
                  ],
                  onSubmit: handleJoinClassroom,
                })
              }
            >
              <FaChalkboardUser className="icon__public-page" />
            </button>
          </div>
          <div className="input__public-page">
            <input
              type="search"
              placeholder="Search by anything"
              onChange={handleSearch}
              title="Search classrooms"
            />
            <FaMagnifyingGlass className="icon__public-page" />
          </div>
        </section>
      </nav>
      <div className="content-container__public-page">
        <div className="single-content__public-page span-3__public-page">
          {classrooms
            ? filteredData?.map((c) => {
                const colorClass = getClassColor(c.class_code);

                return (
                  <Link
                    to={`${c.class_code}`}
                    key={c.class_code}
                    className={`classroom-card__public-page ${colorClass}`}
                  >
                    <header className="header-card__public-page">
                      {c.name}
                    </header>
                    <main className="main-card__public-page">
                      Tutor/Asisten:
                      <br />
                      {c?.assistants?.map((a) => a.name)?.join("/")}
                    </main>
                    <footer className="footer-card__public-page">
                      Code: {c.class_code}
                    </footer>
                  </Link>
                );
              })
            : null}
        </div>
      </div>

      {modal.isActive && modal.mode === "field" ? (
        <ManageDataField
          isActive={modal?.isActive}
          type={modal?.type}
          fields={modal?.fields}
          onClose={modal?.onClose}
          onSubmit={modal?.onSubmit}
          loadingSetting={switchLoading}
          allertSetting={setAllertSetting}
          fetchData={refreshData}
        />
      ) : null}
    </main>
  );
}

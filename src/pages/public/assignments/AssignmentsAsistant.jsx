import { FaFileCode, FaPaperPlane } from "react-icons/fa6";
import { showUser } from "../../../_services/users";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { AiOutlineFileAdd, AiOutlineFileSearch } from "react-icons/ai";
import { createAssignment } from "../../../_services/assignments";

import "../public.css";

const AssignmentList = ({ item }) => {
  const handleClassCode = () => {
    const class_code = item?.class_code;

    localStorage.setItem("class_code", class_code);
  };

  return (
    <Link
      to={`${item?.assignment_number}`}
      onClick={handleClassCode}
      className="assignment-list__public-page __assignments-assistant"
    >
      <h2 title={item?.title} className="title-text__public-page">
        {item?.title}
      </h2>
    </Link>
  );
};

export default function AssignmentsAssistant() {
  const { switchLoading, setAllertSetting, refreshData, state, userRole } =
    useOutletContext();

  const [user, setUser] = useState({});
  const [classroom, setClassroom] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({ overtime: false });
  const [fileSelected, setFileSelected] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const tempUser = localStorage.getItem("user");
      const fixUser = tempUser ? JSON.parse(tempUser) : "";
      user?.uid;

      try {
        switchLoading(true);

        const [storageData] = await Promise.all([showUser(fixUser?.uid)]);

        const class_code = localStorage.getItem("class_code");
        const tempClassroom = storageData?.assists?.find(
          (classroom) => classroom?.class_code === class_code
        );
        const tempAssignments = tempClassroom?.assignments;

        setUser(storageData);
        setClassroom(tempClassroom);
        setAssignments(tempAssignments);
      } catch (error) {
        console.log("Fetch error:", error);

        setAllertSetting({
          isActive: true,
          message: error,
        });
      } finally {
        setTimeout(() => switchLoading(false), 100);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tempuser = state?.data || {};
    const class_code = localStorage.getItem("class_code");
    const tempClassroom = tempuser?.assists?.find(
      (classroom) => classroom?.class_code === class_code
    );
    const tempAssignments = tempClassroom?.assignments;

    setUser(tempuser);
    setClassroom(tempClassroom);
    setAssignments(tempAssignments);
  }, [state]);

  const handleChange = (e) => {
    const { files, name, value } = e.target;

    if (name === "answer") {
      setFileSelected(files[0]?.name);

      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    switchLoading(true);

    const hasFile = Object.values(formData).some(
      (value) => value instanceof File
    );

    let payload;

    if (hasFile) {
      payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          payload.append(key, value);
        }
      });
    } else {
      payload = formData;
    }

    const class_code = localStorage.getItem("class_code");

    try {
      await createAssignment(class_code, payload);

      setAllertSetting({
        isActive: true,
        message: `Create assignment success`,
        isSuccess: true,
      });

      setFormData({ overtime: false });

      await refreshData();
    } catch (error) {
      setAllertSetting({
        isActive: true,
        message: error,
        isSuccess: false,
      });
    } finally {
      switchLoading(false);
    }
  };

  return (
    <main className="__public-page">
      <nav className="navbar__public-page">
        <section className="left__public-page">
          <h1 className="title__public-page">Class Assignments</h1>
        </section>
        <section className="right__public-page">
          <Link
            to={`/${userRole}/classrooms/${classroom?.class_code}`}
            className="title__public-page"
          >
            Classrooms: {`${classroom?.name} [${classroom?.class_code}]`}
          </Link>
        </section>
      </nav>
      <div className="content-container__public-page">
        <div className="assignments-left-content__public-page span-2__public-page">
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Assignment title"
            className="input__public-page title__public-page"
            value={formData?.title}
            onChange={handleChange}
          />
          <textarea
            name="description"
            id="description"
            placeholder="Assignment description"
            className="textarea__public-page description__public-page"
            value={formData?.description}
            onChange={handleChange}
          />
          <div className="date__public-page">
            <div className="date-item__public-page">
              <label className="label__public-page" htmlFor="startAt">
                Start Date
              </label>
              <input
                type="date"
                name="startAt"
                id="startAt"
                className=" input__public-page"
                value={formData?.startAt}
                onChange={handleChange}
              />
            </div>
            <div className="date-item__public-page">
              <label className="label__public-page" htmlFor="endAt">
                End Date
              </label>
              <input
                type="date"
                name="endAt"
                id="endAt"
                className="input__public-page"
                value={formData?.endAt}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="support-link__public-page">
            <label className="label__public-page" htmlFor="support_link">
              Place suport link (multiple link? separate with space)
            </label>
            <input
              type="text"
              name="support_link"
              id="support_link"
              placeholder="Input link here"
              className="input__public-page"
              value={formData?.support_link}
              onChange={handleChange}
            />
          </div>
          <div className="action__public-page">
            <label
              className="action-item__public-page label__public-page"
              htmlFor="answer"
            >
              {!fileSelected ? (
                <>
                  <FaFileCode /> Choose Answer key
                </>
              ) : (
                <>{fileSelected}</>
              )}
              <input
                type="file"
                name="answer"
                id="answer"
                className="input__public-page"
                onChange={handleChange}
              />
            </label>
            <button
              className="action-item__public-page button__public-page"
              onClick={() =>
                setFormData({
                  ...formData,
                  overtime: !formData?.overtime,
                })
              }
            >
              Overtime: {formData?.overtime ? "Allowed" : "Disallowed"}
            </button>
            <button className="action-item__public-page button__public-page">
              <AiOutlineFileAdd />
            </button>
            <button className="action-item__public-page button__public-page">
              <AiOutlineFileSearch />
            </button>
            <button
              className="action-item__public-page button__public-page"
              onClick={handleSubmit}
            >
              <FaPaperPlane /> Submit Assignment
            </button>
          </div>
        </div>
        <div className="assignments-right-content__public-page">
          <h1 className="title__public-page __assignments-assistant">List</h1>
          {assignments?.length > 0
            ? assignments?.map((a) => (
                <AssignmentList key={a.assignment_number} item={a} />
              ))
            : null}
        </div>
      </div>
    </main>
  );
}

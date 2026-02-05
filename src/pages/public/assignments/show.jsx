import { FaFileCode, FaMagnifyingGlass } from "react-icons/fa6";
import "../public.css";

import { showUser } from "../../../_services/users";
import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { formatDate } from "../../../_utilities/formatDate";
import { showAssignment } from "../../../_services/assignments";
import { createSubmission } from "../../../_services/submissions";
import { runCode } from "../../../_services/actions";
import { CiBaseball } from "react-icons/ci";

const AssignmentList = ({ item }) => {
  return (
    <Link
      to={`${item?.assignment_number}`}
      className="assignment-list__public-page"
    >
      <h2 title={item?.title} className="title-text__public-page">
        {item?.title}
      </h2>
      <div className="text-container__public-page">
        <p
          title={`Class: ${item?.class_code} / Uploaded by: ${item?.assistant?.name}`}
          className="text-top__public-page"
        >
          Class: {item?.class_code} / Uploaded by: {item?.assistant?.name}
        </p>
        <p
          title={`Due date: ${formatDate(item?.endAt)}`}
          className="text-bottom__public-page"
        >
          Due date: {formatDate(item?.endAt)}
        </p>
      </div>
    </Link>
  );
};

export default function Assignment() {
  const { switchLoading, setAllertSetting, state } = useOutletContext();
  const { id } = useParams();

  const [user, setUser] = useState({});
  const [assignment, setAssignment] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const tempUser = localStorage.getItem("user");
      const fixUser = tempUser ? JSON.parse(tempUser) : "";
      user?.uid;

      try {
        switchLoading(true);

        const [storageData, assignmentData] = await Promise.all([
          showUser(fixUser?.uid),
          showAssignment(id),
        ]);

        console.log(assignmentData);

        setUser(storageData);
        setAssignment(assignmentData);
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
    const tempAssignments = state?.classrooms?.flatMap((c) => c?.assignments);

    setUser(state?.data || {});
    setAssignment(tempAssignments || []);
  }, [state]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [codeSettings, setCodeSettings] = useState({});
  const [output, setOutput] = useState("");

  const handleChange = (e) => {
    const { files, name, value } = e.target;

    const extensionMap = {
      c: "c",
      cpp: "cpp",
      java: "java",
      py: "python",
    };

    if (name === "file") {
      const file = files[0];

      setSelectedFile(file);

      const extension = file.name.split(".").pop().toLowerCase();

      const detectedLanguage = extensionMap[extension] || "c";
      console.log(detectedLanguage);

      const reader = new FileReader();
      reader.onload = (event) => {
        setCodeSettings({
          ...codeSettings,
          code: event.target.result,
          language: detectedLanguage,
        });
      };
      reader.readAsText(file);
    } else {
      setCodeSettings({
        ...codeSettings,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    switchLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await createSubmission(assignment?.assignment_number, formData);

      setAllertSetting({
        isActive: true,
        message: "Assignment Submited",
        isSuccess: true,
      });
    } catch (error) {
      setAllertSetting({
        isActive: true,
        message: error,
      });
    } finally {
      switchLoading(false);
    }
  };

  const handleRunCode = async () => {
    const formData = {
      ...codeSettings,
      timeLimit: 5000,
    };

    console.log(formData);

    try {
      const response = await runCode(formData);

      setOutput(response.output);
    } catch (error) {
      console.log(error);

      setAllertSetting({
        isActive: true,
        message: error,
      });
    }
  };

  return (
    <main className="__public-page">
      <nav className="navbar__public-page">
        <section className="left__public-page">
          <h1 className="title__public-page">{assignment?.title}</h1>
        </section>
        <section className="right__public-page">
          <h1 className="title__public-page">
            ID: {assignment?.assignment_number}
          </h1>
        </section>
      </nav>
      <div className="content-container__public-page">
        <div className="assignment-left-content__public-page span-2__public-page">
          <textarea
            className="code-field__public-page"
            name="code"
            id="code"
            value={codeSettings?.code}
            onChange={handleChange}
            placeholder="Kode akan tampil di sini..."
          />
          <div className="action-field__public-page">
            <div className="action-input-field__public-page">
              <label className="label__public-page" htmlFor="file">
                Upload Answer File <FaFileCode />
              </label>
              <input
                className="input__public-page"
                type="file"
                name="file"
                id="file"
                onChange={handleChange}
              />
            </div>
            <select
              name="language"
              id="language"
              value={codeSettings?.language}
              onChange={handleChange}
            >
              <option value="">Select Code Language</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
            <button className="button__public-page run" onClick={handleRunCode}>
              Run Code
            </button>
            <button
              className="button__public-page submit"
              onClick={handleSubmit}
            >
              Submit File
            </button>
          </div>
        </div>
        <div className="assignment-right-content__public-page">
          <div className="output-field__public-page">
            <pre>
              <code className="code__public-page">{output}</code>
            </pre>
          </div>
          <div className="action-field__public-page">
            <input
              className="input__public-page"
              type="text"
              name="input"
              id="input"
              placeholder="Input"
              value={codeSettings?.input}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

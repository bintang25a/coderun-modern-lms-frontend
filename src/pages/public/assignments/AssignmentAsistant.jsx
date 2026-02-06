import { FaCode, FaFileCode, FaRotate, FaUpload } from "react-icons/fa6";
import { showUser } from "../../../_services/users";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { showAssignment } from "../../../_services/assignments";
import {
  createSubmission,
  showSubmission,
  updateSubmission,
} from "../../../_services/submissions";
import { runCode } from "../../../_services/actions";

import "../public.css";
import Toolbar from "../../../components/action/Toolbar";

export default function AssignmentAsistant() {
  const { switchLoading, setAllertSetting, state, userRole } =
    useOutletContext();

  const [user, setUser] = useState({});
  const [assignment, setAssignment] = useState([]);
  const [isSubmit, setIsSubmit] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [codeSettings, setCodeSettings] = useState({ timeLimit: 500 });
  const [output, setOutput] = useState("");
  const [isVertical, setIsVertical] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const tempUser = localStorage.getItem("user");
      const fixUser = tempUser ? JSON.parse(tempUser) : "";
      user?.uid;
      const isEdit = localStorage.getItem("isSubmit");

      try {
        switchLoading(true);

        const class_code = localStorage.getItem("class_code");
        const assignment_number = localStorage.getItem("assignment_number");

        const [storageData, assignmentData] = await Promise.all([
          showUser(fixUser?.uid),
          showAssignment(class_code, assignment_number),
        ]);

        setUser(storageData);
        setAssignment(assignmentData);
        setIsSubmit(isEdit);

        if (isEdit === "true") {
          const submission_number = localStorage.getItem("submission_number");

          const [submissionData] = await Promise.all([
            showSubmission(assignment_number, submission_number),
          ]);

          setCodeSettings({ ...codeSettings, code: submissionData?.code });

          console.log({ ...codeSettings, submissionData });
        }
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

  const handleChange = (e) => {
    const { files, name, value } = e.target;

    const extensionMap = {
      c: "c",
      cpp: "cpp",
      java: "java",
      py: "python",
      txt: "plaintext",
      pdf: "pdf",
    };

    if (name === "file") {
      const file = files[0];
      if (!file) return;

      const extension = file.name.split(".").pop().toLowerCase();

      if (extension === "zip" || extension === "rar") {
        alert("File kompresi (ZIP/RAR) tidak didukung untuk ditampilkan.");
        return;
      }

      setSelectedFile(file);
      const detectedLanguage = extensionMap[extension] || "c";

      const reader = new FileReader();

      if (extension === "pdf") {
        const fileUrl = URL.createObjectURL(file);
        setCodeSettings({
          ...codeSettings,
          code: fileUrl,
          language: "pdf",
        });
      } else {
        reader.onload = (event) => {
          setCodeSettings({
            ...codeSettings,
            code: event.target.result,
            language: detectedLanguage,
          });
        };
        reader.readAsText(file);
      }
    } else if (name === "timeLimit") {
      setCodeSettings({
        ...codeSettings,
        [name]: Number(value),
      });
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
    formData.append("answer", selectedFile);

    const submission_number = localStorage.getItem("submission_number");

    try {
      isSubmit === "true"
        ? await updateSubmission(
            assignment?.assignment_number,
            submission_number,
            formData
          )
        : await createSubmission(assignment?.assignment_number, formData);

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
    };

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

  const handleRunAnswer = async () => {
    const formData = {
      ...codeSettings,
      codePath: assignment?.answer_key,
    };

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
          <Link
            to={`/${userRole}/classrooms/${assignment?.class_code}`}
            className="title__public-page"
          >
            Classrooms:{" "}
            {`${assignment?.classroom?.name} [${assignment?.class_code}]`}
          </Link>
        </section>
      </nav>
      <div className="content-container__public-page">
        <div className="submissions-left-content__public-page span-2__public-page">
          {codeSettings?.language === "pdf" ? (
            <iframe
              className="code-field__public-page"
              src={codeSettings?.code}
              width="100%"
              title="PDF Viewer"
              style={{ border: "none" }}
            />
          ) : (
            <textarea
              className="code-field__public-page"
              name="code"
              id="code"
              value={codeSettings?.code}
              onChange={handleChange}
              placeholder="Kode akan tampil di sini..."
            />
          )}

          <Toolbar>
            <div
              className={`action-field__public-page ${
                isVertical ? "vertical" : ""
              }`}
            >
              <div
                title="Rotate"
                className="action-item__public-page"
                onClick={() => setIsVertical(!isVertical)}
              >
                <FaRotate className="icon__public-page" />
              </div>
              <label className="action-item__public-page" htmlFor="file">
                Choose Answer File <FaFileCode />
              </label>
              <input
                className="input__public-page"
                type="file"
                name="file"
                id="file"
                onChange={handleChange}
              />
              <select
                className="action-item__public-page"
                name="language"
                id="language"
                value={codeSettings?.language}
                onChange={handleChange}
              >
                <option value="">Lang</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
              </select>
              <select
                className="action-item__public-page"
                name="timeLimit"
                id="timeLimit"
                value={codeSettings?.timeLimit}
                onChange={handleChange}
              >
                <option value="500">0.5s</option>
                <option value="1000">1s</option>
                <option value="2000">2s</option>
                <option value="5000">5s</option>
                <option value="10000">10s</option>
              </select>
              <button
                className="action-item__public-page"
                onClick={handleRunCode}
                disabled={codeSettings?.language === "pdf"}
              >
                <FaCode />
                Run Code
              </button>
              <button
                className="action-item__public-page"
                onClick={handleRunAnswer}
                disabled={codeSettings?.language === "pdf"}
              >
                <FaCode />
                Run Example
              </button>
              <button
                className="action-item__public-page"
                onClick={handleSubmit}
              >
                <FaUpload />
                {isSubmit === "true" ? "Send Edited Answer" : "Send Answer"}
              </button>
            </div>
          </Toolbar>
        </div>
        <div className="submissions-right-content__public-page">
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

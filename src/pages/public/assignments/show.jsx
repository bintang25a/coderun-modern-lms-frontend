import { FaArrowRight, FaCode } from "react-icons/fa6";
import { showUser } from "../../../_services/users";
import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { showAssignment } from "../../../_services/assignments";
import { runCode } from "../../../_services/actions";
import { formatDate } from "../../../_utilities/formatDate";

import "../public.css";

export default function Assignment() {
  const { switchLoading, setAllertSetting, state, userRole } =
    useOutletContext();
  const { id } = useParams();

  const [user, setUser] = useState({});
  const [assignment, setAssignment] = useState([]);
  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const tempUser = localStorage.getItem("user");
      const fixUser = tempUser ? JSON.parse(tempUser) : "";
      user?.uid;

      try {
        switchLoading(true);

        const class_code = localStorage.getItem("class_code");

        const [storageData, assignmentData] = await Promise.all([
          showUser(fixUser?.uid),
          showAssignment(class_code, id),
        ]);

        console.log(assignmentData);

        const submissions = assignmentData?.submissions || [];
        const submission = submissions?.find(
          (s) => s.student_uid === storageData?.uid
        );

        localStorage.setItem(
          "assignment_number",
          assignmentData?.assignment_number
        );
        submission
          ? localStorage.setItem(
              "submission_number",
              submission?.submission_number
            )
          : null;
        localStorage.setItem("isSubmit", !!submission);

        setIsSubmit(!!submission);

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

  const [codeSettings, setCodeSettings] = useState({ timeLimit: 500 });
  const [output, setOutput] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "timeLimit") {
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

  const handleRunAnswer = async () => {
    const extension = assignment?.answer_key?.split(".").pop().toLowerCase();

    const extensionMap = {
      c: "c",
      cpp: "cpp",
      py: "python",
      java: "java",
    };

    const formData = {
      ...codeSettings,
      codePath: assignment?.answer_key,
      language: extensionMap[extension],
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

  const handleIsSubmit = () => {
    localStorage.setItem("isSubmit", isSubmit);
    localStorage.setItem("assignment_number", assignment?.assignment_number);
  };

  return (
    <main className="__public-page">
      <nav className="navbar__public-page">
        <section className="left__public-page">
          <h1 className="title__public-page">
            {assignment?.title}
            <span className="span__public-page">
              {isSubmit ? " - [Already Submited]" : ""}
            </span>
          </h1>
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
        <div className="assignment-left-content__public-page span-2__public-page">
          <h2
            className="title__public-page"
            title={`${assignment?.title} [${assignment?.assignment_number}]`}
          >{`${assignment?.title} [${assignment?.assignment_number}]`}</h2>
          <p className="description__public-page">{assignment?.description}</p>
          <div className="date__public-page">
            <p className="date-item__public-page">
              {`Start Date: ${formatDate(assignment?.startAt)}`}
            </p>
            <p className="date-item__public-page">
              {`End Date: ${formatDate(assignment?.endAt)}`}
            </p>
          </div>
          <div className="support-link__public-page">
            {assignment?.support_link ? (
              assignment?.support_link?.split(" ").map((link, index) => {
                if (!link) return null;

                return (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Link Support {index + 1}
                  </a>
                );
              })
            ) : (
              <a
                className="support-link-item__public-page"
                target="_blank"
                rel="noopener noreferrer"
              >
                No Support link, Good luck :D
              </a>
            )}
          </div>
          <div className="action__public-page">
            <button
              className="action-item__public-page"
              onClick={handleRunAnswer}
            >
              <FaCode className="icon__public-page" />
              Run Example
            </button>
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
            <Link
              to={`/${userRole}/submissions`}
              className="action-item__public-page"
              onClick={handleIsSubmit}
            >
              <FaArrowRight className="icon__public-page" />
              {isSubmit ? "Edit Submissions" : "Send Submissions"}
            </Link>
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

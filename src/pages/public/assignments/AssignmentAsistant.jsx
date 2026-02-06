import { useEffect, useState } from "react";
import { FaBrain, FaSave } from "react-icons/fa";
import { FaCode, FaRotate } from "react-icons/fa6";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { showAssignment } from "../../../_services/assignments";
import { showSubmission } from "../../../_services/submissions";
import { grade, runCode } from "../../../_services/actions";

import Toolbar from "../../../components/action/Toolbar";
import CodeOutput from "../../../components/grid-item/CodeOutput";
import CodeInput from "../../../components/grid-item/CodeInput";
import "../public.css";

export default function AssignmentAsistant() {
  const { switchLoading, setAllertSetting, state, userRole, refreshData } =
    useOutletContext();

  const { id } = useParams();

  const [assignment, setAssignment] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submission, setSubmission] = useState({});
  const [isVertical, setIsVertical] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const class_code = localStorage.getItem("class_code");

      try {
        switchLoading(true);

        const [assignmentData] = await Promise.all([
          showAssignment(class_code, id),
        ]);

        setAssignment(assignmentData);
        setSubmissions(assignmentData?.submissions);
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
    setAssignment(state?.assignment);
    setSubmissions(state?.submissions);
    setSubmission(state?.submission);
  }, [state]);

  const [codeData, setCodeData] = useState({ timeLimit: 500 });
  const [output, setOutput] = useState("");

  const handleCodeChange = (e) => {
    const { name, value } = e.target;

    if (name === "timeLimit") {
      setCodeData({
        ...codeData,
        [name]: Number(value),
      });
    } else {
      setCodeData({
        ...codeData,
        [name]: value,
      });
    }
  };

  const handleCodeSubmit = async () => {
    const formData = {
      ...codeData,
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
      ...codeData,
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

  const [gradeData, setGradeData] = useState({});

  const handleSubmissionChange = async (e) => {
    const { name, value } = e.target;

    const id = assignment?.assignment_number;

    try {
      switchLoading(true);

      if (name === "submission_number") {
        const [submissionData] = await Promise.all([showSubmission(id, value)]);

        localStorage.setItem(
          "submission_number",
          submissionData?.submission_number
        );

        setCodeData({ ...codeData, code: submissionData?.code });
        setSubmission(submissionData);

        setGradeData({
          ...gradeData,
          grade: submissionData?.grade || 0,
          assignment_number: id,
          [name]: value,
        });
      } else {
        setGradeData({
          ...gradeData,
          assignment_number: id,
          [name]: value,
        });
      }
    } catch (error) {
      console.log(error);

      setAllertSetting({
        isActive: true,
        message: error,
      });
    } finally {
      switchLoading(false);
    }
  };

  const handleSubmitGrade = async () => {
    switchLoading(true);

    try {
      await grade(gradeData);

      setAllertSetting({
        isActive: true,
        message: `${submission?.student?.name} - ${submission?.student_uid}\nScore ${gradeData?.grade} Saved`,
        isSuccess: true,
      });

      await refreshData();
    } catch (error) {
      console.log(error);

      setAllertSetting({
        isActive: true,
        message: error,
      });
    } finally {
      switchLoading(false);
    }
  };

  return (
    <main className="__public-page">
      <nav className="navbar__public-page">
        <section className="left__public-page">
          <h1 className="title__public-page">{`${assignment?.title} - [${assignment?.assignment_number}]`}</h1>
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
        <CodeInput
          value={codeData?.code}
          handleChange={handleCodeChange}
          span={2}
        >
          <div className="toolbar__public-page">
            <select
              className="toolbar-item__public-page"
              name="submission_number"
              id="submission_number"
              onChange={handleSubmissionChange}
            >
              {submissions?.map((s) => (
                <option key={s.submission_number} value={s.submission_number}>
                  {`[${s?.grade ? s?.grade : "--"}] 
                  ${s?.student?.name} - ${s?.student_uid}`}
                </option>
              ))}
            </select>
            <input
              className="toolbar-item__public-page"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              name="grade"
              id="grade"
              placeholder="Grade"
              value={gradeData?.grade}
              onChange={handleSubmissionChange}
            />
            <button
              className="toolbar-item__public-page"
              onClick={handleSubmitGrade}
            >
              <FaSave />
              Save Grade
            </button>
            <button className="toolbar-item__public-page">
              <FaBrain /> Auto Grade
            </button>
          </div>
        </CodeInput>

        <Toolbar>
          <div
            className={`toolbar__public-page ${isVertical ? "vertical" : ""}`}
          >
            <div
              title="Rotate"
              className="toolbar-item__public-page"
              onClick={() => setIsVertical(!isVertical)}
            >
              <FaRotate className="icon__public-page" />
            </div>
            <select
              className="toolbar-item__public-page"
              name="language"
              id="language"
              value={codeData?.language}
              onChange={handleCodeChange}
            >
              <option value="">Lang</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
            <select
              className="toolbar-item__public-page"
              name="timeLimit"
              id="timeLimit"
              value={codeData?.timeLimit}
              onChange={handleCodeChange}
            >
              <option value="500">0.5s</option>
              <option value="1000">1s</option>
              <option value="2000">2s</option>
              <option value="5000">5s</option>
              <option value="10000">10s</option>
            </select>
            <button
              className="toolbar-item__public-page"
              onClick={handleCodeSubmit}
              disabled={codeData?.language === "pdf"}
            >
              <FaCode />
              Run Code
            </button>
            <button
              className="toolbar-item__public-page"
              onClick={handleRunAnswer}
              disabled={codeData?.language === "pdf"}
            >
              <FaCode />
              Run Example
            </button>
          </div>
        </Toolbar>
        <CodeOutput
          value={codeData?.input}
          handleChange={handleCodeChange}
          output={output}
        />
      </div>
    </main>
  );
}

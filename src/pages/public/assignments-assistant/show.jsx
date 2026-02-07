import { useEffect, useState } from "react";
import { FaBrain, FaDownload, FaSave } from "react-icons/fa";
import { FaBookOpen, FaClipboardList, FaCode, FaRotate } from "react-icons/fa6";
import {
  AiOutlineDelete,
  AiOutlineFileAdd,
  AiOutlineFileSearch,
  AiOutlineFontSize,
} from "react-icons/ai";
import { Link, useOutletContext, useParams } from "react-router-dom";
import Toolbar from "../../../components/container/Toolbar";
import ManageDataField from "../../../components/action/ManageDataField";
import CodeOutput from "../../../components/grid-item/CodeOutput";
import CodeInput from "../../../components/grid-item/CodeInput";
import serviceSocket from "../../../_services/socket";
import { showAssignment } from "../../../_services/assignments";
import { showSubmission } from "../../../_services/submissions";
import { createTestcase, deleteTestcase } from "../../../_services/testcases";
import {
  autoGrade,
  downloadSubmissions,
  grade,
  runCode,
} from "../../../_services/actions";

import "../public.css";
import { toggleModal } from "../../../_utilities/toggleModal";

export default function AssignmentAsistant() {
  const {
    switchLoading,
    setLoadingSetting,
    setAllertSetting,
    state,
    userRole,
    refreshData,
  } = useOutletContext();

  const { id } = useParams();

  // ===== INISIASI DATA AWAL =====
  const [assignment, setAssignment] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submission, setSubmission] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const class_code = localStorage.getItem("class_code");

      try {
        switchLoading(true);

        const [assignmentData] = await Promise.all([
          showAssignment(class_code, id),
        ]);

        localStorage.setItem(
          "assignment_number",
          assignmentData?.assignment_number
        );
        localStorage.setItem(
          "submission_number",
          assignmentData?.submissions[0]?.submission_number
        );

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
  }, [state]);

  // ===== AUTO GRADE FETCH PROGRES =====
  useEffect(() => {
    let user = localStorage.getItem("user");
    user = user ? JSON.parse(user) : {};

    serviceSocket.on(`autoGrade-${user?.uid}`, (data) => {
      setLoadingSetting((prev) => ({
        ...prev,
        isActive: true,
        messages: [
          ...(Array.isArray(prev.messages) ? prev.messages : []),
          data.message,
        ],
      }));
    });

    serviceSocket.on(`autoGrade-${user?.uid}-done`, () => {
      setLoadingSetting({
        isActive: false,
        messages: [],
      });
    });

    return () => {
      serviceSocket.off(`autoGrade-${user?.uid}`);
      serviceSocket.off(`autoGrade-${user?.uid}-done`);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoading = (data) => {
    setLoadingSetting({ messages: [], isActive: data });
  };

  // ===== SETUP RUN CODE =====
  const [codeData, setCodeData] = useState({ timeLimit: 500, input: "" });
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

  // ===== SETUP GRADE SUBMISSION =====
  const [gradeData, setGradeData] = useState({ grade: 0 });

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

  // ===== SUBMISSION SUBMIT GRADE =====
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

  // ===== SUBMISSION DOWNLOAD =====
  const handleDownload = async () => {
    try {
      await downloadSubmissions(assignment?.assignment_number);
    } catch (error) {
      console.log(error);

      setAllertSetting({
        isActive: true,
        message: error,
      });
    }
  };

  // ===== SETUP TOOLBAR =====
  const [modal, setModal] = useState({});
  const [isVertical, setIsVertical] = useState([false]);

  // ===== SETUP TESTCASE =====
  const inputFields = [
    {
      name: "name",
      label: "Name testcase",
      placeholder: "Testcase name (not space)",
    },
    {
      type: "number",
      name: "weight",
      label: "Testcase weight",
      placeholder: "2",
    },
    {
      name: "input",
      label: "Input testcase",
      placeholder: "Input your testcase here: 5 3 8 c",
    },
  ];

  const viewFields = assignment?.testcases?.map((t) => ({
    name: t?.name,
    label: t?.name,
    value: `Weight(${t?.weight}) : input[${t?.input}]`,
  }));

  const deleteFields = [
    {
      type: "select",
      label: "Select testcase",
      name: "testcase_number",
      options: assignment?.testcases?.map((t) => ({
        label: `Weight(${t?.weight}) : input[${t?.input}]`,
        value: t?.testcase_number,
      })),
    },
  ];

  const handleTestcaseSubmit = async (data) => {
    await createTestcase(assignment?.assignment_number, data);
  };

  const handleTestcaseDelete = async (data) => {
    await deleteTestcase(assignment?.assignment_number, data?.testcase_number);
  };

  // ===== SETUP AUTO GRADE =====
  const autoGradeForm = {
    assignment_number: assignment?.assignment_number,
    language: codeData?.language,
    timeLimit: Math.max(Number(codeData?.timeLimit), 2000),
    test_cases: assignment?.testcases,
    testcasesLength: `${assignment?.testcases?.length} Testcases`,
    concurrency: 3,
    regrade: false,
  };

  const autoGradeFields = [
    {
      name: "assignment_number",
      label: `${assignment?.title} - [${assignment?.assignment_number}]`,
      disabledOnEdit: true,
    },
    {
      name: "language",
      label: "Code Language",
    },
    {
      name: "concurrency",
      label: "Concurrency",
      type: "number",
    },
    {
      name: "testcasesLength",
      label: "Total Testcase",
      disabledOnEdit: true,
    },
    {
      type: "select",
      name: "timeLimit",
      label: "Time Limit",
      options: [
        {
          label: "2s",
          value: 2000,
        },
        {
          label: "5s",
          value: 5000,
        },
        {
          label: "10s",
          value: 10000,
        },
        {
          label: "20s",
          value: 20000,
        },
      ],
    },
    {
      name: "regrade",
      label: "Allow Regrade",
      type: "select",
      options: [
        {
          value: true,
          label: "True",
        },
        {
          value: false,
          label: "False",
        },
      ],
    },
  ];

  const submitAutoGrade = async (temp, data) => {
    await autoGrade(data);
  };

  // ===== CODE FONT SIZE =====
  const [fs, setFs] = useState(0);
  const handleFontSize = () => {
    if (fs === 3) {
      setFs(0);
    } else {
      setFs(fs + 1);
    }
  };

  return (
    <main className="__public-page">
      <nav className="navbar__public-page">
        <section className="left__public-page">
          <Link
            to={`/${userRole}/classrooms/${assignment?.class_code}`}
            className="title__public-page"
          >
            {assignment?.classroom?.name}
          </Link>
        </section>
        <section className="right__public-page">
          <div className="action__public-page">
            <Link
              to={`/${userRole}/classrooms/materials`}
              className="button__public-page"
            >
              <FaBookOpen /> Materials
            </Link>
            <Link
              to={`/${userRole}/classrooms/assignments`}
              className="button__public-page active"
            >
              <FaClipboardList />{" "}
              {`${assignment?.title} - [${assignment?.assignment_number}]`}
            </Link>
          </div>
        </section>
      </nav>
      <div className="content-container__public-page">
        <CodeInput
          value={codeData?.code}
          handleChange={handleCodeChange}
          span={2}
          fontSize={fs}
        >
          <div className="toolbar__public-page">
            <select
              className="toolbar-item__public-page"
              name="submission_number"
              id="submission_number"
              onChange={handleSubmissionChange}
            >
              <option value="">
                {submissions?.length > 0 ? "Select Students" : "No Students"}
              </option>
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
              inputMode="numeric"
              pattern="[0-9]*"
              name="grade"
              id="grade"
              placeholder="Grade"
              value={gradeData?.grade}
              onChange={handleSubmissionChange}
              disabled={!submission}
            />
            <button
              className="toolbar-item__public-page"
              onClick={handleSubmitGrade}
              disabled={
                !gradeData?.grade || gradeData?.grade === submission?.grade
              }
            >
              <FaSave />
              Save Grade
            </button>
            <button
              className="toolbar-item__public-page"
              disabled={assignment?.testcases?.length === 0}
              onClick={() =>
                toggleModal({
                  title: "AUTO GRADE SETUP",
                  message: "Auto Grade Finish",
                  isActive: true,
                  isEdit: true,
                  isVertical: false,
                  item: autoGradeForm,
                  fields: autoGradeFields,
                  onSubmit: submitAutoGrade,
                  setModal,
                })
              }
            >
              <FaBrain /> Auto Grade
            </button>
            <button
              className="toolbar-item__public-page"
              onClick={handleDownload}
              disabled={assignment?.submissions?.length === 0}
            >
              <FaDownload /> Download All
            </button>
          </div>
        </CodeInput>

        <Toolbar id={3}>
          <div
            className={`toolbar__public-page ${
              isVertical[3] ? "vertical" : ""
            }`}
          >
            <div
              title="Rotate"
              className="toolbar-item__public-page"
              onClick={() => {
                setIsVertical((prev) => {
                  const newState = [...prev];
                  newState[3] = !prev[3];
                  return newState;
                });
              }}
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
            <button
              title="Font Size"
              className="toolbar-item__public-page button__public-page"
              onClick={handleFontSize}
            >
              <AiOutlineFontSize />
            </button>
          </div>
        </Toolbar>

        <Toolbar id={2}>
          <div
            className={`toolbar__public-page ${
              isVertical[2] ? "vertical" : ""
            }`}
          >
            <div
              title="Rotate"
              className="toolbar-item__public-page"
              onClick={() => {
                setIsVertical((prev) => {
                  const newState = [...prev];
                  newState[2] = !prev[2];
                  return newState;
                });
              }}
            >
              <FaRotate className="icon__public-page" />
            </div>
            <button
              title="Add Testcase"
              className="toolbar-item__public-page button__public-page"
              onClick={() =>
                toggleModal({
                  title: "ADD TESTCASE",
                  message: "Create testcase success",
                  isActive: true,
                  type: "Testcase",
                  fields: inputFields,
                  onSubmit: handleTestcaseSubmit,
                  setModal,
                })
              }
            >
              <AiOutlineFileAdd />
            </button>
            <button
              title="View Testcase"
              className="toolbar-item__public-page button__public-page"
              disabled={assignment?.testcases?.length === 0}
              onClick={() =>
                toggleModal({
                  title: "VIEW TESTCASE",
                  isActive: true,
                  isView: true,
                  isVertical: true,
                  type: "Testcase",
                  fields: viewFields,
                  setModal,
                })
              }
            >
              <AiOutlineFileSearch />
            </button>
            <button
              title="Delete Testcase"
              className="toolbar-item__public-page button__public-page"
              disabled={assignment?.testcases?.length === 0}
              onClick={() =>
                toggleModal({
                  title: "DELETE TESTCASE",
                  message: "Remove testcase success",
                  isActive: true,
                  type: "Testcase",
                  fields: deleteFields,
                  onSubmit: handleTestcaseDelete,
                  setModal,
                })
              }
            >
              <AiOutlineDelete />
            </button>
          </div>
        </Toolbar>

        <CodeOutput
          value={codeData?.input}
          handleChange={handleCodeChange}
          output={output}
          fontSize={fs}
        />
      </div>

      {modal.isActive && modal.mode === "field" ? (
        <Toolbar id={1} isCenter={true} onClose={modal?.onClose}>
          <ManageDataField
            title={modal?.title}
            message={modal?.message}
            isActive={modal?.isActive}
            isEdit={modal?.isEdit}
            isView={modal?.isView}
            isVertical={modal?.isVertical}
            item={modal?.item}
            type={modal?.type}
            fields={modal?.fields}
            onClose={modal?.onClose}
            onSubmit={modal?.onSubmit}
            loadingSetting={handleLoading}
            allertSetting={setAllertSetting}
            refreshData={refreshData}
          />
        </Toolbar>
      ) : null}
    </main>
  );
}

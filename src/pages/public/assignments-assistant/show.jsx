import { useEffect, useState } from "react";
import { FaBrain, FaDownload, FaSave } from "react-icons/fa";
import { FaBookOpen, FaClipboardList, FaCode, FaRotate } from "react-icons/fa6";
import {
  AiOutlineDelete,
  AiOutlineFileAdd,
  AiOutlineFileSearch,
  AiOutlineFontSize,
} from "react-icons/ai";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import serviceSocket from "../../../_services/socket";
import { showAssignment } from "../../../_services/assignments";
import { fileSubmission, showSubmission } from "../../../_services/submissions";
import { createTestcase, deleteTestcase } from "../../../_services/testcases";
import {
  autoGrade,
  downloadSubmissions,
  grade,
  runCode,
} from "../../../_services/actions";
import { toggleModal } from "../../../_utilities/toggleModal";
import Toolbar from "../../../components/container/Toolbar";
import ManageDataField from "../../../components/action/ManageDataField";
import CodeOutput from "../../../components/grid-item/CodeOutput";
import CodeDisplay from "../../../components/grid-item/CodeDisplay";
import "../public.css";
import CodeToolbar from "../../../components/action/CodeToolbar";
import TestcaseToolbar from "../../../components/action/TestcaseToolbar";

export default function AssignmentAsistant() {
  const {
    state,
    userUid,
    userRole,
    refreshData,
    switchLoading,
    setLoadingSetting,
    setAllertSetting,
  } = useOutletContext();

  const navigate = useNavigate();
  const { id } = useParams();

  // ===== INISIASI DATA AWAL =====
  const [assignment, setAssignment] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submission, setSubmission] = useState({});

  useEffect(() => {
    switchLoading(true);

    const fetchData = async () => {
      const class_code = sessionStorage.getItem("class_code");

      if (!class_code) {
        setAllertSetting({
          isActive: true,
          message: "Classroom not found, returning...",
        });

        return navigate(`/${userRole}/classrooms`);
      }

      try {
        const [assignmentData] = await Promise.all([
          showAssignment(class_code, id),
        ]);

        sessionStorage.setItem(
          "assignment_number",
          assignmentData?.assignment_number
        );
        sessionStorage.setItem(
          "submission_number",
          assignmentData?.submissions[0]?.submission_number
        );

        setAssignment(assignmentData);
        setSubmissions(assignmentData?.submissions);
        setSubmission(assignmentData?.submissions[0]);
      } catch (error) {
        console.log(error);

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
  }, [userRole]);

  useEffect(() => {
    setAssignment(state?.assignment);
    setSubmissions(state?.submissions);
    setSubmission(state?.submission);
  }, [state]);

  // ===== SELECT STUDENT =====
  const [blob, setBlob] = useState(null);
  const [output, setOutput] = useState("");
  const [formCode, setFormCode] = useState({ timeLimit: 500 });
  const [gradeData, setGradeData] = useState(submission?.grade || 0);

  const handleStudentChange = async (e) => {
    const { value } = e.target;

    const [submissionData, fileData] = await Promise.all([
      showSubmission(id, value),
      fileSubmission(id, value),
    ]);

    const ext = submission.answer.slice(submission.answer.lastIndexOf("."));

    const lang = {
      ".c": "c",
      ".cpp": "cpp",
      ".java": "java",
      ".py": "python",
      ".pdf": "pdf",
    };

    setSubmission(submissionData);
    setGradeData(submissionData?.grade || 0);

    fileData.type === "application/pdf"
      ? setBlob(URL.createObjectURL(fileData))
      : setFormCode({
          ...formCode,
          code: await fileData.text(),
          language: lang[ext],
        });
  };

  // ===== SETUP RUN CODE =====
  const handleCodeChange = (e) => {
    const { name, value } = e.target;

    setFormCode({
      ...formCode,
      [name]: value,
    });
  };

  const handleRunCode = async () => {
    try {
      const response = await runCode(formCode);

      setOutput(response.output);
    } catch (error) {
      console.log(error);

      setAllertSetting({
        isActive: true,
        message: error,
      });
    }
  };

  const handleRunExample = async () => {
    const formData = {
      ...formCode,
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

  const [fs, setFs] = useState(0);
  const handleFontSize = () => {
    if (fs === 3) {
      setFs(0);
    } else {
      setFs(fs + 1);
    }
  };

  // ===== SETUP TESTCASE =====
  const [modal, setModal] = useState({});

  const handleTestcaseSubmit = async (data) => {
    await createTestcase(id, data);
  };

  const handleTestcaseDelete = async (data) => {
    await deleteTestcase(id, data?.testcase_number);
  };

  // ===== SETUP GRADE SUBMISSION =====
  const handleGradeChange = (e) => {
    const { value } = e.target;

    setGradeData(value);
  };

  const handleGradeSubmit = async () => {
    switchLoading(true);

    const formData = {
      submission_number: submission?.submission_number,
      assignment_number: id,
      grade: gradeData,
    };

    try {
      await grade(formData);

      setAllertSetting({
        isActive: true,
        message: "Grade saved",
        isSuccess: true,
      });

      refreshData();
    } catch (error) {
      console.log(error);

      setAllertSetting({
        isActive: true,
        message: error,
      });
    } finally {
      setTimeout(() => switchLoading(false), 100);
    }
  };

  // ===== AUTO GRADE FETCH PROGRES =====
  useEffect(() => {
    serviceSocket.on(`autoGrade-${userUid}`, (data) => {
      setLoadingSetting((prev) => ({
        ...prev,
        isActive: true,
        messages: [
          ...(Array.isArray(prev.messages) ? prev.messages : []),
          data.message,
        ],
      }));
    });

    serviceSocket.on(`autoGrade-${userUid}-done`, () => {
      setLoadingSetting({
        isActive: false,
        messages: [],
      });
    });

    return () => {
      serviceSocket.off(`autoGrade-${userUid}`);
      serviceSocket.off(`autoGrade-${userUid}-done`);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoading = (data) => {
    setLoadingSetting({ messages: [], isActive: data });
  };

  // ===== SETUP DOWNLOAD =====
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

  // ===== SETUP AUTO GRADE =====
  const autoGradeForm = {
    assignment_number: assignment?.assignment_number,
    language: formCode?.language,
    timeLimit: Math.max(Number(formCode?.timeLimit), 2000),
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
        {!blob ? (
          <CodeDisplay
            value={formCode?.code}
            handleChange={handleCodeChange}
            fontSize={fs}
          >
            <div className="toolbar__public-page">
              <select
                className="toolbar-item__public-page"
                name="submission_number"
                id="submission_number"
                onChange={handleStudentChange}
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
                value={gradeData}
                onChange={handleGradeChange}
                disabled={!submission}
              />
              <button
                className="toolbar-item__public-page"
                onClick={handleGradeSubmit}
                disabled={!gradeData || gradeData === submission?.grade}
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
          </CodeDisplay>
        ) : (
          <FileDisplay output={blob} />
        )}

        <Toolbar id={3}>
          <CodeToolbar
            formData={formCode}
            setFormData={setFormCode}
            runCode={handleRunCode}
            runExample={handleRunExample}
            fontSize={handleFontSize}
          />
        </Toolbar>

        <Toolbar id={2}>
          <TestcaseToolbar
            testcases={assignment?.testcases}
            toggleModal={toggleModal}
            setModal={setModal}
            onSubmit={handleTestcaseSubmit}
            onDelete={handleTestcaseDelete}
          />
        </Toolbar>

        <CodeOutput
          value={formCode?.input}
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

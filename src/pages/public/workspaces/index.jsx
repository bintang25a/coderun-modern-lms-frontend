import {
  FaBookOpen,
  FaClipboardList,
  FaClipboardUser,
  FaRightLeft,
} from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  createMaterial,
  fileMaterial,
  getMaterials,
  showMaterial,
  updateMaterial,
} from "../../../_services/materials";
import { getClassrooms } from "../../../_services/classrooms";
import ManageDataField from "../../../components/action/ManageDataField";
import ManageDataTransfer from "../../../components/action/ManageDataTransfer";
import "../public.css";
import {
  createClassMaterial,
  deleteClassMaterial,
} from "../../../_services/materialClassroom";
import ItemList from "../../../components/grid-item/ItemList";
import FileDisplay from "../../../components/grid-item/FileDisplay";
import { toggleModal } from "../../../_utilities/toggleModal";
import Overlay from "../../../components/container/Overlay";
import {
  createAssignment,
  getAssignments,
  showAssignment,
  updateAssignment,
} from "../../../_services/assignments";
import CodeDisplay from "../../../components/grid-item/CodeDisplay";
import CodeOutput from "../../../components/grid-item/CodeOutput";
import AssignmentInput from "../../../components/grid-item/AssignmentInput";
import Toolbar from "../../../components/container/Toolbar";
import { fileSubmission, showSubmission } from "../../../_services/submissions";
import { createTestcase, deleteTestcase } from "../../../_services/testcases";
import {
  autoGrade,
  downloadSubmissions,
  grade,
  runCode,
} from "../../../_services/actions";
import { FaBrain, FaDownload, FaSave } from "react-icons/fa";
import CodeToolbar from "../../../components/action/CodeToolbar";
import TestcaseToolbar from "../../../components/action/TestcaseToolbar";

export default function Workspaces() {
  const {
    state,
    user,
    userRole,
    refreshData,
    switchLoading,
    setAllertSetting,
  } = useOutletContext();

  const [classrooms, setClassrooms] = useState({});
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignment, setAssignment] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [submission, setSubmission] = useState({});
  const [classMaterials, setClassMaterials] = useState([]);
  const [list, setList] = useState({});
  const [classCode, setClassCode] = useState("");
  const [assignmentNumber, setAssignmentNumber] = useState("");

  useEffect(() => {
    switchLoading(true);

    const fetchData = async () => {
      try {
        // ===== FETCH CLASSROOMS =====
        const classrooms =
          userRole === "assistant" ? user?.assists : user?.classrooms;

        const classroomsParams = new URLSearchParams();
        classrooms?.forEach((i) => {
          classroomsParams.append("class_code", i?.class_code);
        });

        const classroomsQuery = classroomsParams.toString();
        const [classroomsData] = await Promise.all([
          classroomsQuery ? getClassrooms(classroomsQuery) : null,
        ]);

        setClassrooms(classroomsData);

        // ===== FETCH ASSIGNMENTS =====
        const tempAssignments = classroomsData?.flatMap(
          (classroom) => classroom.assignments || []
        );

        const assignmentsParams = new URLSearchParams();

        tempAssignments?.forEach((i) => {
          assignmentsParams.append("assignment_number", i?.assignment_number);
        });

        const assignmentsQuery = assignmentsParams.toString();

        const [assignmentsData] = await Promise.all([
          assignmentsQuery
            ? getAssignments("class_code", assignmentsQuery)
            : null,
        ]);

        // ===== TAKE SUBMISSIONS & MATERIALS =====
        const classMaterialsData = classroomsData?.flatMap((classroom) =>
          (classroom?.materials || []).map((material) => ({
            ...material,
            class_code: classroom?.class_code,
          }))
        );
        const submissionsData = assignmentsData?.flatMap(
          (assignment) => assignment?.submissions || []
        );

        setAssignments(assignmentsData);
        setClassMaterials(classMaterialsData);
        setSubmissions(submissionsData?.filter((s) => !s?.grade));

        setList({
          title: "Material List",
          id: "material_number",
          show: "title",
          data: classMaterialsData,
          edit: handleMaterialEdit,
        });

        // ===== FETCH MATERIALS FOR TRANSFER SETUP =====
        const [materialsData] = await Promise.all([getMaterials()]);

        setMaterials(materialsData);
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
  }, [user]);

  useEffect(() => {
    setMaterials(state?.materials);
    setAssignments(state?.classroom);
  }, [state]);

  const handleClassroomChange = (e) => {
    const { value } = e.target;

    sessionStorage.setItem("class_code", value);
    setClassCode(value);

    if (list?.id === "material_number") {
      return setList({
        ...list,
        data: !classCode
          ? classMaterials
          : classMaterials?.filter((cm) => cm?.class_code === value),
      });
    }

    if (list?.id === "assignment_number") {
      return setList({
        ...list,
        data: !value
          ? assignments
          : assignments?.filter((a) => a?.class_code === value),
      });
    }

    if (list?.id === "submission_number") {
      return setList({
        ...list,
        data: !value
          ? submissions
          : submissions?.filter((s) => s?.assignment_number?.includes(value)),
      });
    }
  };

  const handleAssignmentChange = async (e) => {
    const { value } = e.target;

    sessionStorage.setItem("assignment_number", value);
    setAssignmentNumber(value);

    const class_code = value.split("-")[0];

    const assignmentData = await showAssignment(class_code, value);

    sessionStorage.setItem("class_code", assignmentData?.class_code);
    setClassCode(assignmentData?.class_code);

    setAssignment(assignmentData);

    if (list?.id === "submission_number") {
      return setList({
        ...list,
        data: !value
          ? submissions
          : submissions?.filter((s) => s?.assignment_number === value),
      });
    }
  };

  // ===== HANDLE LIST CLICK =====
  const [blob, setBlob] = useState(null);

  const handleAction = async (id) => {
    try {
      if (list?.id === "material_number") {
        const file = await fileMaterial(id);

        setBlob(file);
      } else if (list?.id === "submission_number") {
        const temp = submissions?.find((s) => s?.submission_number === id);

        const [submissionData, fileData] = await Promise.all([
          showSubmission(temp?.assignment_number, id),
          fileSubmission(temp?.assignment_number, id),
        ]);

        const ext = submissionData?.answer?.slice(
          submissionData?.answer?.lastIndexOf(".")
        );

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
      }
    } catch (error) {
      console.log(error);

      setAllertSetting({
        isActive: true,
        message: error,
      });
    }
  };

  // ===== HANDLE MATERIAL =====
  const [modal, setModal] = useState({});

  const materialFields = [
    {
      name: "title",
      label: "Title",
      placeholder: "Queue and Stack",
    },
    {
      name: "material",
      label: "Upload Material",
      type: "file",
    },
  ];

  const handleMaterialAdd = async (data) => {
    try {
      const res = await createMaterial(data);

      await createClassMaterial(classCode, res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleMaterialEdit = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const submit = async (id, data) => {
      await updateMaterial(id, data);
    };

    const [materialData] = await Promise.all([showMaterial(id)]);

    toggleModal({
      title: `EDIT MATERIAL: ${id}`,
      message: "Update material success",
      isActive: true,
      isEdit: true,
      itemId: "material_number",
      item: materialData,
      fields: materialFields,
      onSubmit: submit,
      setModal,
    });
  };

  // ===== HANDLE ASSIGNMENT =====
  const handleAssignmentEdit = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const assignmentFields = [
      {
        name: "title",
        label: "Title",
        placeholder: "Tugas Pertemuan 2",
      },
      {
        name: "answer",
        label: "Answer Key",
        placeholder: "Kerjakan dengan testcase sebagai berikut",
        type: "file",
      },
      {
        name: "startAt",
        label: "Start At",
        type: "date",
      },
      {
        name: "endAt",
        label: "End At",
        type: "date",
      },
      {
        name: "overtime",
        label: "Allow Overtime",
        type: "select",
        options: [
          {
            label: "True",
            value: true,
          },
          {
            label: "False",
            value: false,
          },
        ],
      },
      {
        name: "support_link",
        label: "Support Link",
      },
      {
        name: "description",
        label: "Description",
        placeholder: "Kerjakan dengan testcase sebagai berikut",
      },
    ];

    const assignmentData = assignments?.find(
      (a) => a?.assignment_number === id
    );

    const submit = async (id, data) => {
      await updateAssignment(assignmentData?.class_code, id, data);
    };

    toggleModal({
      title: `EDIT ASSIGNMENT: ${id}`,
      message: "Update assignment success",
      isActive: true,
      isEdit: true,
      itemId: "assignment_number",
      item: assignmentData,
      fields: assignmentFields,
      onSubmit: submit,
      setModal,
    });
  };

  // ===== HANDLE SUBMISSION =====
  const [output, setOutput] = useState("");
  const [formCode, setFormCode] = useState({ timeLimit: 500, input: "" });
  const [gradeData, setGradeData] = useState(submission?.grade || 0);

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
  const handleTestcaseSubmit = async (data) => {
    await createTestcase(assignment?.assignment_number, data);
  };

  const handleTestcaseDelete = async (data) => {
    await deleteTestcase(assignment?.assignment_number, data?.testcase_number);
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
      assignment_number: submission?.assignment_number,
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
          <div className="title__public-page">Workspaces</div>
        </section>
        <section className="right__public-page">
          <div className="action__public-page">
            {list?.id === "submission_number" ? (
              <select
                className="button__public-page"
                onChange={handleAssignmentChange}
              >
                <option value="">All Assignments</option>
                {assignments?.length > 0 ? (
                  assignments?.map((a) => (
                    <option
                      key={a?.assignment_number}
                      value={a?.assignment_number}
                    >
                      {a?.title}
                    </option>
                  ))
                ) : (
                  <option value="">No Assignments</option>
                )}
              </select>
            ) : (
              <select
                className="button__public-page"
                onChange={handleClassroomChange}
              >
                <option value="">All Classrooms</option>
                {classrooms?.length > 0 ? (
                  classrooms?.map((c) => (
                    <option key={c?.class_code} value={c?.class_code}>
                      {c?.name}
                    </option>
                  ))
                ) : (
                  <option value="">No Classrooms</option>
                )}
              </select>
            )}
            <button
              className={`button__public-page ${
                list?.id === "material_number" ? "active" : ""
              }`}
              onClick={() =>
                setList({
                  title: "Material List",
                  id: "material_number",
                  show: "title",
                  data: !classCode
                    ? classMaterials
                    : classMaterials?.filter(
                        (cm) => cm?.class_code === classCode
                      ),
                  edit: handleMaterialEdit,
                })
              }
            >
              <FaBookOpen /> Materials
            </button>
            <button
              className={`button__public-page ${
                list?.id === "assignment_number" ? "active" : ""
              }`}
              onClick={() =>
                setList({
                  title: "Assignment List",
                  id: "assignment_number",
                  show: "title",
                  data: !classCode
                    ? assignments
                    : assignments?.filter((a) => a?.class_code === classCode),
                  edit: handleAssignmentEdit,
                })
              }
            >
              <FaClipboardList /> Assignments
            </button>
            <button
              to={`/${userRole}/classrooms/assignments`}
              className={`button__public-page ${
                list?.id === "submission_number" ? "active" : ""
              }`}
              onClick={() =>
                setList({
                  title: "Submission List",
                  id: "submission_number",
                  show: "student_uid",
                  data: !classCode
                    ? submissions
                    : submissions?.filter((s) =>
                        s?.assignment_number?.includes(classCode)
                      ),
                })
              }
            >
              <FaClipboardUser /> Submissions
            </button>
          </div>
        </section>
      </nav>

      <div className="content-container__public-page">
        {list?.id === "material_number" ? (
          <FileDisplay output={blob}>
            <div className="toolbar__public-page">
              <button
                title="Add Material"
                className="toolbar-item__public-page"
                name="submission_number"
                id="submission_number"
                disabled={!classCode}
                onClick={() =>
                  toggleModal({
                    isActive: true,
                    title: "ADD MATERIAL",
                    message: "Add material success",
                    fields: materialFields,
                    onSubmit: handleMaterialAdd,
                    setModal,
                  })
                }
              >
                Add <FaBookOpen />
              </button>
              <button
                title="Take Material"
                className="toolbar-item__public-page"
                name="submission_number"
                id="submission_number"
                disabled={!classCode}
                onClick={() =>
                  toggleModal({
                    mode: "transfer",
                    isActive: true,
                    title: "TAKE AVAILABLE MATERIAL",
                    onAdd: createClassMaterial,
                    onRemove: deleteClassMaterial,
                    setModal,
                  })
                }
              >
                Take <FaRightLeft />
              </button>
            </div>
          </FileDisplay>
        ) : null}

        {list?.id === "assignment_number" ? (
          <AssignmentInput
            class_code={classCode}
            refreshData={refreshData}
            switchLoading={switchLoading}
            setAllertSetting={setAllertSetting}
            createAssignment={createAssignment}
          />
        ) : null}

        {list?.id === "submission_number" ? (
          <>
            <CodeDisplay
              value={formCode?.code}
              handleChange={handleCodeChange}
              fontSize={fs}
              span={{ row: 3, col: 2 }}
            >
              <div className="toolbar__public-page">
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
                  disabled={
                    assignment?.testcases?.length === 0 ||
                    !classCode ||
                    !assignment
                  }
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
                  disabled={
                    assignment?.submissions?.length === 0 ||
                    !classCode ||
                    !assignment
                  }
                >
                  <FaDownload /> Download All
                </button>
              </div>
            </CodeDisplay>

            <Toolbar isResize={true}>
              <CodeOutput
                value={formCode?.input}
                handleChange={handleCodeChange}
                output={output}
                fontSize={fs}
              />
            </Toolbar>

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
          </>
        ) : null}

        <ItemList
          title={list?.title}
          items={list?.data}
          settings={{ id: list?.id, show: list?.show }}
          link={`${userRole}/classrooms/materials/`}
          disabled={true}
          onAction={handleAction}
          onEdit={list?.edit}
        />

        {modal?.isActive && modal?.mode === "field" ? (
          <Overlay isActive={modal?.isActive} onClose={modal?.onClose}>
            <ManageDataField
              title={modal?.title}
              message={modal?.message}
              isEdit={modal?.isEdit}
              fields={modal?.fields}
              item_id={modal?.itemId}
              item={modal?.item}
              onSubmit={modal?.onSubmit}
              onClose={modal?.onClose}
              loadingSetting={switchLoading}
              allertSetting={setAllertSetting}
              refreshData={refreshData}
            />
          </Overlay>
        ) : null}

        {modal?.isActive && modal?.mode === "transfer" ? (
          <Overlay isActive={modal?.isActive} onClose={modal?.onClose}>
            <ManageDataTransfer
              title={modal?.title}
              parent_id={classCode}
              item_id={"material_number"}
              item_show={"title"}
              inBoxItems={classMaterials?.filter(
                (cm) => cm?.class_code === classCode
              )}
              outBoxItems={materials?.filter(
                (m) =>
                  !classMaterials?.some(
                    (cm) => cm.material_number === m.material_number
                  )
              )}
              onAdd={modal?.onAdd}
              onRemove={modal?.onRemove}
              onClose={modal?.onClose}
              loadingSetting={switchLoading}
              allertSetting={setAllertSetting}
              refreshData={refreshData}
            />
          </Overlay>
        ) : null}
      </div>
    </main>
  );
}

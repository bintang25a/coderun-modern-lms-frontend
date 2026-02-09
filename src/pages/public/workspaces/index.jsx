import {
  FaBookOpen,
  FaClipboardList,
  FaClipboardUser,
  FaRightLeft,
} from "react-icons/fa6";
import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
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
import { getAssignments } from "../../../_services/assignments";
import CodeDisplay from "../../../components/grid-item/CodeDisplay";
import CodeOutput from "../../../components/grid-item/CodeOutput";
import AssignmentInput from "../../../components/grid-item/AssignmentInput";

export default function Workspaces() {
  const {
    state,
    user,
    userRole,
    refreshData,
    switchLoading,
    setAllertSetting,
  } = useOutletContext();
  const navigate = useNavigate();

  const [classrooms, setClassrooms] = useState({});
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [classMaterials, setClassMaterials] = useState([]);
  const [blob, setBlob] = useState(null);
  const [list, setList] = useState({});

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
        const classMaterialsData = classroomsData?.flatMap(
          (classroom) => classroom?.materials || []
        );
        const submissionsData = assignmentsData?.flatMap(
          (assignment) => assignment?.submissions || []
        );

        setAssignments(assignmentsData);
        setClassMaterials(classMaterialsData);
        setSubmissions(submissionsData);

        setList({
          title: "Material List",
          id: "material_number",
          show: "title",
          data: classMaterialsData,
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

  const [classCode, setClassCode] = useState(false);
  const handleClassroomChange = (e) => {
    const { value } = e.target;

    sessionStorage.setItem("class_code", value);
    setClassCode(value);
  };

  const handleAction = async (id) => {
    const file = await fileMaterial(id);

    setBlob(file);
  };

  const [modal, setModal] = useState({});

  const fields = [
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

  const handleAdd = async (data) => {
    try {
      const res = await createMaterial(data);

      await createClassMaterial(classroom?.class_code, res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (e, id) => {
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
      fields: fields,
      onSubmit: submit,
      setModal,
    });
  };

  return (
    <main className="__public-page">
      <nav className="navbar__public-page">
        <section className="left__public-page">
          <div className="title__public-page">Workspaces</div>
        </section>
        <section className="right__public-page">
          <div className="action__public-page">
            <select
              className="button__public-page"
              onChange={handleClassroomChange}
            >
              <option value="">Select Classrooms</option>
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
            <button
              className={`button__public-page ${
                list?.id === "material_number" ? "active" : ""
              }`}
              onClick={() =>
                setList({
                  title: "Material List",
                  id: "material_number",
                  show: "title",
                  data: classMaterials,
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
                  data: assignments,
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
                  data: submissions,
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
                    fields: fields,
                    onSubmit: handleAdd,
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

        {list?.id === "assignment_number" ? <AssignmentInput /> : null}

        {list?.id === "submission_number" ? (
          <>
            <CodeDisplay span={{ row: 3, col: 1 }} />
            <CodeOutput />
          </>
        ) : null}

        <ItemList
          title={list?.title}
          items={list?.data}
          settings={{ id: list?.id, show: list?.show }}
          link={`${userRole}/classrooms/materials/`}
          disabled={true}
          onAction={handleAction}
          onEdit={handleEdit}
        />

        {modal?.isActive && modal?.mode === "field" ? (
          <Overlay isActive={modal?.isActive} onClose={modal?.onClose}>
            <ManageDataField
              title={modal?.title}
              message={modal?.message}
              isEdit={modal?.isEdit}
              fields={modal?.fields}
              item_id={"material_number"}
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
              inBoxItems={classMaterials}
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

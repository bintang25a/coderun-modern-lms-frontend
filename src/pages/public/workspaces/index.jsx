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

  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [blob, setBlob] = useState(null);

  const [classroom, setClassroom] = useState({});
  const [classMaterials, setClassMaterials] = useState([]);

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

        // ===== FETCH MATERIALS & ASSIGNMENTS =====
        const tempMaterials = classroomsData?.flatMap(
          (classroom) => classroom.materials || []
        );
        const tempAssignments = classroomsData?.flatMap(
          (classroom) => classroom.assignments || []
        );

        const materialsParams = new URLSearchParams();
        const assignmentsParams = new URLSearchParams();

        tempMaterials?.forEach((i) => {
          materialsParams.append("material_number", i?.material_number);
        });
        tempAssignments?.forEach((i) => {
          assignmentsParams.append("assignment_number", i?.assignment_number);
        });

        const materialsQuery = materialsParams.toString();
        const assignmentsQuery = assignmentsParams.toString();

        const [materialsData, assignmentsData] = await Promise.all([
          materialsQuery ? getMaterials(materialsQuery) : null,
          assignmentsQuery
            ? getAssignments(class_code, assignmentsQuery)
            : null,
        ]);

        // ===== TAKE SUBMISSIONS =====
        const submissionsData = assignmentsData?.flatMap(
          (assignment) => assignment?.submissions || []
        );

        setMaterials(materialsData);
        setAssignments(assignmentsData);
        setSubmissions(submissionsData);
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
          <Link
            to={`/${userRole}/classrooms/${classroom?.class_code}`}
            className="title__public-page"
          >
            Workspaces
          </Link>
        </section>
        <section className="right__public-page">
          {userRole === "assistant" ? (
            <div className="action__public-page">
              <button
                to={`/${userRole}/classrooms/materials`}
                className="button__public-page active"
              >
                <FaBookOpen /> Materials
              </button>
              <button
                to={`/${userRole}/classrooms/assignments`}
                className="button__public-page"
              >
                <FaClipboardList /> Assignments
              </button>
              <button
                to={`/${userRole}/classrooms/assignments`}
                className="button__public-page"
              >
                <FaClipboardUser /> Submissions
              </button>
            </div>
          ) : (
            <h1 className="title__public-page">
              Tutor/Asisten:{" "}
              <span>
                {classroom?.assistants?.map((a) => a?.name).join("/")}
              </span>
            </h1>
          )}
        </section>
      </nav>

      <div className="content-container__public-page">
        <FileDisplay output={blob}>
          <div className="toolbar__public-page">
            <button
              title="Add Material"
              className="toolbar-item__public-page"
              name="submission_number"
              id="submission_number"
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
        <ItemList
          title={"Material List"}
          items={submissions}
          settings={{ id: "submission_number", show: "student_uid" }}
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
              parent_id={classroom?.class_code}
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

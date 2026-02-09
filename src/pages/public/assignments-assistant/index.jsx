import {
  FaBookOpen,
  FaClipboardList,
  FaFileCode,
  FaPaperPlane,
} from "react-icons/fa6";
import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  createAssignment,
  deleteAssignment,
  showAssignment,
  updateAssignment,
} from "../../../_services/assignments";
import { showClassroom } from "../../../_services/classrooms";
import ItemList from "../../../components/grid-item/ItemList";
import "../public.css";
import { toggleModal } from "../../../_utilities/toggleModal";
import ManageDataField from "../../../components/action/ManageDataField";
import Overlay from "../../../components/container/Overlay";

export default function AssignmentsAssistant() {
  const {
    state,
    userRole,
    refreshData,
    switchLoading,
    setAllertSetting,
    setConfirmSetting,
  } = useOutletContext();

  const initialForm = {
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    support_link: "",
    overtime: false,
  };

  const [classroom, setClassroom] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [fileSelected, setFileSelected] = useState("");

  const navigate = useNavigate();

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
        switchLoading(true);

        const [classroomsData] = await Promise.all([showClassroom(class_code)]);

        const assignmentsData = classroomsData?.assignments;

        setClassroom(classroomsData);
        setAssignments(assignmentsData);
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
  }, [userRole]);

  useEffect(() => {
    setClassroom(state?.classroom);
    setAssignments(state?.assignments);
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

    console.log(formData);

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

      setFormData(initialForm);
      setFileSelected("");

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

  const [modal, setModal] = useState({});

  const handleEdit = async (e, id) => {
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

    const submit = async (id, data) => {
      await updateAssignment(classroom?.class_code, id, data);
    };

    const [assignmentData] = await Promise.all([
      showAssignment(classroom?.class_code, id),
    ]);

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

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmUser = () => {
      return new Promise((resolve) => {
        setConfirmSetting({
          isActive: true,
          title: `DELETE ASSIGNMENT: ${id}`,
          message: `ARE YOU SURE?`,

          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    };

    try {
      const isConfirmed = await confirmUser();

      if (!isConfirmed) return;

      switchLoading(true);

      await deleteAssignment(classroom?.class_code, id);
      await refreshData();

      setAllertSetting({
        isActive: true,
        message: "Delete data success",
        isSuccess: true,
      });
    } catch (error) {
      setAllertSetting({
        isActive: true,
        message: error,
        isSuccess: false,
      });
    } finally {
      switchLoading(false);

      setConfirmSetting((prev) => ({ ...prev, isActive: false }));
    }
  };

  return (
    <main className="__public-page">
      <nav className="navbar__public-page">
        <section className="left__public-page">
          <Link
            to={`/${userRole}/classrooms/${classroom?.class_code}`}
            className="title__public-page"
          >
            {classroom?.name}
          </Link>
        </section>
        <section className="right__public-page">
          {userRole === "assistant" ? (
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
                <FaClipboardList /> Assignments
              </Link>
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
        <div
          className="assignments-left-content__public-page"
          style={{ gridRow: `span 3`, gridColumn: `span 2` }}
        >
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
                Start Date:
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
                End Date:
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
          <div className="toolbar__public-page">
            <label
              className="toolbar-item__public-page label__public-page"
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
              className="toolbar-item__public-page button__public-page"
              onClick={() =>
                setFormData({
                  ...formData,
                  overtime: !formData?.overtime,
                })
              }
            >
              Overtime: {formData?.overtime ? "Allowed" : "Disallowed"}
            </button>
            <button
              className="toolbar-item__public-page button__public-page"
              onClick={handleSubmit}
            >
              <FaPaperPlane /> Submit Assignment
            </button>{" "}
          </div>
        </div>

        <ItemList
          title={"Assignment List"}
          items={assignments}
          settings={{ id: "assignment_number", show: "title" }}
          link={`${userRole}/classrooms/assignments`}
          disabled={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {modal.isActive ? (
        <Overlay isActive={modal?.isActive} onClose={modal?.onClose}>
          <ManageDataField
            title={modal?.title}
            message={modal?.message}
            isEdit={modal?.isEdit}
            item_id={modal?.itemId}
            item={modal?.item}
            type={modal?.type}
            fields={modal?.fields}
            onClose={modal?.onClose}
            onSubmit={modal?.onSubmit}
            loadingSetting={switchLoading}
            allertSetting={setAllertSetting}
            refreshData={refreshData}
          />
        </Overlay>
      ) : null}
    </main>
  );
}

import { useEffect, useState } from "react";
import {
  createClassroom,
  deleteClassroom,
  getClassrooms,
  updateClassroom,
} from "../../../_services/classrooms";
import "../admin.css";
import {
  FaEraser,
  FaMagnifyingGlass,
  FaPenToSquare,
  FaSquarePlus,
  FaUsersBetweenLines,
  FaBookOpen,
  FaUserGroup,
  FaRegEye,
  FaClipboardList,
} from "react-icons/fa6";
import { useOutletContext } from "react-router-dom";
import { getUsers } from "../../../_services/users";
import { getMaterials } from "../../../_services/materials";
import {
  createAssistant,
  deleteAssistant,
} from "../../../_services/assistantClassroom";
import {
  createStudent,
  deleteStudent,
} from "../../../_services/studentClassroom";
import {
  createClassMaterial,
  deleteClassMaterial,
} from "../../../_services/materialClassroom";

import ManageDataTransfer from "../../../components/action/ManageDataTransfer";
import ManageDataField from "../../../components/action/ManageDataField";
import { createAssignment } from "../../../_services/assignments";

export default function Classrooms() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  const {
    switchLoading,
    setAllertSetting,
    setConfirmSetting,
    refreshData,
    state,
  } = useOutletContext();

  const [data, setData] = useState(state.data || []);
  const [users, setUsers] = useState(state.users || []);
  const [materials, setMaterials] = useState(state.materials || []);
  const selectedClass = data.find((c) => c.class_code === selectedIds[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        switchLoading(true);

        const [storageData, usersData, materialsData] = await Promise.all([
          getClassrooms(),
          getUsers(),
          getMaterials(),
        ]);

        setData(storageData);
        setUsers(usersData);
        setMaterials(materialsData);
      } catch (error) {
        console.log("Fetch error:", error);

        setAllertSetting({
          isActive: true,
          message: error,
          isSuccess: false,
        });
      } finally {
        setTimeout(() => switchLoading(false), 100);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setData(state?.data || []);
    setUsers(state?.users || []);
    setMaterials(state?.materials || []);
  }, [state]);

  const filteredData = data.filter((item) => {
    const columnsToSearch = ["class_code", "name"];

    return columnsToSearch.some((key) => {
      const value = item[key];

      if (value === null || value === undefined) return false;

      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const closeModal = () => {
    setModal({ ...modal, isActive: false });
  };

  const toggleModal = (param) => {
    const {
      mode = "field",
      isActive = false,
      isEdit = false,
      isDelete = false,
      isView = false,
      type,
      fields,
      itemId,
      itemShow,
      onAdd,
      onRemove,
      onClose = closeModal,
      onSubmit,
    } = param;

    setModal({
      mode,
      isActive,
      isEdit,
      isDelete,
      isView,
      type,
      fields,
      itemId,
      itemShow,
      onAdd,
      onRemove,
      onClose,
      onSubmit,
    });
  };

  const handleSelect = (uid) => {
    setSelectedIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSelectAll = () => {
    const isAllSelected =
      currentData.length > 0 && selectedIds.length === currentData.length;

    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      const allIds = currentData.map((item) => item.class_code);
      setSelectedIds(allIds);
    }
  };

  const handleDeleteData = async () => {
    if (selectedIds.length === 0) return;

    const confirmUser = () => {
      return new Promise((resolve) => {
        setConfirmSetting({
          isActive: true,
          title: "Hapus Data",
          message: `Yakin ingin menghapus ${selectedIds.length} data?`,

          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    };

    try {
      const isConfirmed = await confirmUser();

      if (!isConfirmed) return;

      switchLoading(true);

      const deletePromises = selectedIds.map((id) => deleteClassroom(id));
      await Promise.all(deletePromises);

      await refreshData();
      setSelectedIds([]);

      setAllertSetting({
        isActive: true,
        message: "Delete data successfully",
        isSuccess: true,
      });
    } catch (error) {
      setAllertSetting({
        isActive: true,
        message: error.message || "Failed to delete data",
        isSuccess: false,
      });
    } finally {
      switchLoading(false);

      setConfirmSetting((prev) => ({ ...prev, isActive: false }));
    }
  };

  const handleAddAssignment = async (formData) => {
    await createAssignment(selectedIds[0], formData);
  };

  const fields = (id, isView = false) => {
    const item = currentData.find((item) => item.class_code === id);

    const actionFields = [
      {
        name: "class_code",
        label: "Class Code",
        placeholder: "DDP-A1-2025",
        disabledOnEdit: true,
        value: item?.class_code,
      },
      {
        name: "name",
        label: "Class Name",
        placeholder: "Praktikum DDP",
        value: item?.name,
      },
    ];

    if (!item) return actionFields;

    const viewFields = [
      ...actionFields,
      {
        name: "assistants",
        label: "Assistants",
        value: item?.assistants?.map((as) => as.name).join(", ") || "-",
      },
      {
        name: "students",
        label: "Total Students",
        value: item?.students?.length || 0,
      },
      {
        name: "materials",
        label: "Total Materials",
        value: item?.materials?.length || 0,
      },
      {
        name: "assignments",
        label: "Total Assignments",
        value: item?.assignments?.length || 0,
      },
    ];

    return isView ? viewFields : actionFields;
  };

  const assignmentFields = [
    {
      name: "title",
      label: "Title",
      placeholder: "Tugas Pertemuan 2",
    },
    {
      name: "description",
      label: "Description",
      placeholder: "Kerjakan dengan testcase sebagai berikut",
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
      name: "answer",
      label: "Answer Key (needed for automatic grading)",
      placeholder: "Kerjakan dengan testcase sebagai berikut",
      type: "file",
    },
  ];

  return (
    <main className="__admin-page">
      <nav className="navbar__admin-page">
        <section className="left__admin-page">
          <h1 className="title__admin-page">Classrooms</h1>
        </section>
        <section className="right__admin-page">
          <div className="action__admin-page">
            <button
              className="button__admin-page"
              title="Manage Assistants"
              disabled={selectedIds.length != 1}
              onClick={() =>
                toggleModal({
                  mode: "transfer",
                  isActive: true,
                  type: "assistant",
                  itemId: "uid",
                  itemShow: "name",
                  onAdd: createAssistant,
                  onRemove: deleteAssistant,
                })
              }
            >
              <FaUserGroup className="icon__admin-page" />
            </button>
            <button
              className="button__admin-page"
              title="Manage Students"
              disabled={selectedIds.length != 1}
              onClick={() =>
                toggleModal({
                  mode: "transfer",
                  isActive: true,
                  type: "student",
                  itemId: "uid",
                  itemShow: "name",
                  onAdd: createStudent,
                  onRemove: deleteStudent,
                })
              }
            >
              <FaUsersBetweenLines className="icon__admin-page" />
            </button>
            <button
              className="button__admin-page"
              title="Manage Materials"
              disabled={selectedIds.length != 1}
              onClick={() =>
                toggleModal({
                  mode: "transfer",
                  isActive: true,
                  type: "material",
                  itemId: "material_number",
                  itemShow: "title",
                  onAdd: createClassMaterial,
                  onRemove: deleteClassMaterial,
                })
              }
            >
              <FaBookOpen className="icon__admin-page" />
            </button>
            <button
              className="button__admin-page"
              title="Add Assignment"
              disabled={selectedIds.length != 1}
              onClick={() =>
                toggleModal({
                  isActive: true,
                  type: "assignment",
                  itemId: "assignment_number",
                  fields: assignmentFields,
                  onSubmit: handleAddAssignment,
                })
              }
            >
              <FaClipboardList className="icon__admin-page" />
            </button>
            <button
              className="button__admin-page"
              title="Add data"
              onClick={() =>
                toggleModal({
                  isActive: true,
                  type: "Student",
                  itemId: "class_code",
                  fields: fields(selectedIds[0]),
                  onSubmit: createClassroom,
                })
              }
            >
              <FaSquarePlus className="icon__admin-page" />
            </button>
            <button
              className="button__admin-page"
              title="Edit data"
              disabled={selectedIds.length != 1}
              onClick={() =>
                toggleModal({
                  isActive: true,
                  isEdit: true,
                  itemId: "class_code",
                  type: "Student",
                  fields: fields(selectedIds[0]),
                  onSubmit: updateClassroom,
                })
              }
            >
              <FaPenToSquare className="icon__admin-page" />
            </button>
            <button
              className="button__admin-page"
              title="Delete data"
              disabled={selectedIds.length < 1}
              onClick={handleDeleteData}
            >
              <FaEraser className="icon__admin-page" />
            </button>
            <button
              className="button__admin-page"
              title="View data"
              disabled={selectedIds.length != 1}
              onClick={() =>
                toggleModal({
                  isActive: true,
                  isView: true,
                  type: "Classroom",
                  itemId: "uid",
                  fields: fields(selectedIds[0], true),
                })
              }
            >
              <FaRegEye className="icon__admin-page" />
            </button>
          </div>
          <div className="input__admin-page">
            <input
              type="search"
              placeholder="Search by anything"
              onChange={handleSearch}
              title="Search users"
            />
            <FaMagnifyingGlass className="icon__admin-page" />
          </div>
        </section>
      </nav>
      <div className="table-container__admin-page">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedIds.length === currentData.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Assistants</th>
              <th>Total Students</th>
              <th>Total Materials</th>
              <th>Total Assignments</th>
            </tr>
          </thead>
          <tbody>
            {data ? (
              currentData.map((item) => (
                <tr
                  key={item.class_code}
                  onClick={() => handleSelect(item.class_code)}
                >
                  <td onClick={() => handleSelect(item.class_code)}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.class_code)}
                      onChange={() => handleSelect(item.class_code)}
                    />
                  </td>
                  <td title={item?.class_code}>{item?.class_code}</td>
                  <td title={item?.name}>{item?.name}</td>
                  <td
                    title={item?.assistants
                      ?.map((assist) => assist.name)
                      .join(", ")}
                  >
                    {item?.assistants
                      ?.map((assist) => assist.name)
                      .join(", ") || "-"}
                  </td>
                  <td title={`${item?.students?.length || 0} Students`}>
                    {item?.students?.length || 0}
                  </td>
                  <td title={`${item?.materials?.length || 0} Materials`}>
                    {item?.materials?.length || 0}
                  </td>
                  <td title={`${item?.assignments?.length || 0} Assignments`}>
                    {item?.assignments?.length || 0}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>Users not found</td>
              </tr>
            )}
          </tbody>
          <tfoot></tfoot>
        </table>

        <div className="table-action__admin-page">
          <button
            className="button__admin-page"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            title="previous page"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`button__admin-page page ${
                currentPage === i + 1 ? "active" : ""
              }`}
              title={`Page ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="button__admin-page"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            title="next page"
          >
            Next
          </button>
        </div>
      </div>

      {modal.isActive && modal.mode === "transfer" ? (
        <ManageDataTransfer
          isActive={modal?.isActive}
          isDelete={modal?.isDelete}
          type={modal?.type}
          class_code={selectedIds[0]}
          item_id={modal.itemId}
          item_show={modal.itemShow}
          onClose={modal.onClose}
          onAdd={modal.onAdd}
          onRemove={modal.onRemove}
          loadingSetting={switchLoading}
          allertSetting={setAllertSetting}
          fetchData={refreshData}
          inBoxItems={
            modal.type.toLowerCase() === "assistant"
              ? selectedClass?.assistants || []
              : modal.type.toLowerCase() === "student"
              ? selectedClass?.students || []
              : selectedClass?.materials || []
          }
          outBoxItems={
            modal.type.toLowerCase() === "assistant"
              ? users.filter(
                  (u) =>
                    u.role === "Asisten" &&
                    !selectedClass?.assistants?.some((a) => a.uid === u.uid)
                )
              : modal.type.toLowerCase() === "student"
              ? users.filter(
                  (u) =>
                    u.role !== "Asisten" &&
                    !selectedClass?.students?.some((s) => s.uid === u.uid)
                )
              : materials.filter(
                  (m) =>
                    !selectedClass?.materials?.some(
                      (sm) => sm.material_number === m.material_number
                    )
                )
          }
        />
      ) : null}

      {modal.isActive && modal.mode === "field" ? (
        <ManageDataField
          isActive={modal?.isActive}
          isEdit={modal?.isEdit}
          isView={modal?.isView}
          item_id={modal?.itemId}
          type={modal?.type}
          fields={modal?.fields}
          onClose={modal?.onClose}
          onSubmit={modal?.onSubmit}
          loadingSetting={switchLoading}
          allertSetting={setAllertSetting}
          fetchData={refreshData}
          item={data?.find((item) => item.class_code == selectedIds[0])}
        />
      ) : null}
    </main>
  );
}

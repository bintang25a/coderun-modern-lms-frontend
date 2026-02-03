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

export default function Classrooms() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  const selectedClass = data.find((c) => c.class_code === selectedIds[0]);

  const { switchLoading, setAllertSetting, setConfirmSetting } =
    useOutletContext();

  const fetchData = async () => {
    switchLoading(true);
    const [storageData, usersData, materialsData] = await Promise.all([
      getClassrooms(),
      getUsers(),
      getMaterials(),
    ]);

    setData(storageData);
    setUsers(usersData);
    setMaterials(materialsData);
    switchLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      isActive = false,
      isEdit = false,
      isDelete = false,
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
      mode: fields?.length > 0 ? "field" : "transfer",
      isActive,
      isEdit,
      isDelete,
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

      await fetchData();
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

  return (
    <main className="admin-users">
      <nav>
        <section className="left">
          <h1>Classrooms</h1>
        </section>
        <section className="right">
          <div className="action">
            <button
              title="Manage Assistants"
              disabled={selectedIds.length != 1}
              onClick={() =>
                toggleModal({
                  isActive: true,
                  type: "assistant",
                  itemId: "uid",
                  itemShow: "name",
                  onAdd: createAssistant,
                  onRemove: deleteAssistant,
                })
              }
            >
              <FaUserGroup className="icon" />
            </button>
            <button
              title="Manage Students"
              disabled={selectedIds.length != 1}
              onClick={() =>
                toggleModal({
                  isActive: true,
                  type: "student",
                  itemId: "uid",
                  itemShow: "name",
                  onAdd: createStudent,
                  onRemove: deleteStudent,
                })
              }
            >
              <FaUsersBetweenLines className="icon" />
            </button>
            <button
              title="Manage Materials"
              disabled={selectedIds.length != 1}
              onClick={() =>
                toggleModal({
                  isActive: true,
                  type: "material",
                  itemId: "material_number",
                  itemShow: "title",
                  onAdd: createClassMaterial,
                  onRemove: deleteClassMaterial,
                })
              }
            >
              <FaBookOpen className="icon" />
            </button>
            <button
              title="Add data"
              onClick={() =>
                toggleModal({
                  isActive: true,
                  type: "Student",
                  itemId: "class_code",
                  fields: [
                    {
                      name: "class_code",
                      label: "Class Code",
                      placeholder: "DDP-A1-2025",
                    },
                    {
                      name: "name",
                      label: "Class Name",
                      placeholder: "Praktikum DDP",
                    },
                  ],
                  onSubmit: createClassroom,
                })
              }
            >
              <FaSquarePlus className="icon" />
            </button>
            <button
              title="Edit data"
              disabled={selectedIds.length != 1}
              onClick={() =>
                toggleModal({
                  isActive: true,
                  isEdit: true,
                  itemId: "class_code",
                  type: "Student",
                  fields: [
                    {
                      name: "class_code",
                      label: "Class Code",
                      placeholder: "DDP-A1-2025",
                    },
                    {
                      name: "name",
                      label: "Class Name",
                      placeholder: "Praktikum DDP",
                    },
                  ],
                  onSubmit: updateClassroom,
                })
              }
            >
              <FaPenToSquare className="icon" />
            </button>
            <button
              title="Delete data"
              disabled={selectedIds.length < 1}
              onClick={handleDeleteData}
            >
              <FaEraser className="icon" />
            </button>
          </div>
          <div className="input">
            <input
              type="search"
              placeholder="Search by anything"
              onChange={handleSearch}
              title="Search users"
            />
            <FaMagnifyingGlass className="icon" />
          </div>
        </section>
      </nav>
      <div className="table-container">
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
                  title={item.name}
                  onClick={() => handleSelect(item.class_code)}
                >
                  <td onClick={() => handleSelect(item.class_code)}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.class_code)}
                      onChange={() => handleSelect(item.class_code)}
                    />
                  </td>
                  <td>{item?.class_code}</td>
                  <td>{item?.name}</td>
                  <td>
                    {item?.assistants?.map((assist) => assist.name).join(", ")}
                  </td>
                  <td>{item?.students?.length}</td>
                  <td>{item?.materials?.length}</td>
                  <td>{item?.assignments?.length}</td>
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

        <div className="table-action">
          <button
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
              className={`page ${currentPage === i + 1 ? "active" : ""}`}
              title={`Page ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}

          <button
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
          fetchData={fetchData}
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
          item_id={modal.itemId}
          type={modal?.type}
          fields={modal.fields}
          onClose={modal.onClose}
          onSubmit={modal.onSubmit}
          loadingSetting={switchLoading}
          allertSetting={setAllertSetting}
          fetchData={fetchData}
          item={data?.find((item) => item.class_code == selectedIds[0])}
        />
      ) : null}
    </main>
  );
}

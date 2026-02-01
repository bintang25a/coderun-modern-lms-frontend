import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  createClassroom,
  deleteClassroom,
  getClassrooms,
  updateClassroom,
} from "../../../_services/classrooms";
import "../admin.css";
import {
  FaCircleXmark,
  FaEraser,
  FaMagnifyingGlass,
  FaPenToSquare,
  FaSquarePlus,
} from "react-icons/fa6";
import {
  FaFileUpload,
  FaPaperPlane,
  FaUserMinus,
  FaUserPlus,
} from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import { getUsers } from "../../../_services/users";
import {
  createAssistant,
  updateAssistant,
} from "../../../_services/assistantClassroom";
import {
  createStudent,
  deleteStudent,
} from "../../../_services/studentClassroom";

const AddDeleteStudents = (param) => {
  const {
    isActive,
    onClose,
    isLoading,
    allertSetting,
    fetchData,
    users,
    class_code,
    isDelete = false,
  } = param;

  const [selectedStudents, setSelectedStudents] = useState([]);

  const moveToRight = (uid) => {
    if (!selectedStudents.includes(uid)) {
      setSelectedStudents([...selectedStudents, uid]);
    }
  };

  const moveToLeft = (uid) => {
    setSelectedStudents(selectedStudents.filter((id) => id !== uid));
  };

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) return alert("Pilih mahasiswa dulu!");
    isLoading(true);
    try {
      const promises = selectedStudents.map((uid) =>
        !isDelete
          ? createStudent({ class_code, uid })
          : deleteStudent(class_code, uid)
      );
      await Promise.all(promises);

      onClose();
      setSelectedStudents([]);
      allertSetting({
        isActive: true,
        message: "Students moved successfully",
        isSuccess: true,
      });
      await fetchData();
    } catch (error) {
      allertSetting({
        isActive: true,
        message: error.message,
        isSuccess: false,
      });
    } finally {
      isLoading(false);
    }
  };

  const availableUsers = users?.filter(
    (u) => !selectedStudents.includes(u.uid)
  );
  const chosenUsers = users?.filter((u) => selectedStudents.includes(u.uid));

  return (
    <div className={`action-form-overlay ${isActive ? `` : `inactive`}`}>
      <div className="action-form wide">
        <h2>MANAGE STUDENTS</h2>
        <p>
          Class: <b>{class_code}</b>
        </p>
        <div className="transfer-container">
          <div className="input-field">
            <label>Available Students ({availableUsers?.length})</label>
            <div className="student-box">
              {availableUsers?.map((user) => (
                <div
                  key={user.uid}
                  className="student-item"
                  onClick={() => moveToRight(user.uid)}
                >
                  <span>
                    {user.uid} - {user.name}
                  </span>
                  <FaUserPlus className="add-icon" />
                </div>
              ))}
            </div>
          </div>

          <div className="input-field">
            <label>Selected to Class ({chosenUsers?.length})</label>
            <div className="student-box selected">
              {chosenUsers?.map((user) => (
                <div
                  key={user.uid}
                  className="student-item"
                  onClick={() => moveToLeft(user.uid)}
                >
                  <span>
                    {user.uid} - {user.name}
                  </span>
                  <FaCircleXmark className="remove-icon" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={selectedStudents.length === 0}
        >
          <FaPaperPlane />
          Submit Enrollment
        </button>
        <FaCircleXmark className="icon-close" onClick={onClose} />
      </div>
    </div>
  );
};

const AddEditData = (param) => {
  const {
    isActive,
    isLoading,
    isEdit = false,
    onClose,
    allertSetting,
    fetchData,
    singleData = {},
    assistants,
  } = param;

  const initiateForm = {
    class_code: "",
    name: "",
    assistants: [],
  };
  const [formData, setFormData] = useState(
    !isEdit
      ? initiateForm
      : { ...singleData, assistants: singleData.assistants.map((s) => s.uid) }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("assistants_")) {
      const index = parseInt(name.split("_")[1]);

      const newAssistants = [...formData.assistants];
      newAssistants[index] = value;

      setFormData({
        ...formData,
        assistants: newAssistants,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    isLoading(true);

    try {
      !isEdit
        ? await createClassroom(JSON.stringify(formData))
        : await updateClassroom(
            singleData?.class_code,
            JSON.stringify(formData)
          );

      const change = formData.assistants !== singleData.assistants;
      let promises;
      if (!isEdit || singleData.assistants.length < 2) {
        promises = formData.assistants
          ?.filter((id) => id)
          .map((id) =>
            createAssistant({
              class_code: formData.class_code,
              uid: id,
            })
          );
      } else if (change) {
        promises = formData.assistants
          ?.filter((id) => id)
          .map((newUid, index) => {
            const oldUid = singleData.assistants[index]?.uid;

            return updateAssistant(formData.class_code, oldUid, {
              class_code: formData.class_code,
              uid: newUid,
            });
          });
      }

      if (change || !isEdit) await Promise.all(promises);

      onClose();
      setFormData(initiateForm);

      allertSetting({
        ...allertSetting,
        isActive: true,
        message: `${isEdit ? "Edit" : "Create"} data successfully`,
        isSuccess: true,
      });

      await fetchData();
    } catch (error) {
      allertSetting({
        ...allertSetting,
        isActive: true,
        message: error,
        isSuccess: false,
      });
    } finally {
      isLoading(false);
    }
  };

  return (
    <div className={`action-form-overlay ${isActive ? `` : `inactive`}`}>
      <div className="action-form">
        <h2>{!isEdit ? "ADD DATA" : "EDIT DATA"}</h2>

        <div className="input-container">
          <div className="input-field">
            <label htmlFor="class_code">Class Code</label>
            <input
              type="text"
              name="class_code"
              id="class_code"
              placeholder="DDP-A1.2.1-2025"
              autoComplete="new-email"
              onChange={handleChange}
              value={formData?.class_code}
              disabled={isEdit}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="name">Class Name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Praktikum Dasar-dasar pemrograman"
              onChange={handleChange}
              value={formData?.name}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="assistants_0">Tutor</label>
            <select
              name="assistants_0"
              id="assistants_0"
              onChange={handleChange}
              value={formData?.assistants[0]}
            >
              <option value="">Choose Tutor</option>
              {assistants
                ? assistants.map((assistant) => (
                    <option
                      key={assistant.uid}
                      value={assistant.uid}
                    >{`${assistant.uid} - ${assistant.name}`}</option>
                  ))
                : null}
            </select>
          </div>
          <div className="input-field">
            <label htmlFor="assistants_1">Assistant</label>
            <select
              name="assistants_1"
              id="assistants_1"
              onChange={handleChange}
              value={formData?.assistants[1]}
            >
              <option value="">Choose Assistant</option>
              {assistants
                ? assistants.map((assistant) => (
                    <option
                      key={assistant.uid}
                      value={assistant.uid}
                    >{`${assistant.uid} - ${assistant.name}`}</option>
                  ))
                : null}
            </select>
          </div>
        </div>

        <button type="submit" onClick={handleSubmit}>
          <FaPaperPlane />
          Submit
        </button>

        <FaCircleXmark className="icon-close" onClick={onClose} />
      </div>
    </div>
  );
};

export default function Classrooms() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [addForm, setAddForm] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [addStudents, setAddStudents] = useState(false);
  const [deleteStudents, setDeleteStudents] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const { switchLoading, setAllertSetting, setConfirmSetting } =
    useOutletContext();

  const fetchData = async () => {
    switchLoading(true);
    const [storageData, usersData] = await Promise.all([
      getClassrooms(),
      getUsers(),
    ]);

    setData(storageData);
    setUsers(usersData);
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

  const handleAddForm = () => {
    setAddForm(!addForm);
  };

  const handleEditForm = () => {
    setEditForm(!editForm);
  };

  const handleAddStudents = () => {
    setAddStudents(!addStudents);
  };

  const handleDeleteStudents = () => {
    setDeleteStudents(!deleteStudents);
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
      const allIds = currentData.map((item) => item.uid);
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
              title="Add Students"
              disabled={selectedIds.length != 1}
              onClick={handleAddStudents}
            >
              <FaUserPlus className="icon" />
            </button>
            <button
              title="Delete Students"
              disabled={selectedIds.length != 1}
              onClick={handleDeleteStudents}
            >
              <FaUserMinus className="icon" />
            </button>
            <button title="Add data" onClick={handleAddForm}>
              <FaSquarePlus className="icon" />
            </button>
            <button
              title="Edit data"
              disabled={selectedIds.length != 1}
              onClick={handleEditForm}
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
                <input type="checkbox" onChange={handleSelectAll} />
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

      {addStudents ? (
        <AddDeleteStudents
          isActive={addStudents}
          onClose={handleAddStudents}
          isLoading={switchLoading}
          allertSetting={setAllertSetting}
          fetchData={fetchData}
          users={users?.filter(
            (user) =>
              !data
                ?.find((item) => item.class_code === selectedIds[0])
                ?.students?.some((student) => student.uid === user.uid)
          )}
          class_code={selectedIds[0]}
        />
      ) : null}

      {deleteStudents ? (
        <AddDeleteStudents
          isActive={deleteStudents}
          onClose={handleDeleteStudents}
          isLoading={switchLoading}
          allertSetting={setAllertSetting}
          fetchData={fetchData}
          users={
            data?.find((item) => item.class_code == selectedIds[0])?.students
          }
          class_code={selectedIds[0]}
          isDelete={true}
        />
      ) : null}

      {addForm ? (
        <AddEditData
          isActive={addForm}
          onClose={handleAddForm}
          isLoading={switchLoading}
          allertSetting={setAllertSetting}
          fetchData={fetchData}
          assistants={users?.filter((user) => user.role !== "Praktikan")}
        />
      ) : null}

      {editForm ? (
        <AddEditData
          isActive={editForm}
          isLoading={switchLoading}
          isEdit={true}
          onClose={handleEditForm}
          allertSetting={setAllertSetting}
          fetchData={fetchData}
          singleData={data?.find((item) => item.class_code == selectedIds[0])}
          assistants={users?.filter((user) => user.role !== "Praktikan")}
        />
      ) : null}
    </main>
  );
}

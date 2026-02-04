import { useEffect, useState } from "react";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../../../_services/assignments";
import "../admin.css";
import {
  FaEraser,
  FaMagnifyingGlass,
  FaPenToSquare,
  FaSquarePlus,
  FaRegEye,
  FaChalkboard,
} from "react-icons/fa6";
import { useOutletContext } from "react-router-dom";
import { getClassrooms } from "../../../_services/classrooms";
import { formatDate } from "../../../_utilities/formatDate";

import ManageDataField from "../../../components/action/ManageDataField";

export default function Assignments() {
  const [selectedClass, setSelectedClass] = useState(false);
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
  const [classrooms, setClassrooms] = useState(state.classrooms || []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        switchLoading(true);

        const [storageData, classroomsData] = await Promise.all([
          getAssignments(),
          getClassrooms(),
        ]);

        setData(storageData);
        setClassrooms(classroomsData);
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
    setClassrooms(state?.classrooms || []);
  }, [state]);

  const filteredData = data?.filter((item) => {
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
      const allIds = currentData.map((item) => item.assignment_number);
      setSelectedIds(allIds);
    }
  };

  const handleAddData = async (formData) => {
    const code = selectedClass?.class_code?.match(/\[(.*?)\]/)?.[1];

    await createAssignment(code, formData);
  };

  const handleEditData = async (id, formData) => {
    const tempData = data.find((a) => a.assignment_number === selectedIds[0]);
    const code = tempData?.classroom?.class_code;

    await updateAssignment(code, id, formData);
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

      const deletePromises = selectedIds.map((id) => {
        const item = data.find((a) => a.assignment_number === id);
        const currentClassCode = item?.class_code;

        return deleteAssignment(currentClassCode, id);
      });

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

  const classroomFields = [
    {
      name: "class_code",
      label: "Select Classrooms",
      type: "select",
      options: classrooms.map((c) => {
        return {
          value: `${c.name} [${c.class_code}]`,
          label: `${c.name} [${c.class_code}]`,
        };
      }),
    },
  ];

  const fields = (id = 0, isView = false) => {
    const item = currentData.find((item) => item.assignment_number == id);

    const actionFields = [
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

    if (!item) return actionFields;

    const viewFields = [
      {
        name: "assignment_number",
        label: "ID",
        value: item?.assignment_number,
      },
      {
        name: "title",
        label: "Title",
        value: item?.title,
      },
      {
        name: "description",
        label: "Description",
        value: item?.description,
      },
      {
        name: "time_range",
        label: "Time Range",
        value: `${formatDate(item?.startAt)} - ${formatDate(item?.endAt)}`,
      },
      {
        name: "overtime",
        label: "Allow Overtime",
        value: item?.overtime,
      },
      {
        name: "publisher",
        label: "Publisher",
        value: `${item?.assistant_uid} - ${item?.assistant?.name}`,
      },
      {
        name: "classroom",
        label: "Classroom",
        value: `${item?.classroom?.class_code} - ${item?.classroom?.name}`,
      },
      {
        name: "answer",
        label: "Answer Key",
        value: item?.answer_key,
      },
      {
        name: "grade",
        label: "Graded",
        value: `${item?.submissions?.length} Students`,
      },
    ];

    return isView ? viewFields : actionFields;
  };

  return (
    <main className="__admin-page">
      <nav className="navbar__admin-page">
        <section className="left__admin-page">
          <h1 className="title__admin-page">Assignments</h1>
        </section>
        <section className="right__admin-page">
          <div className="action__admin-page">
            <button
              className="button__admin-page"
              title="Select classroom"
              onClick={() =>
                toggleModal({
                  isActive: true,
                  type: "Classrooms",
                  itemId: "class_code",
                  fields: classroomFields,
                  onSubmit: setSelectedClass,
                })
              }
            >
              <FaChalkboard className="icon__admin-page" />
            </button>
            <button
              className="button__admin-page"
              title="Add data"
              disabled={!selectedClass}
              onClick={() =>
                toggleModal({
                  isActive: true,
                  type: "Assignment",
                  itemId: "assignment_number",
                  fields: fields(),
                  onSubmit: handleAddData,
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
                  type: "Assignment",
                  itemId: "assignment_number",
                  fields: fields(selectedIds[0]),
                  onSubmit: handleEditData,
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
                  type: "Assignment",
                  itemId: "assignment_number",
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
              <th>Title</th>
              <th>Description</th>
              <th>Time Range</th>
              <th>Allow Overtime</th>
              <th>Publisher</th>
              <th>Classroom</th>
              <th>Answer Key</th>
              <th>Graded</th>
            </tr>
          </thead>
          <tbody>
            {data ? (
              currentData.map((item) => (
                <tr
                  key={item.assignment_number}
                  onClick={() => handleSelect(item.assignment_number)}
                >
                  <td onClick={() => handleSelect(item.assignment_number)}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.assignment_number)}
                      onChange={() => handleSelect(item.assignment_number)}
                    />
                  </td>
                  <td title={item?.assignment_number}>
                    {item?.assignment_number}
                  </td>
                  <td title={item?.title}>{item?.title}</td>
                  <td title={item?.description}>{item?.description}</td>
                  <td
                    title={`${formatDate(item?.startAt)} - ${formatDate(
                      item?.endAt
                    )}`}
                  >
                    {formatDate(item?.startAt)} - {formatDate(item?.endAt)}
                  </td>
                  <td>{item?.overtime ? "true" : "false"}</td>
                  <td
                    title={`${item?.assistant_uid} - ${item?.assistant?.name}`}
                  >
                    {item?.assistant_uid} - {item?.assistant?.name}
                  </td>
                  <td
                    title={`${item?.classroom?.class_code} - ${item?.classroom?.name}`}
                  >
                    {item?.classroom?.class_code} - {item?.classroom?.name}
                  </td>
                  <td>{item?.answer_key ? "true" : "false"}</td>
                  <td>{item?.submissions?.length}</td>
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

      {modal.isActive && modal.mode === "field" ? (
        <ManageDataField
          isActive={modal?.isActive}
          isEdit={modal?.isEdit}
          isView={modal?.isView}
          class_code={selectedClass?.class_code}
          item_id={modal?.itemId}
          type={modal?.type}
          fields={modal?.fields}
          onClose={modal?.onClose}
          onSubmit={modal?.onSubmit}
          loadingSetting={switchLoading}
          allertSetting={setAllertSetting}
          fetchData={refreshData}
          item={data?.find((item) => item?.assignment_number == selectedIds[0])}
        />
      ) : null}
    </main>
  );
}

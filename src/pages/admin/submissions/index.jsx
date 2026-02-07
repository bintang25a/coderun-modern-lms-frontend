import { useEffect, useState } from "react";
import {
  getSubmissions,
  deleteSubmission,
} from "../../../_services/submissions";
import { FaEraser, FaMagnifyingGlass, FaRegEye } from "react-icons/fa6";
import { useOutletContext } from "react-router-dom";
import { formatDate } from "../../../_utilities/formatDate";
import Overlay from "../../../components/container/Overlay";
import ManageDataField from "../../../components/action/ManageDataField";
import { toggleModal } from "../../../_utilities/toggleModal";
import "../admin.css";

export default function Submissions() {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        switchLoading(true);

        const [storageData] = await Promise.all([getSubmissions()]);

        setData(storageData);
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
  }, [state]);

  const filteredData = data?.filter((item) => {
    const columnsToSearch = [
      "submission_number",
      "grade",
      "assignment_number",
      "assistant_uid",
      "answer",
    ];

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
      const allIds = currentData.map((item) => item.submission_number);
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

      const deletePromises = selectedIds.map((id) => {
        const item = data.find((a) => a.submission_number === id);
        const currentAssignmentNumber = item?.assignment_number;

        return deleteSubmission(currentAssignmentNumber, id);
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

  const fields = (id = 0) => {
    const item = currentData.find((item) => item.submission_number == id);

    if (!item) return [];

    return [
      {
        name: "submission_number",
        label: "ID",
        value: item?.submission_number,
      },
      {
        name: "assignment_uid",
        label: "Assignment",
        value: `${item?.assignment_number} - ${item?.assignment?.title}`,
      },
      {
        name: "student_uid",
        label: "Student",
        value: `${item?.student_uid} - ${item?.student?.name}`,
      },
      {
        name: "answer",
        label: "Answer",
        value: item?.answer,
      },
      {
        name: "upload_at",
        label: "Upload At",
        value: `${formatDate(item?.createdAt)} - ${formatDate(
          item?.updatedAt
        )}`,
      },
      {
        name: "assistant_uid",
        label: "Grade by",
        value: `${item?.assistant_uid || ""} - ${item?.assistant?.name || ""}`,
      },
      {
        name: "grade",
        label: "Grade",
        value: item?.grade || 0,
      },
    ];
  };

  return (
    <main className="__admin-page">
      <nav className="navbar__admin-page">
        <section className="left__admin-page">
          <h1 className="title__admin-page">Submissions</h1>
        </section>
        <section className="right__admin-page">
          <div className="action__admin-page">
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
                  title: "VIEW SUBMISSION",
                  isActive: true,
                  isView: true,
                  type: "Assignment",
                  itemId: "assignment_number",
                  fields: fields(selectedIds[0]),
                  setModal,
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
              <th>Assignment</th>
              <th>Student</th>
              <th>Answer</th>
              <th>Upload At</th>
              <th>Grade by</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              currentData.map((item) => (
                <tr
                  key={item.submission_number}
                  onClick={() => handleSelect(item.submission_number)}
                >
                  <td onClick={() => handleSelect(item.submission_number)}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.submission_number)}
                      onChange={() => handleSelect(item.submission_number)}
                    />
                  </td>
                  <td title={item?.submission_number}>
                    {item?.submission_number}
                  </td>
                  <td
                    title={`${item?.assignment_number} - ${item?.assignment?.title}`}
                  >
                    {`${item?.assignment_number} - ${item?.assignment?.title}`}
                  </td>
                  <td title={`${item?.student_uid} - ${item?.student?.name}`}>
                    {`${item?.student_uid} - ${item?.student?.name}`}
                  </td>
                  <td title={item?.answer}>{item?.answer}</td>
                  <td
                    title={`${formatDate(item?.createdAt)} - ${formatDate(
                      item?.updatedAt
                    )}`}
                  >
                    {`${formatDate(item?.createdAt)} - ${formatDate(
                      item?.updatedAt
                    )}`}
                  </td>
                  <td
                    title={`${item?.assistant_uid || ""} - ${
                      item?.assistant?.name || ""
                    }`}
                  >
                    {`${item?.assistant_uid || ""} - ${
                      item?.assistant?.name || ""
                    }`}
                  </td>
                  <td title={item?.grade || 0}>{item?.grade || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>Submissions not found</td>
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
        <Overlay isActive={modal?.isActive} onClose={modal?.onClose}>
          <ManageDataField
            title={modal?.title}
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
            item={data?.find(
              (item) => item?.submission_number == selectedIds[0]
            )}
          />
        </Overlay>
      ) : null}
    </main>
  );
}

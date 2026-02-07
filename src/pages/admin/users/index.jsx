import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../../../_services/users";
import "../admin.css";
import {
  FaEraser,
  FaMagnifyingGlass,
  FaPenToSquare,
  FaRegEye,
  FaSquarePlus,
} from "react-icons/fa6";
import { FaFileUpload, FaPaperPlane } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import ManageDataField from "../../../components/action/ManageDataField";
import AddDataCsv from "../../../components/action/AddDataCsv";
import Overlay from "../../../components/container/Overlay";
import { toggleModal } from "../../../_utilities/toggleModal";

export default function Users() {
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

        const [storageData] = await Promise.all([getUsers()]);

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

  const filteredData = data.filter((item) => {
    const columnsToSearch = [
      "uid",
      "name",
      "email",
      "phone_number",
      "role",
      "photo",
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

      const deletePromises = selectedIds.map((id) => deleteUser(id));
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

  const fields = (id, isView = false) => {
    const item = currentData.find((item) => item.uid == id);

    return [
      {
        name: "uid",
        label: "UID",
        placeholder: "22040700020",
        disabledOnEdit: true,
        value: item?.uid,
      },
      {
        name: "name",
        label: "Full Name",
        placeholder: "Bintang Al Fizar",
        value: item?.name,
      },
      {
        name: "email",
        label: "Email",
        placeholder: "22040700020@student.umj.ac.id",
        type: "email",
        value: item?.email,
      },
      {
        name: "phone_number",
        label: "Phone Number",
        placeholder: "082111234455",
        type: "number",
        value: item?.phone_number,
      },
      {
        name: "role",
        label: "Role",
        type: "select",
        options: [
          { value: "Admin", label: "Admin" },
          { value: "Asisten", label: "Asisten" },
          { value: "Praktikan", label: "Praktikan" },
        ],
        value: item?.role,
      },
      {
        name: "password",
        label: "Password",
        placeholder: "Make your password",
        type: isView ? "text" : "password",
        value: item?.password,
      },
    ];
  };

  return (
    <main className="__admin-page">
      <nav className="navbar__admin-page">
        <section className="left__admin-page">
          <h1 className="title__admin-page">Users</h1>
        </section>
        <section className="right__admin-page">
          <div className="action__admin-page">
            <button
              className="button__admin-page"
              title="Add data via excel"
              onClick={() =>
                toggleModal({
                  mode: "file",
                  isActive: true,
                  onSubmit: createUser,
                  setModal,
                })
              }
            >
              <FaFileUpload className="icon__admin-page" />
            </button>
            <button
              className="button__admin-page"
              title="Add data"
              onClick={() =>
                toggleModal({
                  title: "ADD USER",
                  message: "Create user success",
                  isActive: true,
                  type: "User",
                  itemId: "uid",
                  fields: fields(selectedIds[0]),
                  onSubmit: createUser,
                  setModal,
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
                  title: "EDIT USER",
                  message: "Update user success",
                  isActive: true,
                  isEdit: true,
                  type: "User",
                  itemId: "uid",
                  onSubmit: updateUser,
                  fields: fields(selectedIds[0]),
                  setModal,
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
                  title: "VIEW USER",
                  isActive: true,
                  isView: true,
                  type: "User",
                  itemId: "uid",
                  fields: fields(selectedIds[0], true),
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
              <th>Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Role</th>
              <th>Photo</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            {data ? (
              currentData.map((item) => (
                <tr key={item.uid} onClick={() => handleSelect(item.uid)}>
                  <td onClick={() => handleSelect(item.uid)}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.uid)}
                      onChange={() => handleSelect(item.uid)}
                    />
                  </td>
                  <td title={item.uid}>{item?.uid}</td>
                  <td title={item?.name}>{item?.name}</td>
                  <td title={item?.email}>{item?.email}</td>
                  <td title={item?.phone_number}>{item?.phone_number}</td>
                  <td title={item?.role}>{item?.role}</td>
                  <td title={item?.photo}>{item?.photo}</td>
                  <td title={item?.password}>{item?.password}</td>
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

      {modal.isActive && modal.mode !== "file" ? (
        <Overlay isActive={modal?.isActive} onClose={modal?.onClose}>
          <ManageDataField
            title={modal?.title}
            message={modal?.message}
            isEdit={modal?.isEdit}
            isView={modal?.isView}
            item_id={modal?.itemId}
            type={modal?.type}
            fields={modal?.fields}
            onClose={modal?.onClose}
            onSubmit={modal?.onSubmit}
            loadingSetting={switchLoading}
            allertSetting={setAllertSetting}
            refreshData={refreshData}
            item={{
              ...data?.find((item) => item.uid == selectedIds[0]),
              password: "",
            }}
          />
        </Overlay>
      ) : null}

      {modal.isActive && modal.mode === "file" ? (
        <Overlay isActive={modal?.isActive} onClose={modal?.onClose}>
          <AddDataCsv
            onClose={modal.onClose}
            onSubmit={modal.onSubmit}
            loadingSetting={switchLoading}
            allertSetting={setAllertSetting}
            refreshData={refreshData}
          />
        </Overlay>
      ) : null}
    </main>
  );
}

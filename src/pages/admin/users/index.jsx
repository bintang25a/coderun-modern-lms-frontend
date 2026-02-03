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
  FaCircleXmark,
  FaEraser,
  FaMagnifyingGlass,
  FaPenToSquare,
  FaSquarePlus,
} from "react-icons/fa6";
import { FaFileUpload, FaPaperPlane } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import ManageDataField from "../../../components/action/ManageDataField";

export default function Users() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({});
  const [addFile, setAddFile] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fields = [
    {
      name: "uid",
      label: "UID",
      placeholder: "22040700020",
    },
    {
      name: "name",
      label: "Full Name",
      placeholder: "Bintang Al Fizar",
    },
    {
      name: "email",
      label: "Email",
      placeholder: "22040700020@student.umj.ac.id",
    },
    {
      name: "phone_number",
      label: "Phone Number",
      placeholder: "082111234455",
    },
    {
      name: "role",
      label: "Role (Admin, Asisten, Praktikan)",
      placeholder: "Praktikan",
    },
    {
      name: "password",
      label: "Password",
      placeholder: "Make your password",
    },
  ];

  const { switchLoading, setAllertSetting, setConfirmSetting } =
    useOutletContext();

  const fetchData = async () => {
    switchLoading(true);
    const [storageData] = await Promise.all([getUsers()]);

    setData(storageData);
    switchLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleAddFile = () => {
    setAddFile(!addFile);
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
          <h1>Users</h1>
        </section>
        <section className="right">
          <div className="action">
            <button title="Add data via excel" onClick={handleAddFile}>
              <FaFileUpload className="icon" />
            </button>
            <button
              title="Add data"
              onClick={() =>
                toggleModal({
                  isActive: true,
                  type: "User",
                  itemId: "uid",
                  onSubmit: createUser,
                  fields: fields,
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
                  type: "User",
                  itemId: "uid",
                  onSubmit: updateUser,
                  fields: fields,
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
                <input type="checkbox" onChange={handleSelectAll} />
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
                <tr
                  key={item.uid}
                  title={item.name}
                  onClick={() => handleSelect(item.uid)}
                >
                  <td onClick={() => handleSelect(item.uid)}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.uid)}
                      onChange={() => handleSelect(item.uid)}
                    />
                  </td>
                  <td>{item?.uid}</td>
                  <td>{item?.name}</td>
                  <td>{item?.email}</td>
                  <td>{item?.phone_number}</td>
                  <td>{item?.role}</td>
                  <td>{item?.photo}</td>
                  <td>{item?.password}</td>
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
          item={{
            ...data?.find((item) => item.uid == selectedIds[0]),
            password: "",
          }}
        />
      ) : null}
    </main>
  );
}

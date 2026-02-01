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

const AddFile = (param) => {
  const { isActive, onClose, isLoading, allertSetting, fetchData } = param;

  const [csvData, setCsvData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    isLoading(true);

    Papa.parse(file, {
      complete: (results) => {
        const filteredData = results.data.filter(
          (row) => row.length >= 2 && row[0] !== ""
        );

        const formattedData = filteredData.map((row) => ({
          uid: row[0].toString().trim(),
          name: row[1].toString().trim(),
          email: `${row[0].toString().trim()}@student.umj.ac.id`,
          phone_number: "0821",
          role: "Praktikan",
          password: row[0].toString().trim(),
        }));

        setCsvData(formattedData);
        isLoading(false);

        allertSetting({
          isActive: true,
          message: `${formattedData.length} data siap diimport`,
          isSuccess: true,
        });
      },
      error: (error) => {
        console.error(error);
        isLoading(false);
      },
    });
  };

  const handleSubmitCsv = async () => {
    if (csvData.length === 0) return;
    isLoading(true);

    try {
      const promises = csvData.map((item) => createUser(JSON.stringify(item)));
      await Promise.all(promises);

      onClose();
      setCsvData([]);

      allertSetting({
        isActive: true,
        message: "Bulk upload success!",
        isSuccess: true,
      });

      await fetchData();
    } catch (error) {
      allertSetting({
        isActive: true,
        message: `Failed to upload CSV data. ${error}`,
        isSuccess: false,
      });
    } finally {
      isLoading(false);
    }
  };

  return (
    <div className={`action-form-overlay ${isActive ? `` : `inactive`}`}>
      <div className="action-form">
        <h2>UPLOAD CSV DATA</h2>

        <div className="input-container">
          <div className="input-field file">
            <p>
              Format CSV: <br /> column 1:<b> UID</b>, column 2: <b>Name</b>
            </p>
          </div>
          <div className="input-field file">
            <label htmlFor="csv-upload" className="file">
              <FaFileUpload /> Choose CSV file
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {csvData.length > 0 && (
          <p className="file-info">
            Terdeteksi: <b>{csvData.length} Baris</b>
          </p>
        )}

        <button
          type="submit"
          onClick={handleSubmitCsv}
          disabled={csvData.length === 0}
          className={csvData.length > 0 ? "active" : ""}
        >
          <FaPaperPlane />
          {csvData.length > 0 ? `Upload ${csvData.length} Data` : "Submit"}
        </button>

        <FaCircleXmark
          className="icon-close"
          onClick={() => {
            setCsvData([]);
            onClose();
          }}
        />
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
    singleData,
  } = param;

  const initiateForm = {
    uid: "",
    name: "",
    email: "",
    phone_number: "",
    role: "Praktikan",
    password: "",
  };

  const [formData, setFormData] = useState(
    isEdit ? { ...singleData, password: "" } : initiateForm
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    isLoading(true);

    try {
      !isEdit
        ? await createUser(JSON.stringify(formData))
        : await updateUser(singleData?.uid, JSON.stringify(formData));

      onClose();
      setFormData(initiateForm);

      allertSetting({
        ...allertSetting,
        isActive: true,
        message: `${!isEdit ? "Create" : "Update"} data successfully`,
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
            <label htmlFor="uid">UID</label>
            <input
              type="text"
              name="uid"
              id="uid"
              placeholder="22040700020"
              autoComplete="new-email"
              onChange={handleChange}
              value={formData?.uid}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Bintang Al Fizar"
              onChange={handleChange}
              value={formData?.name}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="bintang@email.com"
              autoComplete="new-email"
              onChange={handleChange}
              value={formData?.email}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              id="phone_number"
              placeholder="0821325833"
              autoComplete="new-email"
              onChange={handleChange}
              value={formData?.phone_number}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Make your password"
              autoComplete="new-password"
              onChange={handleChange}
              value={formData?.password}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="role">Select Role</label>
            <select
              name="role"
              id="role"
              onChange={handleChange}
              value={formData?.role}
            >
              <option value="Praktikan">Praktikan</option>
              <option value="Asisten">Asisten</option>
              <option value="Admin">Admin</option>
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

export default function Users() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [addForm, setAddForm] = useState(false);
  const [addFile, setAddFile] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

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

  const handleAddForm = () => {
    setAddForm(!addForm);
  };

  const handleAddFile = () => {
    setAddFile(!addFile);
  };

  const handleEditForm = () => {
    setEditForm(!editForm);
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

      {addFile ? (
        <AddFile
          isActive={addFile}
          onClose={handleAddFile}
          isLoading={switchLoading}
          allertSetting={setAllertSetting}
          fetchData={fetchData}
        />
      ) : null}

      {addForm ? (
        <AddEditData
          isActive={addForm}
          isLoading={switchLoading}
          onClose={handleAddForm}
          allertSetting={setAllertSetting}
          fetchData={fetchData}
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
          singleData={data?.find((item) => item.uid == selectedIds[0])}
        />
      ) : null}
    </main>
  );
}

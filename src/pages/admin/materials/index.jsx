import { useEffect, useState } from "react";
import {
  createMaterial,
  deleteMaterial,
  getMaterials,
  updateMaterial,
} from "../../../_services/materials";
import "../admin.css";
import {
  FaCircleXmark,
  FaEraser,
  FaMagnifyingGlass,
  FaPenToSquare,
  FaSquarePlus,
} from "react-icons/fa6";
import { FaUserMinus, FaUserPlus } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import ManageDataField from "../../../components/action/ManageDataField";

export default function Materials() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

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

  const { switchLoading, setAllertSetting, setConfirmSetting } =
    useOutletContext();

  const fetchData = async () => {
    switchLoading(true);
    const [storageData] = await Promise.all([getMaterials()]);

    setData(storageData);
    switchLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const filteredData = data.filter((item) => {
    const columnsToSearch = ["material_number", "title"];

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
      const allIds = currentData.map((item) => item.material_number);
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

      const deletePromises = selectedIds.map((id) => deleteMaterial(id));
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
          <h1>Materials</h1>
        </section>
        <section className="right">
          <div className="action">
            <button
              title="Add data"
              onClick={() =>
                toggleModal({
                  isActive: true,
                  type: "Material",
                  itemId: "material_number",
                  onSubmit: createMaterial,
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
                  type: "Material",
                  itemId: "material_number",
                  onSubmit: updateMaterial,
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
                <input
                  type="checkbox"
                  checked={selectedIds.length === currentData.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>Assistant</th>
              <th>Title</th>
              <th>Material</th>
              <th>Total Used</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              currentData.map((item) => (
                <tr
                  key={item.material_number}
                  title={item.name}
                  onClick={() => handleSelect(item.material_number)}
                >
                  <td onClick={() => handleSelect(item.material_number)}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.material_number)}
                      onChange={() => handleSelect(item.material_number)}
                    />
                  </td>
                  <td>{item?.material_number}</td>
                  <td>{item?.assistant}</td>
                  <td>{item.title}</td>
                  <td>{item?.material}</td>
                  <td>{item?.classrooms?.length}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>Data not found</td>
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

      {modal.isActive ? (
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
            ...data?.find((item) => item.material_number == selectedIds[0]),
            password: "",
          }}
        />
      ) : null}
    </main>
  );
}

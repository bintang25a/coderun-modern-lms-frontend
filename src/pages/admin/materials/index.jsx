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
  FaRegEye,
  FaSquarePlus,
} from "react-icons/fa6";
import { useOutletContext } from "react-router-dom";
import ManageDataField from "../../../components/action/ManageDataField";

export default function Materials() {
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

        const [storageData] = await Promise.all([getMaterials()]);

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

  const filteredData = data.filter((item) => {
    const columnsToSearch = [
      "material_number",
      "title",
      "assistant_uid",
      "material",
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

  const fields = (id = 0, isView = false) => {
    const item = currentData.find((item) => item?.material_number == id);

    console.log(item);

    const actionFields = [
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

    if (!item) return actionFields;

    const viewFields = [
      {
        name: "material_number",
        label: "ID",
        value: item?.material_number,
      },

      {
        name: "title",
        label: "Title",
        value: item?.title,
      },
      {
        name: "assistant_uid",
        label: "Assistant",
        value: item?.assistant_uid,
      },
      {
        name: "material",
        label: "Material Path",
        value: item?.material,
      },
      {
        name: "total_used",
        label: "Total Used",
        value: `${item?.classrooms?.length || 0} Classrooms`,
      },
    ];

    return isView ? viewFields : actionFields;
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
                  fields: fields(),
                  onSubmit: createMaterial,
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
                  type: "Material",
                  itemId: "material_number",
                  fields: fields(selectedIds[0]),
                  onSubmit: updateMaterial,
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
            <button
              title="View data"
              disabled={selectedIds.length != 1}
              onClick={() =>
                toggleModal({
                  isActive: true,
                  isView: true,
                  type: "Material",
                  itemId: "material_number",
                  fields: fields(selectedIds[0], true),
                })
              }
            >
              <FaRegEye className="icon" />
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
              <th>Title</th>
              <th>Assistant</th>
              <th>Material</th>
              <th>Total Used</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              currentData.map((item) => (
                <tr
                  key={item.material_number}
                  onClick={() => handleSelect(item.material_number)}
                >
                  <td onClick={() => handleSelect(item.material_number)}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.material_number)}
                      onChange={() => handleSelect(item.material_number)}
                    />
                  </td>
                  <td title={item?.material_number}>{item?.material_number}</td>
                  <td title={item?.title}>{item?.title}</td>
                  <td title={item?.assistant_uid}>{item?.assistant_uid}</td>
                  <td title={item?.material}>{item?.material}</td>
                  <td title={`${item?.classrooms?.length || 0} Classrooms`}>
                    {item?.classrooms?.length || 0}
                  </td>
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
          isView={modal?.isView}
          item_id={modal.itemId}
          type={modal?.type}
          fields={modal?.fields}
          onClose={modal?.onClose}
          onSubmit={modal?.onSubmit}
          loadingSetting={switchLoading}
          allertSetting={setAllertSetting}
          fetchData={refreshData}
          item={data?.find((item) => item.material_number == selectedIds[0])}
        />
      ) : null}
    </main>
  );
}

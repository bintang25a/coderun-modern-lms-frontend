import { useState, useEffect } from "react";
import { FaCircleXmark, FaUserPlus, FaUserMinus } from "react-icons/fa6";

const ManageDataTransfer = ({
  isActive = false,
  type = "",
  class_code = "",
  item_id = "",
  item_show = "",
  inBoxItems = [],
  outBoxItems = [],
  onClose,
  onAdd,
  onRemove,
  allertSetting,
  fetchData,
}) => {
  const [localGeneral, setLocalGeneral] = useState([]);
  const [localClassroom, setLocalClassroom] = useState([]);
  const [isChange, setIsChange] = useState(false);

  useEffect(() => {
    setLocalGeneral(outBoxItems);
    setLocalClassroom(inBoxItems);
  }, [outBoxItems, inBoxItems]);

  const handleClose = async () => {
    isChange ? await fetchData() : null;
    onClose();
  };

  const handleAction = async (item, actionType) => {
    setIsChange(true);
    const id = item[item_id];

    if (actionType === "add") {
      setLocalClassroom((prev) => prev.filter((i) => i[item_id] !== id));
      setLocalGeneral((prev) => [...prev, item]);
    } else {
      setLocalGeneral((prev) => prev.filter((i) => i[item_id] !== id));
      setLocalClassroom((prev) => [...prev, item]);
    }

    try {
      if (actionType === "add") {
        await onRemove(class_code, id);
      } else {
        await onAdd({ class_code, [item_id]: id });
      }
    } catch (error) {
      console.log(error);

      allertSetting({
        isActive: true,
        message: "Server sync failed. Rolling back...",
        isSuccess: false,
      });
      await fetchData();
    }
  };

  return (
    <div className={`action-form-overlay ${isActive ? "" : "inactive"}`}>
      <div className="action-form wide">
        <h2>MANAGE {type.toUpperCase()}</h2>
        <p>
          Class: <b>{class_code}</b>
        </p>

        <div className="input-container">
          <div className="input-field">
            <label>
              General {type}s ({localGeneral?.length})
            </label>
            <div className="student-box selected">
              {localGeneral?.map((item) => (
                <div
                  key={item[item_id]}
                  className="student-item"
                  onClick={() => handleAction(item, "remove")}
                >
                  <span>
                    {item[item_id]} - {item[item_show]}
                  </span>
                  <FaUserPlus className="add-icon" />
                </div>
              ))}
            </div>
          </div>

          <div className="input-field">
            <label>
              Classroom {type}s ({localClassroom?.length})
            </label>
            <div className="student-box">
              {localClassroom?.map((item) => (
                <div
                  key={item[item_id]}
                  className="student-item"
                  onClick={() => handleAction(item, "add")}
                >
                  <span>
                    {item[item_id]} - {item[item_show]}
                  </span>
                  <FaUserMinus className="remove-icon" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="modal-footer"
          style={{ marginTop: "20px", textAlign: "right" }}
        >
          <button className="btn-close-modal" onClick={handleClose}>
            Finish & Close
          </button>
        </div>
        <FaCircleXmark className="icon-close" onClick={handleClose} />
      </div>
    </div>
  );
};

export default ManageDataTransfer;

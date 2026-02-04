import { useState, useEffect } from "react";
import {
  FaCircleXmark,
  FaUserPlus,
  FaUserMinus,
  FaPaperPlane,
} from "react-icons/fa6";

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
    <div className={`overlay__action-component ${isActive ? "" : "inactive"}`}>
      <div className="form__action-component">
        <h2 className="title__action-component">MANAGE {type.toUpperCase()}</h2>
        <p className="description__action-component">
          Class: <b>{class_code}</b>
        </p>

        <div className="input-container__action-component">
          <div className="input-field__action-component">
            <label className="label__action-component">
              General {type}s ({localGeneral?.length})
            </label>
            <div className="box__action-component">
              {localGeneral?.map((item) => (
                <div
                  key={item[item_id]}
                  className="item__action-component"
                  onClick={() => handleAction(item, "remove")}
                >
                  <span>
                    {item[item_id]} - {item[item_show]}
                  </span>
                  <FaUserPlus className="add-icon__action-component" />
                </div>
              ))}
            </div>
          </div>

          <div className="input-field__action-component">
            <label className="label__action-component">
              Classroom {type}s ({localClassroom?.length})
            </label>
            <div className="box__action-component">
              {localClassroom?.map((item) => (
                <div
                  key={item[item_id]}
                  className="item__action-component"
                  onClick={() => handleAction(item, "add")}
                >
                  <span>
                    {item[item_id]} - {item[item_show]}
                  </span>
                  <FaUserMinus className="remove-icon__action-component" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          className="button__action-component"
          type="submit"
          onClick={handleClose}
        >
          <FaPaperPlane /> Finish & Close
        </button>

        <FaCircleXmark
          className="icon-close__action-component"
          onClick={handleClose}
        />
      </div>
    </div>
  );
};

export default ManageDataTransfer;

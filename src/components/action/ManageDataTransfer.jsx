import { useState, useEffect } from "react";
import { FaPaperPlane, FaSquarePlus, FaCircleMinus } from "react-icons/fa6";

const ManageDataTransfer = ({
  title = "",
  parent_id = "",
  item_id = "",
  item_show = "",
  inBoxItems = [],
  outBoxItems = [],
  onClose,
  onAdd,
  onRemove,
  allertSetting,
  refreshData,
}) => {
  const [outBox, setOutBox] = useState([]);
  const [inBox, setInBox] = useState([]);
  const [isChange, setIsChange] = useState(false);

  useEffect(() => {
    setOutBox(outBoxItems);
    setInBox(inBoxItems);
  }, [outBoxItems, inBoxItems]);

  const handleClose = async () => {
    isChange ? await refreshData() : null;
    onClose();
  };

  const handleAction = async (item, actionType) => {
    setIsChange(true);
    const id = item[item_id];

    if (actionType === "add") {
      setOutBox((prev) => prev.filter((i) => i[item_id] !== id));
      setInBox((prev) => [...prev, item]);
    } else {
      setInBox((prev) => prev.filter((i) => i[item_id] !== id));
      setOutBox((prev) => [...prev, item]);
    }

    try {
      if (actionType === "add") {
        await onAdd(parent_id, id);
      } else {
        await onRemove(parent_id, id);
      }
    } catch (error) {
      console.log(error);

      allertSetting({
        isActive: true,
        message: "Server sync failed. Rolling back...",
        isSuccess: false,
      });
      await refreshData();
    }
  };

  return (
    <div className="manage-data__action-component">
      <h2 className="title__action-component">MANAGE {title.toUpperCase()}</h2>
      <p className="description__action-component">
        ID: <b>{parent_id}</b>
      </p>

      <div className="input-container__action-component">
        <div className="input-field__action-component">
          <label className="label__action-component">
            General {title}s ({outBox?.length})
          </label>
          <div className="box__action-component">
            {outBox?.map((item) => (
              <div
                key={item[item_id]}
                className="item__action-component"
                onClick={() => handleAction(item, "add")}
              >
                <span>
                  {item[item_id]} - {item[item_show]}
                </span>
                <FaSquarePlus className="add-icon__action-component" />
              </div>
            ))}
          </div>
        </div>

        <div className="input-field__action-component">
          <label className="label__action-component">
            Classroom {title}s ({inBox?.length})
          </label>
          <div className="box__action-component">
            {inBox?.map((item) => (
              <div
                key={item[item_id]}
                className="item__action-component"
                onClick={() => handleAction(item, "remove")}
              >
                <span>
                  {item[item_id]} - {item[item_show]}
                </span>
                <FaCircleMinus className="remove-icon__action-component" />
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
        <FaPaperPlane /> Finish
      </button>
    </div>
  );
};

export default ManageDataTransfer;

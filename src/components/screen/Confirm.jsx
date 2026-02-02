import { FaCheck, FaTimes } from "react-icons/fa";

const Confirm = ({ confirmSetting }) => {
  if (!confirmSetting) return null;

  const { isActive, title, message, onConfirm, onCancel } = confirmSetting;

  if (!isActive) return null;

  return (
    <div className="confirm-overlay">
      <div className="box">
        <h3 className="title">{title}</h3>
        <div className="message">{message}</div>

        <div className="actions">
          <button title="Cancel" className="button-cancel" onClick={onCancel}>
            <FaTimes />
            No
          </button>
          <button
            title="Confirm"
            className="button-confirm"
            onClick={onConfirm}
          >
            <FaCheck />
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirm;

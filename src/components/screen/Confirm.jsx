import { FaCheck, FaTimes } from "react-icons/fa";

const Confirm = ({ confirmSetting }) => {
  if (!confirmSetting) return null;

  const { isActive, title, message, onConfirm, onCancel } = confirmSetting;

  if (!isActive) return null;

  return (
    <div className="overlay__screen-component">
      <div className="box__screen-component">
        <h3 className="title__screen-component">{title}</h3>
        <div className="message__screen-component">{message}</div>

        <div className="actions__screen-component">
          <button
            title="Cancel"
            className="button-danger__screen-component"
            onClick={onCancel}
          >
            <FaTimes />
            No
          </button>
          <button
            title="Confirm"
            className="button-save__screen-component"
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

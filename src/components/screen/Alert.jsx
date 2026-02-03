import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";
import "./screen.css";

const Alert = ({ alertSetting, onClose }) => {
  if (!alertSetting) return null;

  const { isActive, message, isSuccess = false } = alertSetting;

  if (!isActive) return null;

  const parseMessage = (msg) => {
    if (typeof msg === "string") return msg;
    if (typeof msg === "object" && msg !== null) {
      return msg.message || msg.error || JSON.stringify(msg);
    }
    return "Terjadi kesalahan yang tidak diketahui";
  };

  return (
    <div className="overlay__screen-component">
      <div className="box__screen-component">
        <div className="message__screen-component">{parseMessage(message)}</div>
        <button
          className={`button-${
            isSuccess ? "save" : "danger"
          }__screen-component`}
          onClick={onClose}
          title="Confirm"
        >
          {isSuccess ? <FaCircleCheck /> : <FaCircleExclamation />} OK
        </button>
      </div>
    </div>
  );
};

export default Alert;

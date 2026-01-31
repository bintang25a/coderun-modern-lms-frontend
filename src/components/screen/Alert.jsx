import "./screen.css";

const Alert = ({ isActive, message, onClose }) => {
  if (!isActive) return null;

  const parseMessage = (msg) => {
    if (typeof msg === "string") return msg;
    if (typeof msg === "object" && msg !== null) {
      return msg.message || msg.error || JSON.stringify(msg);
    }
    return "Terjadi kesalahan yang tidak diketahui";
  };

  return (
    <div className="alert-overlay">
      <div className="box">
        <div className="message">{parseMessage(message)}</div>
        <button className="button" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default Alert;

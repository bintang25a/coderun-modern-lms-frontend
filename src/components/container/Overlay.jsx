import { FaCircleXmark } from "react-icons/fa6";

const Overlay = ({ isActive, onClose, children }) => {
  return (
    <div
      className={`overlay__container-component ${isActive ? "" : "inactive"}`}
    >
      <div className="overlay-box__container-component">
        {children}

        <FaCircleXmark
          className="icon-close__container-component"
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default Overlay;

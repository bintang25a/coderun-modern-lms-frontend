import { useRef } from "react";
import { FaCircleXmark } from "react-icons/fa6";

const Toolbar = ({ id = 0, isCenter = false, onClose, children }) => {
  const divRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const storage = localStorage.getItem(`toolbar-${id}Position`);
  const startPoint = storage ? JSON.parse(storage) : { x: 100, y: 100 };

  const onMouseMove = (e) => {
    if (!divRef.current) return;

    const x = e.clientX - offset.current.x;
    const y = e.clientY - offset.current.y;

    const xy = { x, y };
    if (!isCenter) {
      localStorage.setItem(`toolbar-${id}Position`, JSON.stringify(xy));
    }

    divRef.current.style.left = `${x}px`;
    divRef.current.style.top = `${y}px`;

    divRef.current.style.transform = "none";
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "default";
  };

  const onMouseDown = (e) => {
    const rect = divRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "grabbing";
  };

  return (
    <div
      ref={divRef}
      onMouseDown={onMouseDown}
      className="toolbar__container-component"
      style={
        isCenter || !storage
          ? {
              left: `50%`,
              top: `50%`,
              transform: "translate(-50%, -50%)",
              zIndex: `${10000 + id}`,
            }
          : {
              left: `${startPoint?.x}px`,
              top: `${startPoint?.y}px`,
              zIndex: `${10000 + id}`,
            }
      }
    >
      {children}

      {onClose ? (
        <FaCircleXmark
          className="icon-close__container-component"
          onClick={onClose}
        />
      ) : null}
    </div>
  );
};

export default Toolbar;

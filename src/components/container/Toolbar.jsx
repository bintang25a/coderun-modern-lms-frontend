import { useRef } from "react";
import { FaCircleXmark } from "react-icons/fa6";

const Toolbar = ({
  id = 0,
  isCenter = false,
  isResize = false,
  onClose,
  children,
}) => {
  const divRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  const storagePosition = localStorage.getItem(`toolbar-${id}Position`);
  const startPoint = storagePosition
    ? JSON.parse(storagePosition)
    : { x: 100, y: 100 };

  const storageSize = localStorage.getItem(`toolbar-${id}Size`);
  const startSize = storageSize ? JSON.parse(storageSize) : { w: 100, h: 100 };

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

  const onMouseDown = (e) => {
    if (e.target.classList.contains("resizer")) return;

    const rect = divRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "grabbing";
  };

  const onResizeMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();

    const newWidth = e.clientX - rect.left;
    const newHeight = e.clientY - rect.top;

    divRef.current.style.width = `${newWidth}px`;
    divRef.current.style.height = `${newHeight}px`;

    localStorage.setItem(
      `toolbar-${id}Size`,
      JSON.stringify({ w: newWidth, h: newHeight })
    );
  };

  const onResizeMouseDown = (e) => {
    e.stopPropagation(); // Stop event agar tidak memicu onMouseDown (drag)
    document.addEventListener("mousemove", onResizeMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mousemove", onResizeMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "default";
  };

  return (
    <div
      ref={divRef}
      onMouseDown={onMouseDown}
      className="toolbar__container-component"
      style={{
        left: isCenter || !storagePosition ? "50%" : `${startPoint?.x}px`,
        top: isCenter || !storagePosition ? "50%" : `${startPoint?.y}px`,
        width: isResize ? `${startSize?.w}px` : "fit-content",
        height: isResize ? `${startSize?.h}px` : "fit-content",
        transform: isCenter || !storagePosition ? "translate(-50%, -50%)" : "",
        zIndex: `${10000 + id}`,
        minWidth: isResize ? "var(--px-256)" : "fit-content",
        minHeight: isResize ? "var(--px-256)" : "fit-content",
      }}
    >
      {children}

      {isResize ? (
        <div
          onMouseDown={onResizeMouseDown}
          className="toolbar-resizer__container-component"
        />
      ) : null}

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

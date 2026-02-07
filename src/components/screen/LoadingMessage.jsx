import "../component.css";
import { useEffect, useRef } from "react";

const LoadingMessage = ({ loadingSetting }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [loadingSetting?.messages]);

  if (!loadingSetting) return null;

  const { isActive, messages } = loadingSetting;

  if (!isActive) return null;

  return (
    <div className="overlay__screen-component loading">
      <div
        className="box__screen-component"
        style={{ maxHeight: "80vh", display: "flex", flexDirection: "column" }}
      >
        <div className="spinner-circle__screen-component"></div>
        <div className="message-container__screen-component" ref={scrollRef}>
          {messages?.length > 0 ? (
            messages.map((text, index) => (
              <p key={index} className="message__screen-component">
                {text}
              </p>
            ))
          ) : (
            <p className="message__screen-component">
              Loading data, please wait...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;

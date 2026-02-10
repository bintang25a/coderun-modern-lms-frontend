import { useState } from "react";
import { AiOutlineFontSize } from "react-icons/ai";
import { FaCode, FaRotate } from "react-icons/fa6";

const CodeToolbar = ({
  formData,
  setFormData,
  runCode,
  runExample,
  fontSize,
}) => {
  const [isVertical, setIsVertical] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "timeLimit") {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <div className={`toolbar__public-page ${isVertical ? "vertical" : ""}`}>
      <div
        title="Rotate"
        className="toolbar-item__public-page"
        onClick={() => setIsVertical(!isVertical)}
      >
        <FaRotate className="icon__public-page" />
      </div>
      <select
        className="toolbar-item__public-page"
        name="language"
        id="language"
        value={formData?.language}
        onChange={handleChange}
      >
        <option value="">Lang</option>
        <option value="c">C</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
        <option value="python">Python</option>
      </select>
      <select
        className="toolbar-item__public-page"
        name="timeLimit"
        id="timeLimit"
        value={formData?.timeLimit}
        onChange={handleChange}
      >
        <option value="500">0.5s</option>
        <option value="1000">1s</option>
        <option value="2000">2s</option>
        <option value="5000">5s</option>
        <option value="10000">10s</option>
      </select>
      <button
        className="toolbar-item__public-page"
        onClick={runCode}
        disabled={formData?.language === "pdf"}
      >
        <FaCode />
        Run Code
      </button>
      <button
        className="toolbar-item__public-page"
        onClick={() => runExample()}
        disabled={formData?.language === "pdf"}
      >
        <FaCode />
        Run Example
      </button>
      <button
        title="Font Size"
        className="toolbar-item__public-page button__public-page"
        onClick={fontSize}
      >
        <AiOutlineFontSize />
      </button>
    </div>
  );
};

export default CodeToolbar;

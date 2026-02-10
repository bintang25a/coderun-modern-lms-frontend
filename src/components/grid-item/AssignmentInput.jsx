import { useState } from "react";
import { FaFileCode, FaPaperPlane } from "react-icons/fa6";

const AssignmentInput = ({
  class_code,
  refreshData,
  switchLoading,
  setAllertSetting,
  createAssignment,
  span = { row: 3, col: 2 },
}) => {
  const initialForm = {
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    support_link: "",
    overtime: false,
  };

  const [formData, setFormData] = useState(initialForm);
  const [fileSelected, setFileSelected] = useState(false);

  const handleChange = (e) => {
    const { files, name, value } = e.target;

    if (name === "answer") {
      setFileSelected(files[0]?.name);

      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    switchLoading(true);

    const hasFile = Object.values(formData).some(
      (value) => value instanceof File
    );

    let payload;

    if (hasFile) {
      payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          payload.append(key, value);
        }
      });
    } else {
      payload = formData;
    }
    try {
      await createAssignment(class_code, payload);

      setAllertSetting({
        isActive: true,
        message: `Create assignment success`,
        isSuccess: true,
      });

      setFormData(initialForm);
      setFileSelected("");

      await refreshData();
    } catch (error) {
      setAllertSetting({
        isActive: true,
        message: error,
        isSuccess: false,
      });
    } finally {
      switchLoading(false);
    }
  };

  return (
    <div
      className="assignments-left-content__public-page"
      style={{ gridRow: `span ${span?.row}`, gridColumn: `span ${span?.col}` }}
    >
      <input
        type="text"
        name="title"
        id="title"
        placeholder="Assignment title"
        className="input__public-page title__public-page"
        value={formData?.title}
        onChange={handleChange}
      />
      <textarea
        name="description"
        id="description"
        placeholder="Assignment description"
        className="textarea__public-page description__public-page"
        value={formData?.description}
        onChange={handleChange}
      />
      <div className="date__public-page">
        <div className="date-item__public-page">
          <label className="label__public-page" htmlFor="startAt">
            Start Date:
          </label>
          <input
            type="date"
            name="startAt"
            id="startAt"
            className=" input__public-page"
            value={formData?.startAt}
            onChange={handleChange}
          />
        </div>
        <div className="date-item__public-page">
          <label className="label__public-page" htmlFor="endAt">
            End Date:
          </label>
          <input
            type="date"
            name="endAt"
            id="endAt"
            className="input__public-page"
            value={formData?.endAt}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="support-link__public-page">
        <label className="label__public-page" htmlFor="support_link">
          Place suport link (multiple link? separate with space)
        </label>
        <input
          type="text"
          name="support_link"
          id="support_link"
          placeholder="Input link here"
          className="input__public-page"
          value={formData?.support_link}
          onChange={handleChange}
        />
      </div>
      <div className="toolbar__public-page">
        <label
          className="toolbar-item__public-page label__public-page"
          htmlFor="answer"
        >
          {!fileSelected ? (
            <>
              <FaFileCode /> Choose Answer key
            </>
          ) : (
            <>{fileSelected}</>
          )}
          <input
            type="file"
            name="answer"
            id="answer"
            className="input__public-page"
            onChange={handleChange}
          />
        </label>
        <button
          className="toolbar-item__public-page button__public-page"
          onClick={() =>
            setFormData({
              ...formData,
              overtime: !formData?.overtime,
            })
          }
        >
          Overtime: {formData?.overtime ? "Allowed" : "Disallowed"}
        </button>
        <button
          className="toolbar-item__public-page button__public-page"
          onClick={handleSubmit}
          disabled={!class_code}
        >
          <FaPaperPlane /> Submit Assignment
        </button>
      </div>
    </div>
  );
};

export default AssignmentInput;

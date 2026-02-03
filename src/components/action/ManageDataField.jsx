import { useState } from "react";
import { FaCircleXmark, FaPaperPlane } from "react-icons/fa6";

const ManageDataField = ({
  isActive = false,
  isEdit = false,
  type = "",
  item_id = "",
  item = {},
  fields = [],
  onClose,
  onSubmit,
  loadingSetting,
  allertSetting,
  fetchData,
}) => {
  const [formData, setFormData] = useState(item);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    loadingSetting(true);

    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        payload.append(key, formData[key]);
      }
    });

    try {
      console.log(payload);
      console.log(formData);
      isEdit ? await onSubmit(item[item_id], payload) : await onSubmit(payload);

      onClose();
      allertSetting({
        isActive: true,
        message: `${isEdit ? "Update" : "Create"} success`,
        isSuccess: true,
      });
      await fetchData();
    } catch (error) {
      allertSetting({
        isActive: true,
        message: error,
        isSuccess: false,
      });
    } finally {
      loadingSetting(false);
    }
  };

  return (
    <div className={`action-form-overlay ${isActive ? "" : "inactive"}`}>
      <div className="action-form">
        <h2>
          {isEdit ? `EDIT ${type.toUpperCase()}` : `ADD ${type.toUpperCase()}`}
        </h2>

        <div className="input-container">
          {fields.map((field) => (
            <div className="input-field" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>

              {field.type === "select" ? (
                <select
                  name={field.name}
                  id={field.name}
                  onChange={handleChange}
                  value={formData[field.name] || ""}
                  disabled={isEdit && field.disabledOnEdit}
                >
                  <option value="">Choose {field.label}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.name}
                  id={field.name}
                  placeholder={field.placeholder}
                  {...(field.type !== "file" && {
                    value: formData[field.name] || "",
                  })}
                  onChange={handleChange}
                  disabled={isEdit && field.disabledOnEdit}
                  autoComplete="off"
                />
              )}
            </div>
          ))}
        </div>

        <button type="submit" onClick={handleSubmit}>
          <FaPaperPlane /> Submit
        </button>

        <FaCircleXmark className="icon-close" onClick={onClose} />
      </div>
    </div>
  );
};

export default ManageDataField;

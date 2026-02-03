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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log(formData);
    loadingSetting(true);
    try {
      isEdit
        ? await onSubmit(item[item_id], formData)
        : await onSubmit(formData);

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
        <h2>{isEdit ? `EDIT ${type}` : `ADD ${type}`}</h2>

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
                  onChange={handleChange}
                  value={formData[field.name] || ""}
                  disabled={isEdit && field.disabledOnEdit}
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

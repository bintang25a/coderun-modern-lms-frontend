import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa6";
import { FaChevronCircleDown } from "react-icons/fa";
import "../component.css";

const ManageDataField = ({
  title = "Input title",
  message = "Leave message",
  item_id = "",
  isEdit = false,
  isView = false,
  isVertical = false,
  item = {},
  fields = [],
  onClose = () => {},
  onSubmit = async () => {},
  loadingSetting = () => {},
  allertSetting = () => {},
  refreshData = async () => {},
}) => {
  const [formData, setFormData] = useState(isEdit || isView ? item : {});

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
      isEdit ? await onSubmit(item[item_id], payload) : await onSubmit(payload);

      onClose();
      allertSetting({
        isActive: true,
        message,
        isSuccess: true,
      });
      setFormData({});
      await refreshData();
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
    <div className="manage-data__action-component">
      <h2 className="title__action-component">{title}</h2>

      <div
        className={`input-container__action-component ${
          isVertical ? "vertical__action-component" : ""
        }`}
      >
        {fields.map((field) => (
          <div className="input-field__action-component" key={field.name}>
            <label className="label__action-component" htmlFor={field.name}>
              {field.label}
            </label>

            {field.type === "select" ? (
              <select
                className="select__action-component"
                name={field.name}
                id={field.name}
                onChange={handleChange}
                value={formData[field.name] || ""}
                disabled={
                  (isEdit && field.disabledOnEdit) ||
                  isView ||
                  field.disabledOnEdit
                }
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
                className="input__action-component"
                type={field.type || "text"}
                name={field.name}
                id={field.name}
                placeholder={field.placeholder}
                {...(field.type !== "file" && {
                  value: isView
                    ? field.type === "date"
                      ? field?.value?.split("T")[0]
                      : field?.value
                    : (field.type === "date"
                        ? formData[field.name]?.split("T")[0]
                        : formData[field.name]) || "",
                })}
                onChange={handleChange}
                disabled={(isEdit && field.disabledOnEdit) || isView}
                autoComplete={field.type == "password" ? "new-password" : "off"}
              />
            )}
          </div>
        ))}
      </div>

      <button
        className="button__action-component"
        type="submit"
        onClick={() => {
          isView ? onClose() : handleSubmit();
        }}
      >
        {isView ? (
          <>
            <FaChevronCircleDown /> Exit
          </>
        ) : (
          <>
            <FaPaperPlane /> Submit
          </>
        )}
      </button>
    </div>
  );
};

export default ManageDataField;

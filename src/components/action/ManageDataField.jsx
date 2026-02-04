import { useState } from "react";
import { FaCaretDown, FaCircleXmark, FaPaperPlane } from "react-icons/fa6";
import "../component.css";
import { FaChevronCircleDown } from "react-icons/fa";

const ManageDataField = ({
  isActive = false,
  isEdit = false,
  isView = false,
  type = "",
  class_code = "",
  item_id = "",
  item = {},
  fields = [],
  onClose,
  onSubmit,
  loadingSetting,
  allertSetting,
  fetchData,
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
      console.log(payload);
      isEdit ? await onSubmit(item[item_id], payload) : await onSubmit(payload);

      onClose();
      allertSetting({
        isActive: true,
        message: `${isEdit ? "Update" : "Create"} data success`,
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
    <div className={`overlay__action-component ${isActive ? "" : "inactive"}`}>
      <div className="form__action-component">
        <h2 className="title__action-component">
          {isView
            ? `VIEW ${type.toUpperCase()}`
            : isEdit
            ? `EDIT ${type.toUpperCase()}`
            : `ADD ${type.toUpperCase()}`}
        </h2>
        {class_code ? (
          <p className="description__action-component">
            Class: <b>{class_code}</b>
          </p>
        ) : null}

        <div className="input-container__action-component">
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
                  disabled={(isEdit && field.disabledOnEdit) || isView}
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
                  autoComplete={
                    field.type == "password" ? "new-password" : "off"
                  }
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

        <FaCircleXmark
          className="icon-close__action-component"
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default ManageDataField;

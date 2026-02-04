import React, { useState } from "react";
import Papa from "papaparse";
import { FaPaperPlane, FaCircleXmark } from "react-icons/fa6";

const AddDataCsv = ({
  isActive,
  onClose,
  onSubmit,
  loadingSetting,
  allertSetting,
  fetchData,
}) => {
  const [csvData, setCsvData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row) => ({
          uid: row[0],
          name: row[1],
          email: `${row[0]}@student.umj.ac.id`,
          phone_number: "0821",
          password: row[0],
          role: "Praktikan",
        }));

        setCsvData(data);
      },
    });
  };

  const handleSubmit = async () => {
    if (csvData.length === 0)
      return allertSetting({
        isActive: true,
        message: "Select CSV file",
        isSuccess: false,
      });

    loadingSetting(true);
    try {
      const promises = csvData.map((data) => onSubmit(data));
      const results = await Promise.allSettled(promises);
      const total = {
        success: results.filter((r) => r.status === "fulfilled").length,
        error: results.filter((r) => r.status === "rejected").length,
      };

      allertSetting({
        isActive: true,
        message: `Create data ${total.success} success, ${total.error} fail`,
        isSuccess: total.success > total.error,
      });

      onClose();
      fetchData();
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

  if (!isActive) return null;

  return (
    <div className={`overlay__action-component ${isActive ? "" : "inactive"}`}>
      <div className="form__action-component">
        <h2 className="title__action-component">UPLOAD DATA CSV</h2>

        <div className="input-container__action-component">
          <div className="input-field__action-component">
            <label>Choose CSV file</label>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </div>

          <div className="input-field__action-component">
            <label>Total:</label>
            <input type="text" disabled value={`${csvData?.length} Rows`} />
          </div>
        </div>

        <button className="button__action-component" onClick={handleSubmit}>
          <FaPaperPlane /> Submit
        </button>

        <FaCircleXmark
          className="icon-close__action-component"
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default AddDataCsv;

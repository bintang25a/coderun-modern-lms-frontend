import API from "../_api";
import message from "../_utilities/errorMessage";

export const runCode = async (data) => {
  try {
    const response = await API.post("/run", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const grade = async (data) => {
  try {
    const response = await API.post("/grade", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const autoGrade = async (data) => {
  try {
    const response = await API.post("/auto-grade", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const downloadSubmissions = async (assignment_number) => {
  try {
    const response = await API.get(`downloads/${assignment_number}`, {
      responseType: "blob",
    });

    const blob = response.data;

    const url = window.URL.createObjectURL(new Blob([blob]));

    const link = document.createElement("a");
    link.href = url;

    link.setAttribute("download", `Submissions_${assignment_number}.zip`);

    document.body.appendChild(link);
    link.click();
    link.remove();

    // 5. Bersihkan memori URL
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

import API from "../_api";
import message from "../_utilities/errorMessage";

export const getStudents = async () => {
  const { data: response } = await API.get("/students");
  return response.data;
};

export const createStudent = async (data) => {
  try {
    const response = await API.post("/students", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const updateStudent = async (classCode, uid, data) => {
  try {
    const response = await API.post(`students/${classCode}/${uid}`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const deleteStudent = async (classCode, uid) => {
  try {
    const response = await API.delete(`students/${classCode}/${uid}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

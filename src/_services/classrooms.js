import API from "../_api";
import message from "../_utilities/errorMessage";

export const getClassrooms = async () => {
  const { data: response } = await API.get("/classrooms");
  return response.data;
};

export const showClassroom = async (classCode) => {
  try {
    const { data: response } = await API.get(`/classrooms/${classCode}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const createClassroom = async (data) => {
  try {
    const response = await API.post("/classrooms", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const updateClassroom = async (classCode, data) => {
  try {
    const response = await API.post(`classrooms/${classCode}`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const deleteClassroom = async (classCode) => {
  try {
    const response = await API.delete(`classrooms/${classCode}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

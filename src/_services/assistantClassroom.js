import API from "../_api";
import message from "../_utilities/errorMessage";

export const getAssistants = async () => {
  const { data: response } = await API.get("/assistants");
  return response.data;
};

export const createAssistant = async (classCode, uid) => {
  try {
    const response = await API.post(`assistants/${classCode}/${uid}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const deleteAssistant = async (classCode, uid) => {
  try {
    const response = await API.delete(`assistants/${classCode}/${uid}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

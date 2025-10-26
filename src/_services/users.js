import API from "../_api";
import message from "../_utilities/errorMessage";

export const getMembers = async () => {
  const { data: response } = await API.get("/users");
  return response.data;
};

export const showMember = async (uid) => {
  try {
    const { data: response } = await API.get(`/users/${uid}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const createMember = async (data) => {
  try {
    const response = await API.post("/users", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const updateMember = async (uid, data) => {
  try {
    const response = await API.post(`users/${uid}`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const deleteMember = async (uid) => {
  try {
    const response = await API.delete(`users/${uid}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

import API from "../_api";
import message from "../_utilities/errorMessage";

export const getUsers = async () => {
  const { data: response } = await API.get("/users");
  return response.data;
};

export const showUser = async (uid) => {
  try {
    const { data: response } = await API.get(`/users/${uid}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const createUser = async (data) => {
  try {
    const response = await API.post("/users", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const updateUser = async (uid, data) => {
  try {
    const response = await API.patch(`users/${uid}`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const deleteUser = async (uid) => {
  try {
    const response = await API.delete(`users/${uid}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

import API from "../_api";
import message from "../_utilities/errorMessage";

export const getMembers = async () => {
   const { data } = await API.get("/users");
   return data.data;
};

export const showMember = async (id) => {
   try {
      const { data } = await API.get(`/users/${id}`);
      return data.data;
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

export const updateMember = async (id, data) => {
   try {
      const response = await API.post(`users/${id}`, data);
      return response.data;
   } catch (error) {
      console.log(error);
      throw message(error);
   }
};

export const deleteMember = async (id) => {
   try {
      const response = await API.delete(`users/${id}`);
      return response.data;
   } catch (error) {
      console.log(error);
      throw message(error);
   }
};

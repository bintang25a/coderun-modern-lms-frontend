import API from "../_api";
import message from "../_utilities/errorMessage";

export const getMaterials = async () => {
  const { data: response } = await API.get("/materials");
  return response.data;
};

export const showMaterial = async (material_number) => {
  try {
    const { data: response } = await API.get(`/materials/${material_number}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const fileMaterial = async (material_number) => {
  const res = await API.get(`/materials/${material_number}/file`, {
    responseType: "blob",
  });

  const blobUrl = URL.createObjectURL(res.data);
  return blobUrl;
};

export const createMaterial = async (data) => {
  try {
    const response = await API.post("/materials", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const updateMaterial = async (material_number, data) => {
  try {
    const response = await API.patch(`materials/${material_number}`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const deleteMaterial = async (material_number) => {
  try {
    const response = await API.delete(`materials/${material_number}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

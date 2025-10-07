import API from "../_api";
import message from "../_utilities/errorMessage";

// Fungsi Login
export const login = async (data) => {
   try {
      const response = await API.post("/login", data);
      const token = response.data.token;
      const user = response.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return token;
   } catch (error) {
      console.log(error);
      throw message(error);
   }
};

// Fungsi Validasi token
export const validateToken = async () => {
   if (typeof window === "undefined") return false;

   const token = localStorage.getItem("token");
   if (!token) return false;

   try {
      const response = await API.get("/validate-token", {
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });
      return response.data.success;
   } catch (error) {
      console.error(
         "Token tidak valid:",
         error.response?.data || error.message
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
   }
};
export const isAuthenticated = async () => {
   return await validateToken();
};

// Fungsi Logout
export const logout = async () => {
   try {
      const response = await API.post("/logout");

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      return response.data;
   } catch (error) {
      console.log(error);
      throw message(error);
   }
};

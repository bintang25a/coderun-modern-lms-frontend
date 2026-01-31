import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedRole from "./components/auth/ProtectedRole";

import Login from "./pages/auth/Login";
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />

        <Route
          element={
            <ProtectedRole allowedRoles={["Praktikan", "Asisten", "Admin"]} />
          }
        >
          <Route path="student" element={<StudentLayout />}></Route>
        </Route>

        <Route element={<ProtectedRole allowedRoles={["Asisten", "Admin"]} />}>
          <Route path="assistant" element={<StudentLayout />}></Route>
        </Route>

        <Route element={<ProtectedRole allowedRoles={["Admin"]} />}>
          <Route path="admin" element={<AdminLayout />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

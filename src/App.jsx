import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedRole from "./components/auth/ProtectedRole";

import Login from "./pages/auth/Login";

import AdminLayout from "./layouts/AdminLayout";
import UsersAdmin from "./pages/admin/users";
import ClassroomsAdmin from "./pages/admin/classrooms";
import MaterialsAdmin from "./pages/admin/materials";
import AssignmentsAdmin from "./pages/admin/assignments";
import SubmissionsAdmin from "./pages/admin/submissions";

import StudentLayout from "./layouts/StudentLayout";

import AssistantLayout from "./layouts/AssistantLayout";
import Classrooms from "./pages/public/classrooms";
import Assignments from "./pages/public/assignments";
import Classroom from "./pages/public/classrooms/show";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Login />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRole allowedRoles={["Praktikan", "Asisten", "Admin"]} />
          }
        >
          <Route path="student" element={<AssistantLayout />}>
            <Route index element={<main>Haii</main>} />
            <Route path="classrooms" element={<Classrooms />} />
            <Route path="classrooms/:id" element={<Classroom />} />
            <Route path="materials" element={<main></main>} />
            <Route path="materials/:id" element={<main></main>} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/:id" element={<Assignments />} />
          </Route>
        </Route>

        <Route element={<ProtectedRole allowedRoles={["Asisten", "Admin"]} />}>
          <Route path="assistant" element={<AssistantLayout />}>
            <Route index element={<main>Haii</main>} />
            <Route path="classrooms" element={<Classrooms />} />
            <Route path="classrooms/:class_code" element={<main></main>} />
            <Route path="assignments" element={<Assignments />} />
          </Route>
        </Route>

        <Route element={<ProtectedRole allowedRoles={["Admin"]} />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<main>Haii</main>} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="classrooms" element={<ClassroomsAdmin />} />
            <Route path="materials" element={<MaterialsAdmin />} />
            <Route path="assignments" element={<AssignmentsAdmin />} />
            <Route path="submissions" element={<SubmissionsAdmin />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

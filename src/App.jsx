import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedRole from "./components/auth/ProtectedRole";

import Login from "./pages/auth/Login";

import AdminLayout from "./layouts/AdminLayout";
import UsersAdmin from "./pages/admin/users";
import ClassroomsAdmin from "./pages/admin/classrooms";
import MaterialsAdmin from "./pages/admin/materials";
import AssignmentsAdmin from "./pages/admin/assignments";
import SubmissionsAdmin from "./pages/admin/submissions";

import PublicLayout from "./layouts/PublicLayout";
import Classrooms from "./pages/public/classrooms";
import Assignments from "./pages/public/assignments";
import Classroom from "./pages/public/classrooms/show";
import Assignment from "./pages/public/assignments/show";
import Submission from "./pages/public/submissions";
import Profile from "./pages/auth/Profile";
import AssignmentAsistant from "./pages/public/assignments-assistant/show";
import AssignmentsAssistant from "./pages/public/assignments-assistant";
import Materials from "./pages/public/materials";
import MaterialsAssistant from "./pages/public/material-assistant";
import Workspaces from "./pages/public/workspaces";

export default function App() {
  const role = localStorage.getItem("user")?.role;

  const userRole = (role) => {
    const fixRole =
      role === "Admin" ? "admin" : role === "Asisten" ? "assistant" : "student";

    return fixRole;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to={`/${userRole(role)}`} replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <PublicLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Profile />} />
        </Route>

        <Route
          element={
            <ProtectedRole allowedRoles={["Praktikan", "Asisten", "Admin"]} />
          }
        >
          <Route path="student" element={<PublicLayout />}>
            <Route index element={<main>On Progress</main>} />
            <Route path="classrooms" element={<Classrooms />} />
            <Route path="classrooms/:id" element={<Classroom />} />
            <Route path="materials" element={<main></main>} />
            <Route path="materials/:id" element={<main></main>} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/:id" element={<Assignment />} />
            <Route path="submissions" element={<Submission />} />
          </Route>
        </Route>

        <Route element={<ProtectedRole allowedRoles={["Asisten", "Admin"]} />}>
          <Route path="assistant" element={<PublicLayout />}>
            <Route index element={<main>On Progress</main>} />
            <Route path="classrooms" element={<Classrooms />} />
            <Route
              path="classrooms/materials"
              element={<MaterialsAssistant />}
            />
            <Route
              path="classrooms/assignments"
              element={<AssignmentsAssistant />}
            />
            <Route
              path="classrooms/assignments/:id"
              element={<AssignmentAsistant />}
            />
            <Route path="classrooms/:id" element={<Classroom />} />
            <Route path="workspaces" element={<Workspaces />} />
          </Route>
        </Route>

        <Route element={<ProtectedRole allowedRoles={["Admin"]} />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<main>On Progress</main>} />
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

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/public/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={ <HomePage/> } />
      </Routes>
    </BrowserRouter>
  );
}

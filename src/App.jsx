import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
          }
      />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

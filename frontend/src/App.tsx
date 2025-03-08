import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import RegisterPage from "./pages/RegisterPage";
import NavBar from "./components/Navbar";
import { useState } from "react";
import './styles/App.css';

function App() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <AuthProvider>
            <DndProvider backend={HTML5Backend}>
                <Router>
                    <NavBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    <div className="main-content">
                        <Routes>
                            <Route path="/" element={<Dashboard searchTerm={searchTerm} />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/dashboard" element={<Dashboard searchTerm={searchTerm} />} />
                        </Routes>
                    </div>
                </Router>
            </DndProvider>
        </AuthProvider>
    );
}

export default App;

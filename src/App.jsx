// App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Mahasiswa from "./pages/Mahasiswa";
import Event from "./pages/Event";
import Presensi from "./pages/Presensi";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Cek preferensi dari localStorage saat inisialisasi
        const savedMode = localStorage.getItem("theme");
        return savedMode === "dark";
    });

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    return (
        <Router>
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            <div className="container mx-auto p-4 min-h-screen">
                {" "}
                {/* Hapus kelas Tailwind untuk warna di sini */}
                <ErrorBoundary>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/mahasiswa" element={<Mahasiswa />} />
                        <Route path="/event" element={<Event />} />
                        <Route path="/presensi" element={<Presensi />} />
                    </Routes>
                </ErrorBoundary>
            </div>
        </Router>
    );
}

export default App;

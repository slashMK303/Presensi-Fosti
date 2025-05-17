import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Mahasiswa from "./pages/Mahasiswa";
import Event from "./pages/Event";
import Presensi from "./pages/Presensi";
import Navbar from "./components/Navbar";

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/mahasiswa" element={<Mahasiswa />} />
                    <Route path="/event" element={<Event />} />
                    <Route path="/presensi" element={<Presensi />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

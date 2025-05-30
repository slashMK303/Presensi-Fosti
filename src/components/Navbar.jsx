// Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar({ isDarkMode, toggleDarkMode }) {
    return (
        <nav
            style={{ backgroundColor: "var(--navbar-bg)" }}
            className="text-white p-4 shadow-md w-full"
        >
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">
                    FOSTI Presensi
                </Link>
                <div className="flex space-x-4 items-center">
                    <Link to="/mahasiswa" className="hover:underline">
                        Mahasiswa
                    </Link>
                    <Link to="/event" className="hover:underline">
                        Event
                    </Link>
                    <Link to="/presensi" className="hover:underline">
                        Presensi
                    </Link>
                    {/* Tombol Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full"
                        style={{
                            backgroundColor: isDarkMode ? "#2f855a" : "#48bb78",
                            color: "yellow",
                        }} // Warna ikon atau tombol
                        title={
                            isDarkMode
                                ? "Switch to Light Mode"
                                : "Switch to Dark Mode"
                        }
                    >
                        {isDarkMode ? (
                            // Icon Bulan (Contoh SVG)
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                            </svg>
                        ) : (
                            // Icon Matahari (Contoh SVG)
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 4a1 1 0 011 1v1a1 1 0 11-2 0V7a1 1 0 011-1zm-4 7a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4-4a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1zM4 10a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm10 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-6 4a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-2-4a1 1 0 011-1h1a1 1 0 110 2H7a1 1 0 01-1-1zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM2 10a8 8 0 1116 0 8 8 0 01-16 0z"></path>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
}

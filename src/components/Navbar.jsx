import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="bg-green-300 text-white p-4 shadow-md w-full">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">
                    FOSTI Presensi
                </Link>
                <div className="flex space-x-4">
                    <Link to="/mahasiswa" className="hover:underline">
                        Mahasiswa   
                    </Link>
                    <Link to="/event" className="hover:underline">
                        Event
                    </Link>
                    <Link to="/presensi" className="hover:underline">
                        Presensi
                    </Link>
                </div>
            </div>
        </nav>
    );
}

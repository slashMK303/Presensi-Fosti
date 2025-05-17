export default function Home() {
    return (
        <div className="text-center py-12">
            <h1 className="text-4xl font-bold mb-6">Sistem Presensi FOSTI</h1>
            <p className="text-xl mb-8">
                Selamat datang di sistem presensi berbasis RFID
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-6 border rounded-lg shadow hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-semibold mb-3">Mahasiswa</h2>
                    <p>Kelola data mahasiswa dan RFID UID</p>
                </div>

                <div className="p-6 border rounded-lg shadow hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-semibold mb-3">Event</h2>
                    <p>Buat dan kelola event presensi</p>
                </div>

                <div className="p-6 border rounded-lg shadow hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-semibold mb-3">Presensi</h2>
                    <p>Lakukan presensi masuk/keluar</p>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { getEvents, createEvent } from "../api";

export default function Event() {
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({
        judul: "",
        deskripsi: "",
        lokasi: "",
        tanggal: new Date().toISOString().split("T")[0], // Format YYYY-MM-DD
        waktu: "08:00", // Format HH:mm (default jam 8 pagi)
    });
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getEvents();

            if (Array.isArray(data) && data.length > 0) {
                // Urutkan dari yang terbaru
                const sortedEvents = data.sort(
                    (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
                );
                setEvents(sortedEvents);
            } else {
                setEvents([]);
                console.log("Tidak ada event ditemukan");
            }
        } catch (error) {
            console.error("Gagal memuat events:", error);
            setError("Gagal memuat data events");
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validasi
            if (!formData.judul?.trim()) throw new Error("Judul harus diisi");
            if (!formData.lokasi?.trim()) throw new Error("Lokasi harus diisi");

            // Gabungkan tanggal dan waktu
            const dateTime = new Date(`${formData.tanggal}T${formData.waktu}`);
            if (isNaN(dateTime.getTime()))
                throw new Error("Tanggal/waktu tidak valid");

            // Buat event baru
            const newEvent = {
                judul: formData.judul.trim(),
                deskripsi: formData.deskripsi.trim(),
                lokasi: formData.lokasi.trim(),
                tanggal: dateTime.toISOString(),
            };

            // Kirim ke API
            const createdEvent = await createEvent(newEvent);
            console.log("Event berhasil dibuat:", createdEvent); // Debug log

            // Perbarui state secara optimistik
            setEvents((prev) => [createdEvent, ...prev]);

            // 2. Refresh data dari server (untuk memastikan konsistensi)
            await fetchEvents();

            // Reset form
            setFormData({
                judul: "",
                deskripsi: "",
                lokasi: "",
                tanggal: new Date().toISOString().split("T")[0],
                waktu: "08:00",
            });
            setIsSubmitted(true);
            setTimeout(() => setIsSubmitted(false), 3000);
        } catch (error) {
            console.error("Gagal membuat event:", error);
            setError(error.message || "Gagal membuat event");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manajemen Event</h1>

            {/* Tampilkan pesan error jika ada */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-sm"
                    >
                        Tutup
                    </button>
                </div>
            )}

            {/* Tampilkan pesan sukses */}
            {isSubmitted && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                    Event berhasil dibuat!
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="mb-8 p-4 bg-gray-50 rounded"
            >
                <h2 className="text-xl font-semibold mb-4">Buat Event Baru</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">
                            Judul Event*
                        </label>
                        <input
                            type="text"
                            name="judul"
                            value={formData.judul}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">
                            Deskripsi
                        </label>
                        <textarea
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            rows="3"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-1">
                                Lokasi*
                            </label>
                            <input
                                type="text"
                                name="lokasi"
                                value={formData.lokasi}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">
                                Tanggal*
                            </label>
                            <input
                                type="date"
                                name="tanggal"
                                value={formData.tanggal}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">
                                Waktu*
                            </label>
                            <input
                                type="time"
                                name="waktu"
                                value={formData.waktu}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "Menyimpan..." : "Simpan Event"}
                </button>
            </form>

            <div>
                <h2 className="text-xl font-semibold mb-4">Daftar Event</h2>

                {loading && events.length === 0 ? (
                    <p>Memuat data...</p>
                ) : error ? (
                    <div className="p-4 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                ) : events.length > 0 ? (
                    <table className="w-full mt-4 border-collapse">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border">Judul</th>
                                <th className="px-4 py-2 border">Deskripsi</th>
                                <th className="px-4 py-2 border">Lokasi</th>
                                <th className="px-4 py-2 border">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr
                                    key={
                                        event._id ||
                                        `${event.judul}-${event.tanggal}`
                                    }
                                    className="border-b"
                                >
                                    <td className="px-4 py-2">{event.judul}</td>
                                    <td className="px-4 py-2">
                                        {event.deskripsi}
                                    </td>
                                    <td className="px-4 py-2">
                                        {event.lokasi}
                                    </td>
                                    <td className="px-4 py-2">
                                        {new Date(
                                            event.tanggal
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-4 border rounded text-center text-gray-500">
                        Belum ada event
                    </div>
                )}
            </div>
        </div>
    );
}

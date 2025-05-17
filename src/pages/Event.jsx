import { useState, useEffect } from "react";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../api";

export default function Event() {
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({
        judul: "",
        deskripsi: "",
        lokasi: "",
        tanggal: new Date().toISOString().split("T")[0],
        waktu: "08:00",
    });
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await getEvents();
            const data = Array.isArray(response)
                ? response
                : response?.data || [];

            const processedEvents = data.map((event) => ({
                _id: event._id || event.id,
                judul: event.judul || "-",
                deskripsi: event.deskripsi || "",
                lokasi: event.lokasi || "-",
                tanggal: event.tanggal || new Date().toISOString(), // Fallback tanggal
            }));

            setEvents(
                processedEvents.sort(
                    (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
                )
            );
        } catch (error) {
            console.error("Error fetching events:", error);
            setError("Gagal memuat data event");
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
            if (isNaN(dateTime.getTime())) {
                throw new Error("Tanggal/waktu tidak valid");
            }

            const eventData = {
                judul: formData.judul.trim(),
                deskripsi: formData.deskripsi.trim(),
                lokasi: formData.lokasi.trim(),
                tanggal: dateTime.toISOString(),
            };

            if (selectedId) {
                const updatedEvent = await updateEvent(selectedId, eventData);
                await fetchEvents(); // Force refresh data

                // Pastikan struktur data lengkap
                const normalizedEvent = {
                    _id: selectedId,
                    judul: updatedEvent.judul || eventData.judul,
                    deskripsi: updatedEvent.deskripsi || eventData.deskripsi,
                    lokasi: updatedEvent.lokasi || eventData.lokasi,
                    tanggal: updatedEvent.tanggal || eventData.tanggal,
                };

                setEvents(
                    events.map((event) =>
                        event._id === selectedId ? normalizedEvent : event
                    )
                );
            } else {
                const newEvent = await createEvent(eventData);
                setEvents([
                    {
                        ...newEvent,
                        _id: newEvent._id || Date.now(), // Fallback ID
                    },
                    ...events,
                ]);
            }

            // Reset form
            setFormData({
                judul: "",
                deskripsi: "",
                lokasi: "",
                tanggal: new Date().toISOString().split("T")[0],
                waktu: "08:00",
            });
            setSelectedId(null);
        } catch (error) {
            console.error("Gagal menyimpan event:", error);
            setError(error.message || "Gagal menyimpan event");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (event) => {
        const eventDate = new Date(event.tanggal);
        setFormData({
            judul: event.judul,
            deskripsi: event.deskripsi,
            lokasi: event.lokasi,
            tanggal: eventDate.toISOString().split("T")[0],
            waktu: eventDate.toTimeString().substring(0, 5), // HH:mm format
        });
        setSelectedId(event._id);
    };

    const handleDelete = async (eventId) => {
        if (!confirm("Yakin ingin menghapus event ini?")) return;

        try {
            setLoading(true);
            await deleteEvent(eventId);
            setEvents(events.filter((event) => event._id !== eventId));
            setSuccessMessage("Event berhasil dihapus!");
        } catch (error) {
            console.error("Gagal menghapus event:", error);
            setError("Gagal menghapus event");
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

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";

        try {
            const date = new Date(dateString);
            const options = {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true, // Ini yang mengaktifkan format AM/PM
            };

            // Format tanggal: 26/05/2025 08:00 AM
            return date
                .toLocaleDateString("en-US", options)
                .replace(",", "") // Hapus koma setelah tanggal
                .replace(/\//g, "/"); // Pastikan separator tanggal tetap /
        } catch {
            return "-";
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manajemen Event</h1>

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

            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                    {successMessage}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="mb-8 p-4 bg-gray-50 rounded"
            >
                <h2 className="text-xl font-semibold mb-4">
                    {selectedId ? "Edit Event" : "Buat Event Baru"}
                </h2>

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
                    {loading
                        ? "Menyimpan..."
                        : selectedId
                        ? "Update Event"
                        : "Simpan Event"}
                </button>

                {selectedId && (
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedId(null);
                            setFormData({
                                judul: "",
                                deskripsi: "",
                                lokasi: "",
                                tanggal: new Date().toISOString().split("T")[0],
                                waktu: "08:00",
                            });
                        }}
                        className="mt-4 ml-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        Batal
                    </button>
                )}
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
                    <div className="overflow-x-auto">
                        <table className="w-full mt-4 border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 border">Judul</th>
                                    <th className="px-4 py-2 border">
                                        Deskripsi
                                    </th>
                                    <th className="px-4 py-2 border">Lokasi</th>
                                    <th className="px-4 py-2 border">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-2 border">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr
                                        key={event._id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-2">
                                            {event.judul || "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {event.deskripsi || "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {event.lokasi || "-"}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {formatDateTime(event.tanggal)}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <button
                                                onClick={() =>
                                                    handleEdit(event)
                                                }
                                                className="text-blue-600 hover:underline mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(event._id)
                                                }
                                                className="text-red-600 hover:underline"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-4 border rounded text-center text-gray-500">
                        Belum ada event
                    </div>
                )}
            </div>
        </div>
    );
}

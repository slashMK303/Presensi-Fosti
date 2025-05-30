import { useState, useEffect } from "react";
import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
} from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [currentEventLogs, setCurrentEventLogs] = useState([]);
    const [currentEventTitle, setCurrentEventTitle] = useState("");

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
                tanggal: event.tanggal || new Date().toISOString(),
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
            if (!formData.judul?.trim()) throw new Error("Judul harus diisi");
            if (!formData.lokasi?.trim()) throw new Error("Lokasi harus diisi");

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
                await fetchEvents();

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
                        _id: newEvent._id || Date.now(),
                    },
                    ...events,
                ]);
            }

            setFormData({
                judul: "",
                deskripsi: "",
                lokasi: "",
                tanggal: new Date().toISOString().split("T")[0],
                waktu: "08:00",
            });
            setSelectedId(null);
            setSuccessMessage(
                `Event berhasil ${selectedId ? "diupdate" : "dibuat"}!`
            );
            setTimeout(() => setSuccessMessage(null), 3000);
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
            waktu: eventDate.toTimeString().substring(0, 5),
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
            setTimeout(() => setSuccessMessage(null), 3000);
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
                hour12: true,
            };
            return date
                .toLocaleDateString("en-US", options)
                .replace(",", "")
                .replace(/\//g, "/");
        } catch {
            return "-";
        }
    };

    const handleViewLogs = async (eventId, eventTitle) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getEventById(eventId);
            if (response.data && Array.isArray(response.data.logs)) {
                setCurrentEventLogs(response.data.logs);
                setCurrentEventTitle(eventTitle);
                setShowLogsModal(true);
            } else {
                throw new Error(
                    "Data log tidak ditemukan atau format tidak sesuai."
                );
            }
        } catch (err) {
            console.error("Gagal memuat log event:", err);
            setError(err.message || "Gagal memuat log event.");
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        const dataToExport = events.map((event) => ({
            Judul: event.judul,
            Deskripsi: event.deskripsi,
            Lokasi: event.lokasi,
            Tanggal: formatDateTime(event.tanggal),
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Events");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        saveAs(
            new Blob([excelBuffer], { type: "application/octet-stream" }),
            "data_event.xlsx"
        );
    };

    const exportLogsToExcel = (logs, eventTitle) => {
        const dataToExport = logs.map((logEntry) => ({
            Nama: logEntry.log?.kartu?.mahasiswa?.nama || "-",
            NIM: logEntry.log?.kartu?.mahasiswa?.nim || "-",
            Divisi: logEntry.log?.kartu?.mahasiswa?.divisi || "-",
            "UID Kartu": logEntry.log?.uid_kartu || "-",
            "Waktu Masuk": formatDateTime(logEntry.log?.tanggal_masuk),
            "Waktu Keluar": logEntry.log?.tanggal_keluar
                ? formatDateTime(logEntry.log.tanggal_keluar)
                : "Belum Keluar",
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            `Presensi - ${eventTitle}`
        );
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        saveAs(
            new Blob([excelBuffer], { type: "application/octet-stream" }),
            `presensi_${eventTitle.replace(/\s/g, "_")}.xlsx`
        );
    };

    return (
        <div>
            <h1
                className="text-2xl font-bold mb-6"
                style={{ color: "var(--text-color)" }}
            >
                Manajemen Event
            </h1>

            {error && (
                <div
                    className="mb-4 p-3 rounded"
                    style={{
                        backgroundColor: "var(--error-bg)",
                        color: "var(--error-text)",
                    }}
                >
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-sm"
                        style={{ backgroundColor: "var(--error-text)" }}
                    >
                        Tutup
                    </button>
                </div>
            )}

            {successMessage && (
                <div
                    className="mb-4 p-3 rounded"
                    style={{
                        backgroundColor: "var(--success-bg)",
                        color: "var(--success-text)",
                    }}
                >
                    {successMessage}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="mb-8 p-4 rounded"
                style={{
                    backgroundColor: "var(--card-bg)",
                    color: "var(--text-color)",
                }}
            >
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: "var(--text-color)" }}
                >
                    {selectedId ? "Edit Event" : "Buat Event Baru"}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label
                            className="block mb-1"
                            style={{ color: "var(--text-color)" }}
                        >
                            Judul Event*
                        </label>
                        <input
                            type="text"
                            name="judul"
                            value={formData.judul}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            style={{
                                borderColor: "var(--border-color)",
                                backgroundColor: "var(--background-color)",
                                color: "var(--text-color)",
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label
                            className="block mb-1"
                            style={{ color: "var(--text-color)" }}
                        >
                            Deskripsi
                        </label>
                        <textarea
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            rows="3"
                            style={{
                                borderColor: "var(--border-color)",
                                backgroundColor: "var(--background-color)",
                                color: "var(--text-color)",
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                className="block mb-1"
                                style={{ color: "var(--text-color)" }}
                            >
                                Lokasi*
                            </label>
                            <input
                                type="text"
                                name="lokasi"
                                value={formData.lokasi}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                                style={{
                                    borderColor: "var(--border-color)",
                                    backgroundColor: "var(--background-color)",
                                    color: "var(--text-color)",
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label
                                className="block mb-1"
                                style={{ color: "var(--text-color)" }}
                            >
                                Tanggal*
                            </label>
                            <input
                                type="date"
                                name="tanggal"
                                value={formData.tanggal}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                                style={{
                                    borderColor: "var(--border-color)",
                                    backgroundColor: "var(--background-color)",
                                    color: "var(--text-color)",
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label
                                className="block mb-1"
                                style={{ color: "var(--text-color)" }}
                            >
                                Waktu*
                            </label>
                            <input
                                type="time"
                                name="waktu"
                                value={formData.waktu}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                                style={{
                                    borderColor: "var(--border-color)",
                                    backgroundColor: "var(--background-color)",
                                    color: "var(--text-color)",
                                }}
                                required
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 px-4 py-2 rounded disabled:opacity-50"
                    style={{
                        backgroundColor: "var(--button-primary-bg)",
                        color: "white",
                    }}
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
                        className="mt-4 ml-2 px-4 py-2 rounded"
                        style={{
                            backgroundColor: "var(--button-secondary-bg)",
                            color: "white",
                        }}
                    >
                        Batal
                    </button>
                )}
            </form>

            <div>
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: "var(--text-color)" }}
                >
                    Daftar Event
                </h2>
                <button
                    onClick={exportToExcel}
                    className="mb-4 px-4 py-2 rounded"
                    style={{
                        backgroundColor: "var(--button-primary-bg)",
                        color: "white",
                    }}
                    disabled={events.length === 0}
                >
                    Export Daftar Event ke Excel
                </button>

                {loading && events.length === 0 ? (
                    <p style={{ color: "var(--text-color)" }}>Memuat data...</p>
                ) : error ? (
                    <div
                        className="p-4 rounded"
                        style={{
                            backgroundColor: "var(--error-bg)",
                            color: "var(--error-text)",
                        }}
                    >
                        {error}
                    </div>
                ) : events.length > 0 ? (
                    <div
                        className="overflow-x-auto"
                        style={{ border: `1px solid var(--border-color)` }}
                    >
                        <table
                            className="w-full border-collapse"
                            style={{
                                backgroundColor: "var(--background-color)",
                                color: "var(--text-color)",
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        backgroundColor: "var(--card-bg)",
                                    }}
                                >
                                    <th
                                        className="px-4 py-2 border"
                                        style={{
                                            borderColor: "var(--border-color)",
                                        }}
                                    >
                                        Judul
                                    </th>
                                    <th
                                        className="px-4 py-2 border"
                                        style={{
                                            borderColor: "var(--border-color)",
                                        }}
                                    >
                                        Deskripsi
                                    </th>
                                    <th
                                        className="px-4 py-2 border"
                                        style={{
                                            borderColor: "var(--border-color)",
                                        }}
                                    >
                                        Lokasi
                                    </th>
                                    <th
                                        className="px-4 py-2 border"
                                        style={{
                                            borderColor: "var(--border-color)",
                                        }}
                                    >
                                        Tanggal
                                    </th>
                                    <th
                                        className="px-4 py-2 border"
                                        style={{
                                            borderColor: "var(--border-color)",
                                        }}
                                    >
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr
                                        key={event._id}
                                        style={{
                                            borderBottom: `1px solid var(--border-color)`,
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                "var(--hover-bg)")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                "var(--background-color)")
                                        }
                                    >
                                        <td
                                            className="px-4 py-2 border"
                                            style={{
                                                borderColor:
                                                    "var(--border-color)",
                                            }}
                                        >
                                            {event.judul || "-"}
                                        </td>
                                        <td
                                            className="px-4 py-2 border"
                                            style={{
                                                borderColor:
                                                    "var(--border-color)",
                                            }}
                                        >
                                            {event.deskripsi || "-"}
                                        </td>
                                        <td
                                            className="px-4 py-2 border"
                                            style={{
                                                borderColor:
                                                    "var(--border-color)",
                                            }}
                                        >
                                            {event.lokasi || "-"}
                                        </td>
                                        <td
                                            className="px-4 py-2 whitespace-nowrap border"
                                            style={{
                                                borderColor:
                                                    "var(--border-color)",
                                            }}
                                        >
                                            {formatDateTime(event.tanggal)}
                                        </td>
                                        <td
                                            className="px-4 py-2 whitespace-nowrap border"
                                            style={{
                                                borderColor:
                                                    "var(--border-color)",
                                            }}
                                        >
                                            <button
                                                onClick={() =>
                                                    handleEdit(event)
                                                }
                                                className="mr-2"
                                                style={{
                                                    color: "var(--button-primary-bg)",
                                                    textDecoration: "underline",
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(event._id)
                                                }
                                                className="mr-2"
                                                style={{
                                                    color: "var(--error-text)",
                                                    textDecoration: "underline",
                                                }}
                                            >
                                                Hapus
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleViewLogs(
                                                        event._id,
                                                        event.judul
                                                    )
                                                }
                                                style={{
                                                    color: "var(--purple-text)",
                                                    textDecoration: "underline",
                                                }}
                                            >
                                                Lihat Absensi
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div
                        className="p-4 border rounded text-center"
                        style={{
                            borderColor: "var(--border-color)",
                            color: "var(--text-color)",
                        }}
                    >
                        Belum ada event
                    </div>
                )}
            </div>

            {/* Logs Modal */}
            {showLogsModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <div
                        className="rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
                        style={{
                            backgroundColor: "var(--card-bg)",
                            color: "var(--text-color)",
                        }}
                    >
                        <div
                            className="flex justify-between items-center mb-4 border-b pb-2"
                            style={{ borderColor: "var(--border-color)" }}
                        >
                            <h2
                                className="text-xl font-bold"
                                style={{ color: "var(--text-color)" }}
                            >
                                Daftar Absensi untuk "{currentEventTitle}"
                            </h2>
                            <button
                                onClick={() => setShowLogsModal(false)}
                                className="text-2xl font-bold"
                                style={{ color: "var(--text-color)" }}
                            >
                                &times;
                            </button>
                        </div>

                        {currentEventLogs.length > 0 && (
                            <button
                                onClick={() =>
                                    exportLogsToExcel(
                                        currentEventLogs,
                                        currentEventTitle
                                    )
                                }
                                className="mb-4 px-4 py-2 rounded"
                                style={{
                                    backgroundColor: "var(--button-primary-bg)",
                                    color: "white",
                                }}
                            >
                                Export Absensi ke Excel
                            </button>
                        )}

                        {currentEventLogs.length === 0 ? (
                            <p style={{ color: "var(--text-color)" }}>
                                Tidak ada mahasiswa yang melakukan absensi pada
                                event ini.
                            </p>
                        ) : (
                            <div
                                className="overflow-x-auto"
                                style={{
                                    border: `1px solid var(--border-color)`,
                                }}
                            >
                                <table
                                    className="min-w-full border"
                                    style={{
                                        backgroundColor:
                                            "var(--background-color)",
                                        color: "var(--text-color)",
                                    }}
                                >
                                    <thead>
                                        <tr
                                            style={{
                                                backgroundColor:
                                                    "var(--card-bg)",
                                            }}
                                        >
                                            <th
                                                className="py-2 px-4 border"
                                                style={{
                                                    borderColor:
                                                        "var(--border-color)",
                                                }}
                                            >
                                                Nama
                                            </th>
                                            <th
                                                className="py-2 px-4 border"
                                                style={{
                                                    borderColor:
                                                        "var(--border-color)",
                                                }}
                                            >
                                                NIM
                                            </th>
                                            <th
                                                className="py-2 px-4 border"
                                                style={{
                                                    borderColor:
                                                        "var(--border-color)",
                                                }}
                                            >
                                                Divisi
                                            </th>
                                            <th
                                                className="py-2 px-4 border"
                                                style={{
                                                    borderColor:
                                                        "var(--border-color)",
                                                }}
                                            >
                                                UID Kartu
                                            </th>
                                            <th
                                                className="py-2 px-4 border"
                                                style={{
                                                    borderColor:
                                                        "var(--border-color)",
                                                }}
                                            >
                                                Waktu Masuk
                                            </th>
                                            <th
                                                className="py-2 px-4 border"
                                                style={{
                                                    borderColor:
                                                        "var(--border-color)",
                                                }}
                                            >
                                                Waktu Keluar
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentEventLogs.map(
                                            (logEntry, index) => (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        borderBottom: `1px solid var(--border-color)`,
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.backgroundColor =
                                                            "var(--hover-bg)")
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.backgroundColor =
                                                            "var(--background-color)")
                                                    }
                                                >
                                                    <td
                                                        className="py-2 px-4 border"
                                                        style={{
                                                            borderColor:
                                                                "var(--border-color)",
                                                        }}
                                                    >
                                                        {logEntry.log?.kartu
                                                            ?.mahasiswa?.nama ||
                                                            "-"}
                                                    </td>
                                                    <td
                                                        className="py-2 px-4 border"
                                                        style={{
                                                            borderColor:
                                                                "var(--border-color)",
                                                        }}
                                                    >
                                                        {logEntry.log?.kartu
                                                            ?.mahasiswa?.nim ||
                                                            "-"}
                                                    </td>
                                                    <td
                                                        className="py-2 px-4 border"
                                                        style={{
                                                            borderColor:
                                                                "var(--border-color)",
                                                        }}
                                                    >
                                                        {logEntry.log?.kartu
                                                            ?.mahasiswa
                                                            ?.divisi || "-"}
                                                    </td>
                                                    <td
                                                        className="py-2 px-4 border"
                                                        style={{
                                                            borderColor:
                                                                "var(--border-color)",
                                                        }}
                                                    >
                                                        {logEntry.log
                                                            ?.uid_kartu || "-"}
                                                    </td>
                                                    <td
                                                        className="py-2 px-4 border whitespace-nowrap"
                                                        style={{
                                                            borderColor:
                                                                "var(--border-color)",
                                                        }}
                                                    >
                                                        {formatDateTime(
                                                            logEntry.log
                                                                ?.tanggal_masuk
                                                        )}
                                                    </td>
                                                    <td
                                                        className="py-2 px-4 border whitespace-nowrap"
                                                        style={{
                                                            borderColor:
                                                                "var(--border-color)",
                                                        }}
                                                    >
                                                        {logEntry.log
                                                            ?.tanggal_keluar
                                                            ? formatDateTime(
                                                                  logEntry.log
                                                                      .tanggal_keluar
                                                              )
                                                            : "Belum Keluar"}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="mt-4 text-right">
                            <button
                                onClick={() => setShowLogsModal(false)}
                                className="px-4 py-2 rounded"
                                style={{
                                    backgroundColor:
                                        "var(--button-secondary-bg)",
                                    color: "white",
                                }}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Mahasiswa.jsx
import { useState, useEffect, useCallback, useTransition } from "react";
import { getMahasiswa, createMahasiswa, deleteMahasiswa } from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Mahasiswa() {
    const [mahasiswa, setMahasiswa] = useState([]);
    const [formData, setFormData] = useState({
        nama: "",
        nim: "",
        divisi: "RISTEK",
        uid: "",
    });
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [serverErrors, setServerErrors] = useState({});

    const fetchMahasiswa = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMahasiswa();
            if (Array.isArray(data)) setMahasiswa(data);
            else throw new Error("Format data tidak valid dari server");
        } catch (error) {
            console.error("Gagal memuat data:", error);
            setError("Gagal memuat data mahasiswa");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMahasiswa();
    }, [fetchMahasiswa]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setServerErrors({});

        try {
            if (!formData.nim || !formData.nama || !formData.uid) {
                throw new Error("Harap isi semua field yang wajib diisi");
            }

            const method = selectedId ? "PUT" : "POST";
            const url = selectedId ? `/mahasiswa/${selectedId}` : "/mahasiswa";

            const response = await createMahasiswa(formData, method, url);

            startTransition(() => {
                fetchMahasiswa();
            });

            setIsSubmitted(true);
            setFormData({ nama: "", nim: "", divisi: "RISTEK", uid: "" });
            setSelectedId(null);
            setTimeout(() => setIsSubmitted(false), 3000);
        } catch (error) {
            console.error("Gagal menyimpan data:", error);
            if (
                error.response &&
                error.response.status === 422 &&
                error.response.data.errors
            ) {
                setServerErrors(error.response.data.errors);
            } else {
                setError(
                    error.response?.data?.message ||
                        error.message ||
                        "Terjadi kesalahan"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = useCallback((mhs) => {
        setFormData({
            nama: mhs.nama ?? "",
            nim: mhs.nim ?? "",
            divisi: mhs.divisi ?? "RISTEK",
            uid: mhs.kartu?.uid ?? "",
        });
        setSelectedId(mhs._id || mhs.id);
    }, []);

    const handleDelete = useCallback(
        async (id) => {
            if (!confirm("Yakin ingin menghapus data ini?")) return;
            setLoading(true);
            try {
                await deleteMahasiswa(id);
                startTransition(() => {
                    fetchMahasiswa();
                });
            } catch (error) {
                console.error("Gagal menghapus data:", error);
                setError("Gagal menghapus data mahasiswa");
            } finally {
                setLoading(false);
            }
        },
        [fetchMahasiswa]
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (serverErrors[name])
            setServerErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const exportToExcel = () => {
        const dataToExport = mahasiswa.map((mhs) => ({
            Nama: mhs.nama,
            NIM: mhs.nim,
            Divisi: mhs.divisi,
            UID: mhs.kartu?.uid,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Mahasiswa");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        saveAs(
            new Blob([excelBuffer], { type: "application/octet-stream" }),
            "data_mahasiswa.xlsx"
        );
    };

    return (
        <div>
            <h1
                className="text-2xl font-bold mb-6"
                style={{ color: "var(--text-color)" }}
            >
                Manajemen Mahasiswa
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
                        onClick={() => {
                            setError(null);
                            setServerErrors({});
                        }}
                        className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-sm"
                        style={{ backgroundColor: "var(--error-text)" }}
                    >
                        Tutup
                    </button>
                </div>
            )}

            {isSubmitted && (
                <div
                    className="mb-4 p-3 rounded"
                    style={{
                        backgroundColor: "var(--success-bg)",
                        color: "var(--success-text)",
                    }}
                >
                    Data mahasiswa berhasil disimpan!
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
                    {selectedId ? "Edit Mahasiswa" : "Tambah Mahasiswa Baru"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label
                            className="block mb-1"
                            style={{ color: "var(--text-color)" }}
                        >
                            Nama*
                        </label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded ${
                                serverErrors.nama ? "border-red-500" : ""
                            }`}
                            style={{
                                borderColor: "var(--border-color)",
                                backgroundColor: "var(--background-color)",
                                color: "var(--text-color)",
                            }}
                            required
                        />
                        {serverErrors.nama && (
                            <p
                                className="text-red-500 text-sm mt-1"
                                style={{ color: "var(--error-text)" }}
                            >
                                {serverErrors.nama}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            className="block mb-1"
                            style={{ color: "var(--text-color)" }}
                        >
                            NIM*
                        </label>
                        <input
                            type="text"
                            name="nim"
                            value={formData.nim}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded ${
                                serverErrors.nim ? "border-red-500" : ""
                            }`}
                            style={{
                                borderColor: "var(--border-color)",
                                backgroundColor: "var(--background-color)",
                                color: "var(--text-color)",
                            }}
                            required
                        />
                        {serverErrors.nim && (
                            <p
                                className="text-red-500 text-sm mt-1"
                                style={{ color: "var(--error-text)" }}
                            >
                                {serverErrors.nim}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            className="block mb-1"
                            style={{ color: "var(--text-color)" }}
                        >
                            Divisi*
                        </label>
                        <select
                            name="divisi"
                            value={formData.divisi}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded ${
                                serverErrors.divisi ? "border-red-500" : ""
                            }`}
                            style={{
                                borderColor: "var(--border-color)",
                                backgroundColor: "var(--background-color)",
                                color: "var(--text-color)",
                            }}
                            required
                        >
                            <option value="RISTEK">RISTEK</option>
                            <option value="HUBPUB">HUBPUB</option>
                            <option value="KEOR">KEOR</option>
                        </select>
                        {serverErrors.divisi && (
                            <p
                                className="text-red-500 text-sm mt-1"
                                style={{ color: "var(--error-text)" }}
                            >
                                {serverErrors.divisi}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            className="block mb-1"
                            style={{ color: "var(--text-color)" }}
                        >
                            UID Kartu RFID*
                        </label>
                        <input
                            type="text"
                            name="uid"
                            value={formData.uid}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded ${
                                serverErrors.uid ? "border-red-500" : ""
                            }`}
                            style={{
                                borderColor: "var(--border-color)",
                                backgroundColor: "var(--background-color)",
                                color: "var(--text-color)",
                            }}
                            required
                        />
                        {serverErrors.uid && (
                            <p
                                className="text-red-500 text-sm mt-1"
                                style={{ color: "var(--error-text)" }}
                            >
                                {serverErrors.uid}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || isPending}
                    className="mt-4 px-4 py-2 rounded disabled:opacity-50"
                    style={{
                        backgroundColor: "var(--button-primary-bg)",
                        color: "white",
                    }}
                >
                    {loading
                        ? "Menyimpan..."
                        : selectedId
                        ? "Update Mahasiswa"
                        : "Simpan Mahasiswa"}
                </button>
            </form>

            <div>
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: "var(--text-color)" }}
                >
                    Daftar Mahasiswa
                </h2>
                <button
                    onClick={exportToExcel}
                    className="mb-4 px-4 py-2 rounded"
                    style={{
                        backgroundColor: "var(--button-primary-bg)",
                        color: "white",
                    }}
                    disabled={mahasiswa.length === 0}
                >
                    Export ke Excel
                </button>
                {loading ? (
                    <p style={{ color: "var(--text-color)" }}>Memuat data...</p>
                ) : error ? (
                    <div
                        className="text-red-500"
                        style={{ color: "var(--error-text)" }}
                    >
                        {error}
                    </div>
                ) : mahasiswa.length === 0 ? (
                    <p style={{ color: "var(--text-color)" }}>
                        Tidak ada data mahasiswa
                    </p>
                ) : (
                    <div
                        className="overflow-x-auto"
                        style={{ border: `1px solid var(--border-color)` }}
                    >
                        <table
                            className="min-w-full border"
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
                                        className="py-2 px-4 border"
                                        style={{
                                            borderColor: "var(--border-color)",
                                        }}
                                    >
                                        Nama
                                    </th>
                                    <th
                                        className="py-2 px-4 border"
                                        style={{
                                            borderColor: "var(--border-color)",
                                        }}
                                    >
                                        NIM
                                    </th>
                                    <th
                                        className="py-2 px-4 border"
                                        style={{
                                            borderColor: "var(--border-color)",
                                        }}
                                    >
                                        Divisi
                                    </th>
                                    <th
                                        className="py-2 px-4 border"
                                        style={{
                                            borderColor: "var(--border-color)",
                                        }}
                                    >
                                        UID
                                    </th>
                                    <th
                                        className="py-2 px-4 border"
                                        style={{
                                            borderColor: "var(--border-color)",
                                        }}
                                    >
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {mahasiswa.map((mhs) => (
                                    <tr
                                        key={mhs.id || mhs._id}
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
                                            {mhs.nama}
                                        </td>
                                        <td
                                            className="py-2 px-4 border"
                                            style={{
                                                borderColor:
                                                    "var(--border-color)",
                                            }}
                                        >
                                            {mhs.nim}
                                        </td>
                                        <td
                                            className="py-2 px-4 border"
                                            style={{
                                                borderColor:
                                                    "var(--border-color)",
                                            }}
                                        >
                                            {mhs.divisi}
                                        </td>
                                        <td
                                            className="py-2 px-4 border"
                                            style={{
                                                borderColor:
                                                    "var(--border-color)",
                                            }}
                                        >
                                            {mhs.kartu?.uid}
                                        </td>
                                        <td
                                            className="py-2 px-4 border space-x-2"
                                            style={{
                                                borderColor:
                                                    "var(--border-color)",
                                            }}
                                        >
                                            <button
                                                onClick={() => handleEdit(mhs)}
                                                style={{
                                                    color: "var(--button-primary-bg)",
                                                    textDecoration: "underline",
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        mhs._id || mhs.id
                                                    )
                                                }
                                                style={{
                                                    color: "var(--error-text)",
                                                    textDecoration: "underline",
                                                }}
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

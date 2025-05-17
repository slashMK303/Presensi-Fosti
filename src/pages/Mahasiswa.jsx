import { useState, useEffect, useCallback, useTransition } from "react";
import { getMahasiswa, createMahasiswa, deleteMahasiswa } from "../api";

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

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manajemen Mahasiswa</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                    <button
                        onClick={() => {
                            setError(null);
                            setServerErrors({});
                        }}
                        className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-sm"
                    >
                        Tutup
                    </button>
                </div>
            )}

            {isSubmitted && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                    Data mahasiswa berhasil disimpan!
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="mb-8 p-4 bg-gray-50 rounded"
            >
                <h2 className="text-xl font-semibold mb-4">
                    {selectedId ? "Edit Mahasiswa" : "Tambah Mahasiswa Baru"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-1">
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
                            required
                        />
                        {serverErrors.nama && (
                            <p className="text-red-500 text-sm mt-1">
                                {serverErrors.nama}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">NIM*</label>
                        <input
                            type="text"
                            name="nim"
                            value={formData.nim}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded ${
                                serverErrors.nim ? "border-red-500" : ""
                            }`}
                            required
                        />
                        {serverErrors.nim && (
                            <p className="text-red-500 text-sm mt-1">
                                {serverErrors.nim}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">
                            Divisi*
                        </label>
                        <select
                            name="divisi"
                            value={formData.divisi}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded ${
                                serverErrors.divisi ? "border-red-500" : ""
                            }`}
                            required
                        >
                            <option value="RISTEK">RISTEK</option>
                            <option value="HUBPUB">HUBPUB</option>
                            <option value="KEOR">KEOR</option>
                        </select>
                        {serverErrors.divisi && (
                            <p className="text-red-500 text-sm mt-1">
                                {serverErrors.divisi}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">
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
                            required
                        />
                        {serverErrors.uid && (
                            <p className="text-red-500 text-sm mt-1">
                                {serverErrors.uid}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || isPending}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading
                        ? "Menyimpan..."
                        : selectedId
                        ? "Update Mahasiswa"
                        : "Simpan Mahasiswa"}
                </button>
            </form>

            <div>
                <h2 className="text-xl font-semibold mb-4">Daftar Mahasiswa</h2>
                {loading ? (
                    <p>Memuat data...</p>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : mahasiswa.length === 0 ? (
                    <p>Tidak ada data mahasiswa</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 border">Nama</th>
                                    <th className="py-2 px-4 border">NIM</th>
                                    <th className="py-2 px-4 border">Divisi</th>
                                    <th className="py-2 px-4 border">UID</th>
                                    <th className="py-2 px-4 border">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mahasiswa.map((mhs) => (
                                    <tr
                                        key={mhs.id || mhs._id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="py-2 px-4 border">
                                            {mhs.nama}
                                        </td>
                                        <td className="py-2 px-4 border">
                                            {mhs.nim}
                                        </td>
                                        <td className="py-2 px-4 border">
                                            {mhs.divisi}
                                        </td>
                                        <td className="py-2 px-4 border">
                                            {mhs.kartu?.uid}
                                        </td>
                                        <td className="py-2 px-4 border space-x-2">
                                            <button
                                                onClick={() => handleEdit(mhs)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        mhs._id || mhs.id
                                                    )
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
                )}
            </div>
        </div>
    );
}

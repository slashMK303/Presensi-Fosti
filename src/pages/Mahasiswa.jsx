import { useState, useEffect } from "react";
import { getMahasiswa, createMahasiswa } from "../api";

export default function Mahasiswa() {
    const [mahasiswa, setMahasiswa] = useState([]);
    const [formData, setFormData] = useState({
        nama: "",
        nim: "",
        divisi: "RISTEK",
        uid: "",
    });
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [serverErrors, setServerErrors] = useState({});

    useEffect(() => {
        fetchMahasiswa();
    }, []);

    const fetchMahasiswa = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMahasiswa();
            if (Array.isArray(data)) {
                setMahasiswa(data);
            } else {
                throw new Error("Format data tidak valid dari server");
            }
        } catch (error) {
            console.error("Gagal memuat data:", error);
            setError("Gagal memuat data mahasiswa");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setServerErrors({});

        try {
            // Validasi client-side sederhana
            if (!formData.nim || !formData.nama || !formData.uid) {
                throw new Error("Harap isi semua field yang wajib diisi");
            }

            const response = await createMahasiswa(formData);

            // Jika berhasil
            await fetchMahasiswa();
            setIsSubmitted(true);
            setFormData({ nama: "", nim: "", divisi: "RISTEK", uid: "" });
            setTimeout(() => setIsSubmitted(false), 3000);
        } catch (error) {
            console.error("Gagal menyimpan data:", error);

            // Tangani error response dari server
            if (error.response) {
                // Error validasi dari server (422)
                if (
                    error.response.status === 422 &&
                    error.response.data.errors
                ) {
                    setServerErrors(error.response.data.errors);
                }
                // Error lainnya
                else {
                    setError(
                        error.response.data.message ||
                            "Terjadi kesalahan server"
                    );
                }
            }
            // Error network atau lainnya
            else {
                setError(error.message || "Terjadi kesalahan");
            }
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

        // Clear error ketika user mulai mengetik
        if (serverErrors[name]) {
            setServerErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manajemen Mahasiswa</h1>

            {/* Tampilkan pesan error utama */}
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

            {/* Tampilkan pesan sukses */}
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
                    Tambah Mahasiswa Baru
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Field Nama */}
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

                    {/* Field NIM */}
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

                    {/* Field Divisi */}
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

                    {/* Field UID */}
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
                    disabled={loading}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "Menyimpan..." : "Simpan Mahasiswa"}
                </button>
            </form>

            {/* Daftar Mahasiswa */}
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
                                </tr>
                            </thead>
                            <tbody>
                                {mahasiswa.map((mhs) => (
                                    <tr
                                        key={mhs.id}
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
                                            {mhs.uid}
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

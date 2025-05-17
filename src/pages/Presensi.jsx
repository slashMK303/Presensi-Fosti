import { useState } from "react";
import { presensiMasuk, presensiKeluar } from "../api";

export default function Presensi() {
    const [uid, setUid] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (type) => {
        setIsLoading(true);
        setMessage("");
        try {
            const response =
                type === "masuk"
                    ? await presensiMasuk(uid)
                    : await presensiKeluar(uid);
            setMessage(`Presensi ${type} berhasil: ${response.message}`);
        } catch (error) {
            setMessage(
                `Error: ${error.response?.data?.message || error.message}`
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Presensi RFID</h1>

            <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                    UID Kartu RFID
                </label>
                <input
                    type="text"
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Masukkan UID kartu"
                />
            </div>

            <div className="flex space-x-4">
                <button
                    onClick={() => handleSubmit("masuk")}
                    disabled={isLoading || !uid}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {isLoading ? "Memproses..." : "Presensi Masuk"}
                </button>

                <button
                    onClick={() => handleSubmit("keluar")}
                    disabled={isLoading || !uid}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {isLoading ? "Memproses..." : "Presensi Keluar"}
                </button>
            </div>

            {message && (
                <div
                    className={`mt-4 p-3 rounded ${
                        message.includes("Error")
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                    }`}
                >
                    {message}
                </div>
            )}

            <div className="mt-8 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Diagram Alir Presensi</h2>
                <img
                    src="/presensi-flow.png"
                    alt="Diagram Alir Presensi"
                    className="w-full rounded border"
                />
            </div>
        </div>
    );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { presensiMasuk, presensiKeluar } from "../api";

export default function Presensi() {
    const [uid, setUid] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const uidInputRef = useRef(null);

    const handlePresensi = useCallback(
        async (action) => {
            if (!uid.trim()) {
                setMessage("UID tidak boleh kosong.");
                setIsError(true);
                return;
            }

            setLoading(true);
            setMessage("");
            setIsError(false);

            try {
                let response;
                if (action === "masuk") {
                    response = await presensiMasuk(uid);
                } else {
                    response = await presensiKeluar(uid);
                }
                setMessage(response.message);
                setIsError(false);
            } catch (error) {
                console.error(`Error presensi ${action}:`, error);
                setMessage(
                    error.response?.data?.message ||
                        error.message ||
                        `Gagal melakukan presensi ${action}.`
                );
                setIsError(true);
            } finally {
                setLoading(false);
                setUid(""); // Clear UID input
                if (uidInputRef.current) {
                    uidInputRef.current.focus(); // Refocus input for next scan
                }
            }
        },
        [uid]
    );

    const handleUidChange = (e) => {
        setUid(e.target.value);
        // Clear message when user starts typing again
        if (message) {
            setMessage("");
            setIsError(false);
        }
    };

    const handleKeyDown = useCallback((e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (uidInputRef.current) {
                uidInputRef.current.focus();
            }
        }
    }, []);

    useEffect(() => {
        // Focus input on component mount
        if (uidInputRef.current) {
            uidInputRef.current.focus();
        }
    }, []);

    return (
        <div
            className="p-6 rounded-lg shadow-md max-w-lg mx-auto"
            style={{
                backgroundColor: "var(--card-bg)",
                color: "var(--text-color)",
            }}
        >
            <h1
                className="text-3xl font-bold mb-6 text-center"
                style={{ color: "var(--text-color)" }}
            >
                Presensi Mahasiswa
            </h1>

            {message && (
                <div
                    className="mb-4 p-3 rounded text-center"
                    style={{
                        backgroundColor: isError
                            ? "var(--error-bg)"
                            : "var(--success-bg)",
                        color: isError
                            ? "var(--error-text)"
                            : "var(--success-text)",
                    }}
                >
                    {message}
                </div>
            )}

            <div className="mb-4">
                <label
                    htmlFor="uid"
                    className="block text-lg font-medium mb-2"
                    style={{ color: "var(--text-color)" }}
                >
                    Scan Kartu RFID (UID)
                </label>
                <input
                    type="text"
                    id="uid"
                    value={uid}
                    onChange={handleUidChange}
                    onKeyDown={handleKeyDown} // Attach keydown listener to the input
                    ref={uidInputRef}
                    className="w-full px-4 py-2 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                        borderColor: "var(--border-color)",
                        backgroundColor: "var(--background-color)",
                        color: "var(--text-color)",
                    }}
                    placeholder="Tempelkan kartu..."
                    disabled={loading}
                />
            </div>

            <div className="flex justify-around space-x-4">
                <button
                    onClick={() => handlePresensi("masuk")}
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
                    style={{
                        backgroundColor: "var(--button-primary-bg)",
                        color: "white",
                    }}
                >
                    {loading ? "Memproses..." : "Presensi Masuk"}
                </button>
                <button
                    onClick={() => handlePresensi("keluar")}
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
                    style={{
                        backgroundColor: "var(--button-secondary-bg)",
                        color: "white",
                    }}
                >
                    {loading ? "Memproses..." : "Presensi Keluar"}
                </button>
            </div>
        </div>
    );
}

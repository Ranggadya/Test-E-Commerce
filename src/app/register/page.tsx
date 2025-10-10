"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Gagal mendaftar");
            }

            setSuccess("Registrasi berhasil! Mengarahkan ke halaman login...");
            setTimeout(() => router.push("/login"), 1500);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Terjadi kesalahan saat registrasi.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            className="min-h-screen flex items-center justify-center bg-cover bg-center px-6"
            style={{ backgroundImage: "url('/sepatu12.jpeg')" }}
        >
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg bg-opacity-95">
                <h2 className="text-2xl font-bold text-gray-900 text-center">Daftar</h2>
                <p className="text-gray-600 text-center mt-2">
                    Buat akun baru untuk mulai belanja di Shoes4U
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nama Lengkap"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}
                    {success && (
                        <p className="text-green-600 text-sm text-center">{success}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-black text-white rounded-lg shadow hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {loading ? "Mendaftar..." : "Daftar"}
                    </button>
                </form>

                <p className="text-sm text-gray-600 mt-6 text-center">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-black font-medium hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </section>
    );
}

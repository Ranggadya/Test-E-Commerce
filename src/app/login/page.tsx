"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
    const router = useRouter(); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Login gagal");
            }

            const data = await res.json();
            console.log("Login berhasil:", data);
            localStorage.setItem("token", data.token);
            
            router.push("/"); 
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Terjadi kesalahan yang tidak diketahui");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('/sepatu12.jpeg')" }}
        >
            {/* Card Login */}
            <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Login</h1>
                <p className="text-center text-gray-600 mb-6">
                    Masuk untuk melanjutkan ke Shoes4Us
                </p>

                <form className="space-y-4" onSubmit={handleLogin}>
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    {/* Tombol Login */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Garis pemisah */}
                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="px-2 text-sm text-gray-500">atau</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Tombol Login Google */}
                <button
                    type="button"
                    className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition"
                    onClick={() => alert("Login dengan Google diklik!")}
                >
                    <FcGoogle className="mr-2 text-xl" />
                    <span className="font-medium text-gray-700">Login dengan Google</span>
                </button>

                {/* Link Daftar */}
                <p className="text-center text-sm text-gray-600 mt-4">
                    Belum punya akun?{" "}
                    <a href="/register" className="text-black font-semibold hover:underline">
                        Daftar
                    </a>
                </p>
            </div>
        </div>
    );
}

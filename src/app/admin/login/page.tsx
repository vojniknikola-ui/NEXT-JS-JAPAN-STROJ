"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin-check");
        if (res.ok) {
          router.push("/admin/parts");
        }
      } catch (error) {
        // Not authenticated, stay on login page
      }
    };
    checkAuth();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        router.push("/admin/parts");
      } else {
        alert("Pogrešna lozinka");
      }
    } catch (error) {
      alert("Greška pri prijavi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin prijava</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="password"
          className="border w-full p-2 rounded"
          placeholder="Lozinka"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          disabled={loading}
        />
        <button
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Prijavljivanje..." : "Prijava"}
        </button>
      </form>
    </main>
  );
}
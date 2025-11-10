"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const next = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("next") || "/admin/parts";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin-login", { method: "POST", body: JSON.stringify({ password }) });
    if (res.ok) window.location.href = next;
    else alert("Pogrešna lozinka");
  }

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin prijava</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="password" className="border w-full p-2 rounded" placeholder="Lozinka" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="bg-black text-white px-4 py-2 rounded">Prijava</button>
      </form>
    </main>
  );
}
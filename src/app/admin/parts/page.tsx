"use client";
import { useEffect, useMemo, useState } from "react";

type Category = { id: number; name: string };
type PartInput = {
  sku: string; title: string; description?: string;
  price: number; currency: string; stock: number; categoryId: number;
  imageUrl?: string; thumbUrl?: string; specJson?: string; isActive?: boolean;
};

export default function AdminParts() {
  const [cats, setCats] = useState<Category[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<PartInput>({
    sku: "", title: "", price: 0, currency: "EUR", stock: 0, categoryId: 1, isActive: true,
  } as any);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      // minimal: kreiraj barem 1 kategoriju ručno u DB ili dodaj API za kategorije
      setCats([{ id: 1, name: "Default" }]);
      await refresh();
    })();
  }, []);

  async function refresh(search?: string) {
    const url = `/api/parts${search ? `?q=${encodeURIComponent(search)}` : ""}`;
    const res = await fetch(url);
    setParts(await res.json());
  }

  async function uploadImage(): Promise<string | undefined> {
    if (!file) return undefined;
    const fd = new FormData();
    fd.append("file", file);
    const resp = await fetch("/api/upload", { method: "POST", body: fd });
    if (!resp.ok) { alert("Upload nije uspio"); return; }
    const { url } = await resp.json();
    return url as string;
  }

  async function createPart(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const imageUrl = await uploadImage();
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), imageUrl };
      const res = await fetch("/api/parts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Greška pri spremanju");
      setForm({ sku: "", title: "", price: 0, currency: "EUR", stock: 0, categoryId: 1, isActive: true } as any);
      setFile(null);
      await refresh();
      alert("Dodano!");
    } catch (e:any) {
      alert(e.message || "Greška");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(()=>parts, [parts]);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rezervni dijelovi – admin</h1>
        <div className="flex gap-2">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Pretraga..." className="border rounded p-2" />
          <button onClick={()=>refresh(q)} className="px-4 py-2 bg-black text-white rounded">Traži</button>
        </div>
      </header>

      <section className="grid md:grid-cols-2 gap-8">
        <form onSubmit={createPart} className="border rounded p-4 space-y-3">
          <h2 className="font-medium">Dodaj novi dio</h2>
          <input className="border p-2 w-full rounded" placeholder="SKU" value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})}/>
          <input className="border p-2 w-full rounded" placeholder="Naziv" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
          <textarea className="border p-2 w-full rounded" placeholder="Opis" value={form.description||""} onChange={e=>setForm({...form, description:e.target.value})}/>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" className="border p-2 rounded" placeholder="Cijena" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})}/>
            <input className="border p-2 rounded" placeholder="Valuta" value={form.currency} onChange={e=>setForm({...form, currency:e.target.value.toUpperCase()})}/>
            <input type="number" className="border p-2 rounded" placeholder="Zaliha" value={form.stock} onChange={e=>setForm({...form, stock:Number(e.target.value)})}/>
          </div>
          <select className="border p-2 rounded w-full" value={form.categoryId} onChange={e=>setForm({...form, categoryId:Number(e.target.value)})}>
            {cats.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.isActive} onChange={e=>setForm({...form, isActive:e.target.checked})}/>
            Aktivan
          </label>
          <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">{loading ? "Spremam..." : "Spremi"}</button>
        </form>

        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">Lista dijelova</h2>
          <ul className="divide-y">
            {filtered.map((p:any)=>(
              <li key={p.id} className="py-3 flex gap-3 items-center">
                {p.imageUrl ? <img src={p.imageUrl} alt={p.title} className="w-16 h-16 object-cover rounded"/> : <div className="w-16 h-16 bg-gray-100 rounded"/>}
                <div className="flex-1">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-gray-600">{p.sku} · {p.price} {p.currency} · {p.stock} kom</div>
                </div>
                {/* Za produkciju: dodaj Edit/Delete dugmad i PATCH/DELETE pozive */}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PartInput>({
    sku: "", title: "", price: 0, currency: "EUR", stock: 0, categoryId: 1, isActive: true,
  } as any);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const categories = await res.json();
          setCats(categories);
        } else {
          setCats([{ id: 1, name: "Default" }]);
        }
      } catch (error) {
        setCats([{ id: 1, name: "Default" }]);
      }
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

  async function savePart(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const imageUrl = file ? await uploadImage() : form.imageUrl;
      const payload = { 
        ...form, 
        price: Number(form.price), 
        stock: Number(form.stock),
        ...(imageUrl && { imageUrl })
      };

      if (editingId) {
        const res = await fetch(`/api/parts/${editingId}`, { 
          method: "PATCH", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(payload) 
        });
        if (!res.ok) throw new Error("Greška pri ažuriranju");
        alert("Ažurirano!");
      } else {
        const res = await fetch("/api/parts", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(payload) 
        });
        if (!res.ok) throw new Error("Greška pri spremanju");
        alert("Dodano!");
      }

      resetForm();
      await refresh();
    } catch (e: any) {
      alert(e.message || "Greška");
    } finally {
      setLoading(false);
    }
  }

  async function deletePart(id: number) {
    if (!confirm("Jeste li sigurni da želite obrisati ovaj dio?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/parts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Greška pri brisanju");
      alert("Obrisano!");
      await refresh();
    } catch (e: any) {
      alert(e.message || "Greška");
    } finally {
      setLoading(false);
    }
  }

  function editPart(p: any) {
    setEditingId(p.id);
    setForm({
      sku: p.sku,
      title: p.title,
      description: p.description || "",
      price: Number(p.price),
      currency: p.currency,
      stock: p.stock,
      categoryId: p.categoryId || 1,
      imageUrl: p.imageUrl,
      isActive: p.isActive,
    });
    setFile(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm({ 
      sku: "", 
      title: "", 
      description: "",
      price: 0, 
      currency: "EUR", 
      stock: 0, 
      categoryId: cats[0]?.id || 1, 
      isActive: true 
    } as any);
    setFile(null);
  }

  const filtered = useMemo(() => parts, [parts]);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rezervni dijelovi – admin</h1>
        <div className="flex gap-2">
          <input 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Pretraga..." 
            className="border rounded p-2" 
          />
          <button onClick={() => refresh(q)} className="px-4 py-2 bg-black text-white rounded">
            Traži
          </button>
        </div>
      </header>

      <section className="grid md:grid-cols-2 gap-8">
        <form onSubmit={savePart} className="border rounded p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">{editingId ? "Uredi dio" : "Dodaj novi dio"}</h2>
            {editingId && (
              <button 
                type="button" 
                onClick={resetForm} 
                className="text-sm text-gray-600 hover:text-black"
              >
                Otkaži
              </button>
            )}
          </div>
          
          <input 
            className="border p-2 w-full rounded" 
            placeholder="SKU" 
            value={form.sku} 
            onChange={e => setForm({ ...form, sku: e.target.value })}
            required
          />
          <input 
            className="border p-2 w-full rounded" 
            placeholder="Naziv" 
            value={form.title} 
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea 
            className="border p-2 w-full rounded" 
            placeholder="Opis" 
            rows={3}
            value={form.description || ""} 
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          
          <div className="grid grid-cols-3 gap-2">
            <input 
              type="number" 
              step="0.01"
              className="border p-2 rounded" 
              placeholder="Cijena" 
              value={form.price} 
              onChange={e => setForm({ ...form, price: Number(e.target.value) })}
              required
            />
            <input 
              className="border p-2 rounded" 
              placeholder="Valuta" 
              value={form.currency} 
              onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase() })}
              maxLength={3}
            />
            <input 
              type="number" 
              className="border p-2 rounded" 
              placeholder="Zaliha" 
              value={form.stock} 
              onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </div>
          
          <select 
            className="border p-2 rounded w-full" 
            value={form.categoryId} 
            onChange={e => setForm({ ...form, categoryId: Number(e.target.value) })}
          >
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          <div className="space-y-2">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} 
            />
            {form.imageUrl && !file && (
              <div className="text-sm text-gray-600">
                Trenutna slika: <a href={form.imageUrl} target="_blank" className="text-blue-600 hover:underline">Pogledaj</a>
              </div>
            )}
          </div>
          
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={!!form.isActive} 
              onChange={e => setForm({ ...form, isActive: e.target.checked })}
            />
            Aktivan
          </label>
          
          <button 
            disabled={loading} 
            className="bg-black text-white px-4 py-2 rounded w-full disabled:opacity-50"
          >
            {loading ? "Spremam..." : editingId ? "Ažuriraj" : "Dodaj"}
          </button>
        </form>

        <div className="border rounded p-4 max-h-[600px] overflow-y-auto">
          <h2 className="font-medium mb-2">Lista dijelova ({filtered.length})</h2>
          <ul className="divide-y">
            {filtered.map((p: any) => (
              <li key={p.id} className="py-3 flex gap-3 items-center">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.title} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                    Nema slike
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-sm text-gray-600">
                    {p.sku} · {p.price} {p.currency} · {p.stock} kom
                  </div>
                  {!p.isActive && (
                    <span className="text-xs text-red-600">Neaktivan</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editPart(p)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={loading}
                  >
                    Uredi
                  </button>
                  <button
                    onClick={() => deletePart(p.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    disabled={loading}
                  >
                    Obriši
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

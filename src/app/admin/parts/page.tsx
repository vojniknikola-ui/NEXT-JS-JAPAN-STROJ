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

  const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black shadow-[0_18px_45px_-20px_rgba(255,107,0,0.9)] transition-all hover:scale-105 hover:bg-[#ff7f1a] disabled:opacity-50 disabled:cursor-not-allowed';
  const secondaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-neutral-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00] hover:scale-105';
  const inputClass = 'w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-[#ff6b00]/50 focus:ring-2 focus:ring-[#ff6b00]/60';
  const labelClass = 'block text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-neutral-400 mb-2';

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
    <div className="min-h-screen bg-gradient-to-b from-[#050505] via-[#0b0b0b] to-[#111111] py-16 px-6">
      <div className="mx-auto w-full max-w-7xl space-y-14">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-neutral-300">
            JapanStroj Admin
          </span>
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">Upravljanje rezervnim dijelovima</h1>
          <p className="max-w-2xl text-sm text-neutral-400">
            Ažurirajte ponudu komponenti, pratite stanja i kontrolirajte dostupnost u realnom vremenu.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Pretraži dijelove..." 
              className={inputClass}
              style={{ width: '300px' }}
            />
            <button onClick={() => refresh(q)} className={secondaryButtonClass}>
              Traži
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#101010] p-10 shadow-[0_35px_90px_-40px_rgba(255,107,0,0.5)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-white">{editingId ? 'Uredi postojeći dio' : 'Dodaj novi dio'}</h2>
            {editingId && (
              <button onClick={resetForm} className={secondaryButtonClass}>
                Otkaži izmjene
              </button>
            )}
          </div>

          <form onSubmit={savePart} className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>SKU</label>
              <input
                type="text"
                placeholder="SKU broj"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Naziv</label>
              <input
                type="text"
                placeholder="Naziv dijela"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Opis</label>
              <textarea
                placeholder="Detaljan opis dijela"
                rows={3}
                value={form.description || ""}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Cijena</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Valuta</label>
              <input
                type="text"
                placeholder="EUR"
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                className={inputClass}
                maxLength={3}
              />
            </div>
            <div>
              <label className={labelClass}>Zaliha</label>
              <input
                type="number"
                placeholder="0"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Kategorija</label>
              <select
                value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: Number(e.target.value) })}
                className={inputClass}
              >
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Slika</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-neutral-100 file:mr-4 file:rounded-full file:border-0 file:bg-[#ff6b00] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-[#ff7f1a]"
              />
              {form.imageUrl && !file && (
                <div className="mt-2 text-sm text-neutral-400">
                  Trenutna slika: <a href={form.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[#ff6b00] hover:text-[#ff7f1a] hover:underline">Pogledaj</a>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={!!form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="h-5 w-5 rounded border-white/20 bg-[#0f0f0f] text-[#ff6b00] focus:ring-[#ff6b00] focus:ring-offset-0"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-neutral-200">
                Aktivan dio
              </label>
            </div>
            <div className="md:col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className={primaryButtonClass}
              >
                {loading ? "Spremam..." : editingId ? "Ažuriraj dio" : "Dodaj dio"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#101010] p-10 shadow-[0_35px_90px_-40px_rgba(255,107,0,0.5)]">
          <h2 className="text-2xl font-bold text-white mb-6">Rezervni dijelovi ({filtered.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1a1a1a] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Slika</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">SKU</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Naziv</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Cijena</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Valuta</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Zaliha</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Kategorija</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-neutral-200 font-semibold">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} className="w-16 h-16 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-neutral-600 text-xs">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-100 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3 text-neutral-100 font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-neutral-100">{p.price}</td>
                    <td className="px-4 py-3 text-neutral-100">{p.currency}</td>
                    <td className="px-4 py-3 text-neutral-100">{p.stock}</td>
                    <td className="px-4 py-3 text-neutral-100">{p.category || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {p.isActive ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">Aktivan</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">Neaktivan</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => editPart(p)}
                        disabled={loading}
                        className="bg-[#ff6b00] hover:bg-[#ff7f1a] text-black px-4 py-2 rounded-full mr-2 font-semibold transition-all hover:scale-105 disabled:opacity-50"
                      >
                        Uredi
                      </button>
                      <button
                        onClick={() => deletePart(p.id)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold transition-all hover:scale-105 disabled:opacity-50"
                      >
                        Obriši
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-neutral-400">Nema unesenih rezervnih dijelova</p>
          )}
        </div>
      </div>
    </div>
  );
}

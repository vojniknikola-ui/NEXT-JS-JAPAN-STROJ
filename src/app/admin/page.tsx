"use client";
import { useEffect, useMemo, useState } from "react";

type Category = { id: number; name: string };
type PartInput = {
  sku: string; 
  title: string; 
  brand?: string;
  model?: string;
  catalogNumber?: string;
  application?: string;
  delivery?: string;
  description?: string;
  price: number; 
  priceWithoutVAT?: number;
  priceWithVAT?: number;
  discount?: number;
  currency: string; 
  stock: number; 
  categoryId: number;
  imageUrl?: string; 
  thumbUrl?: string; 
  spec1?: string;
  spec2?: string;
  spec3?: string;
  spec4?: string;
  spec5?: string;
  spec6?: string;
  spec7?: string;
  specJson?: string; 
  isActive?: boolean;
};

export default function AdminParts() {
  const [cats, setCats] = useState<Category[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PartInput>({
    sku: "",
    title: "",
    brand: "",
    model: "",
    catalogNumber: "",
    application: "",
    delivery: "available",
    description: "",
    price: 0,
    priceWithoutVAT: 0,
    priceWithVAT: 0,
    discount: 0,
    currency: "BAM",
    stock: 0,
    categoryId: 1,
    spec1: "",
    spec2: "",
    spec3: "",
    spec4: "",
    spec5: "",
    spec6: "",
    spec7: "",
    isActive: true,
  } as any);
  const [q, setQ] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBrand, setFilterBrand] = useState<string>('');

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
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    if (filterCategory) params.append('categoryId', filterCategory);
    if (filterStatus) params.append('status', filterStatus);
    if (filterBrand) params.append('brand', filterBrand);
    if (sortField) params.append('sort', sortField);
    if (sortDirection) params.append('order', sortDirection);

    const url = `/api/parts?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();
    setParts(data);
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
        priceWithoutVAT: form.priceWithoutVAT ? Number(form.priceWithoutVAT) : undefined,
        priceWithVAT: form.priceWithVAT ? Number(form.priceWithVAT) : undefined,
        discount: form.discount ? Number(form.discount) : 0,
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
      brand: p.brand || "",
      model: p.model || "",
      catalogNumber: p.catalogNumber || "",
      application: p.application || "",
      delivery: p.delivery || "available",
      description: p.description || "",
      price: Number(p.price),
      priceWithoutVAT: Number(p.priceWithoutVAT) || 0,
      priceWithVAT: Number(p.priceWithVAT) || 0,
      discount: Number(p.discount) || 0,
      currency: p.currency,
      stock: p.stock,
      categoryId: p.categoryId || 1,
      imageUrl: p.imageUrl,
      spec1: p.spec1 || "",
      spec2: p.spec2 || "",
      spec3: p.spec3 || "",
      spec4: p.spec4 || "",
      spec5: p.spec5 || "",
      spec6: p.spec6 || "",
      spec7: p.spec7 || "",
      isActive: p.isActive,
    });
    setFile(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm({ 
      sku: "", 
      title: "", 
      brand: "",
      model: "",
      catalogNumber: "",
      application: "",
      delivery: "available",
      description: "",
      price: 0, 
      priceWithoutVAT: 0,
      priceWithVAT: 0,
      discount: 0,
      currency: "BAM",
      stock: 0, 
      categoryId: cats[0]?.id || 1,
      spec1: "",
      spec2: "",
      spec3: "",
      spec4: "",
      spec5: "",
      spec6: "",
      spec7: "",
      isActive: true 
    } as any);
    setFile(null);
  }

  // Filter and sort parts
  const filteredAndSorted = useMemo(() => {
    let filtered = [...parts];

    // Apply filters
    if (filterCategory) {
      filtered = filtered.filter(p => p.categoryId === parseInt(filterCategory));
    }
    if (filterStatus) {
      filtered = filtered.filter(p => filterStatus === 'active' ? p.isActive : !p.isActive);
    }
    if (filterBrand) {
      filtered = filtered.filter(p => p.brand?.toLowerCase().includes(filterBrand.toLowerCase()));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [parts, filterCategory, filterStatus, filterBrand, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedParts = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setFilterCategory('');
    setFilterStatus('');
    setFilterBrand('');
    setQ('');
    setCurrentPage(1);
  };

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

        {/* Filters and Search */}
        <div className="flex flex-col gap-4">
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
            <button onClick={resetFilters} className={secondaryButtonClass}>
              Resetuj filtere
            </button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-400">Kategorija:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={inputClass}
                style={{ width: '150px' }}
              >
                <option value="">Sve kategorije</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-400">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={inputClass}
                style={{ width: '120px' }}
              >
                <option value="">Svi statusi</option>
                <option value="active">Aktivni</option>
                <option value="inactive">Neaktivni</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-400">Brend:</label>
              <input
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                placeholder="Filtriraj po brendu..."
                className={inputClass}
                style={{ width: '200px' }}
              />
            </div>
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

          <form onSubmit={savePart} className="mt-8 space-y-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/10">Osnovni podaci</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Marka</label>
                  <input
                    type="text"
                    placeholder="Marka"
                    value={form.brand || ""}
                    onChange={e => setForm({ ...form, brand: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Model</label>
                  <input
                    type="text"
                    placeholder="Model"
                    value={form.model || ""}
                    onChange={e => setForm({ ...form, model: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Kataloški broj</label>
                  <input
                    type="text"
                    placeholder="Kataloški broj"
                    value={form.catalogNumber || ""}
                    onChange={e => setForm({ ...form, catalogNumber: e.target.value })}
                    className={inputClass}
                  />
                </div>
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
                <div className="md:col-span-2">
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
                  <label className={labelClass}>Primjena</label>
                  <textarea
                    placeholder="Primjena dijela"
                    rows={2}
                    value={form.application || ""}
                    onChange={e => setForm({ ...form, application: e.target.value })}
                    className={inputClass}
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
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/10">Dostupnost i Cijena</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className={labelClass}>Dostupnost/Isporuka</label>
                  <select
                    value={form.delivery || "available"}
                    onChange={e => setForm({ ...form, delivery: e.target.value })}
                    className={inputClass}
                  >
                    <option value="available">Dostupno odmah</option>
                    <option value="15_days">Za 15 dana</option>
                    <option value="on_request">Po dogovoru</option>
                  </select>
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
                <div>
                  <label className={labelClass}>Cijena bez PDV-a</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.priceWithoutVAT || ""}
                    onChange={e => setForm({ ...form, priceWithoutVAT: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Cijena sa PDV-om (17%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.priceWithVAT || ""}
                    onChange={e => setForm({ ...form, priceWithVAT: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Popust (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={form.discount || ""}
                    onChange={e => setForm({ ...form, discount: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Cijena (legacy)</label>
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
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/10">Tehnička Specifikacija</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Specifikacija 1</label>
                  <input
                    type="text"
                    placeholder="Specifikacija 1"
                    value={form.spec1 || ""}
                    onChange={e => setForm({ ...form, spec1: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Specifikacija 2</label>
                  <input
                    type="text"
                    placeholder="Specifikacija 2"
                    value={form.spec2 || ""}
                    onChange={e => setForm({ ...form, spec2: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Specifikacija 3</label>
                  <input
                    type="text"
                    placeholder="Specifikacija 3"
                    value={form.spec3 || ""}
                    onChange={e => setForm({ ...form, spec3: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Specifikacija 4</label>
                  <input
                    type="text"
                    placeholder="Specifikacija 4"
                    value={form.spec4 || ""}
                    onChange={e => setForm({ ...form, spec4: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Specifikacija 5</label>
                  <input
                    type="text"
                    placeholder="Specifikacija 5"
                    value={form.spec5 || ""}
                    onChange={e => setForm({ ...form, spec5: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Specifikacija 6</label>
                  <input
                    type="text"
                    placeholder="Specifikacija 6"
                    value={form.spec6 || ""}
                    onChange={e => setForm({ ...form, spec6: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Specifikacija 7</label>
                  <input
                    type="text"
                    placeholder="Specifikacija 7"
                    value={form.spec7 || ""}
                    onChange={e => setForm({ ...form, spec7: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/10">Mediji i Status</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
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
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/10">
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
          <h2 className="text-2xl font-bold text-white mb-6">Inventory Management - Rezervni dijelovi ({filteredAndSorted.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1a1a1a] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('id')}>ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Slika</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('sku')}>SKU {sortField === 'sku' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('brand')}>Marka {sortField === 'brand' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('model')}>Model {sortField === 'model' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Kat. broj</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('title')}>Naziv {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Primjena</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Opis</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Dostupnost</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('stock')}>Zaliha {sortField === 'stock' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('priceWithoutVAT')}>Bez PDV {sortField === 'priceWithoutVAT' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('priceWithVAT')}>Sa PDV {sortField === 'priceWithVAT' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Popust %</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Valuta</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 1</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 2</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 3</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 4</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 5</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 6</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 7</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Kategorija</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('createdAt')}>Kreirano {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-4 py-3 text-left text-neutral-200 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('updatedAt')}>Ažurirano {sortField === 'updatedAt' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-4 py-3 text-center text-neutral-200 font-semibold">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {paginatedParts.map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-neutral-100 font-mono text-xs">{p.id}</td>
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
                    <td className="px-4 py-3 text-neutral-100">{p.brand || '-'}</td>
                    <td className="px-4 py-3 text-neutral-100">{p.model || '-'}</td>
                    <td className="px-4 py-3 text-neutral-100 font-mono text-xs">{p.catalogNumber || '-'}</td>
                    <td className="px-4 py-3 text-neutral-100 font-medium max-w-[200px] truncate">{p.title}</td>
                    <td className="px-4 py-3 text-neutral-100 max-w-[150px] truncate">{p.application || '-'}</td>
                    <td className="px-4 py-3 text-neutral-100 max-w-[200px] truncate">{p.description || '-'}</td>
                    <td className="px-4 py-3 text-neutral-100 text-xs">
                      {p.delivery === 'available' && 'Odmah'}
                      {p.delivery === '15_days' && '15 dana'}
                      {p.delivery === 'on_request' && 'Dogovor'}
                      {!p.delivery && '-'}
                    </td>
                    <td className="px-4 py-3 text-neutral-100 text-center">{p.stock || 0}</td>
                    <td className="px-4 py-3 text-neutral-100">{p.priceWithoutVAT ? `${p.priceWithoutVAT} ${p.currency}` : '-'}</td>
                    <td className="px-4 py-3 text-neutral-100">{p.priceWithVAT ? `${p.priceWithVAT} ${p.currency}` : '-'}</td>
                    <td className="px-4 py-3 text-neutral-100">{p.discount ? `${p.discount}%` : '-'}</td>
                    <td className="px-4 py-3 text-neutral-100 font-mono text-xs">{p.currency}</td>
                    <td className="px-4 py-3 text-neutral-100 max-w-[120px] truncate">{p.spec1 || '-'}</td>
                    <td className="px-4 py-3 text-neutral-100 max-w-[120px] truncate">{p.spec2 || '-'}</td>
                    <td className="px-4 py-3 text-neutral-100 max-w-[120px] truncate">{p.spec3 || '-'}</td>
                    <td className="px-4 py-3 text-neutral-100 max-w-[120px] truncate">{p.spec4 || '-'}</td>
                    <td className="px-4 py-3 text-neutral-100 max-w-[120px] truncate">{p.spec5 || '-'}</td>
                    <td className="px-4 py-3 text-neutral-100 max-w-[120px] truncate">{p.spec6 || '-'}</td>
                    <td className="px-4 py-3 text-neutral-100 max-w-[120px] truncate">{p.spec7 || '-'}</td>
                    <td className="px-4 py-3 text-neutral-100">{p.category || '-'}</td>
                    <td className="px-4 py-3">
                      {p.isActive ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">Aktivan</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">Neaktivan</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-100 text-xs">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('bs-BA') : '-'}</td>
                    <td className="px-4 py-3 text-neutral-100 text-xs">{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('bs-BA') : '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => editPart(p)}
                          disabled={loading}
                          className="bg-[#ff6b00] hover:bg-[#ff7f1a] text-black px-4 py-2 rounded-full font-semibold transition-all hover:scale-105 disabled:opacity-50 text-xs"
                        >
                          Uredi
                        </button>
                        <button
                          onClick={() => deletePart(p.id)}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold transition-all hover:scale-105 disabled:opacity-50 text-xs"
                        >
                          Obriši
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAndSorted.length === 0 && (
            <p className="text-center py-8 text-neutral-400">Nema unesenih rezervnih dijelova</p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
              <div className="text-sm text-neutral-400">
                Prikazujem {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} od {filteredAndSorted.length} dijelova
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Prethodna
                </button>
                <span className="px-4 py-2 text-sm text-neutral-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Sljedeća
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

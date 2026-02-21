"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Category = { id: number; name: string };
type SortDirection = 'asc' | 'desc';
type SortField = 'id' | 'sku' | 'brand' | 'model' | 'title' | 'stock' | 'priceWithoutVAT' | 'priceWithVAT' | 'createdAt' | 'updatedAt';
type Delivery = 'available' | '15_days' | 'on_request';

interface PartRecord {
  id: number;
  sku: string;
  title: string;
  brand: string | null;
  model: string | null;
  catalogNumber: string | null;
  application: string | null;
  delivery: Delivery | null;
  description: string | null;
  price: string | null;
  priceWithoutVAT: string | null;
  priceWithVAT: string | null;
  discount: string | null;
  currency: string;
  stock: number;
  categoryId: number;
  imageUrl: string | null;
  thumbUrl: string | null;
  spec1: string | null;
  spec2: string | null;
  spec3: string | null;
  spec4: string | null;
  spec5: string | null;
  spec6: string | null;
  spec7: string | null;
  specJson: string | null;
  isActive: boolean;
  category?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

interface PartsResponsePayload {
  items?: PartRecord[];
}

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

const createInitialForm = (categoryId: number): PartInput => ({
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
  categoryId,
  spec1: "",
  spec2: "",
  spec3: "",
  spec4: "",
  spec5: "",
  spec6: "",
  spec7: "",
  isActive: true,
});

const parseNumberString = (value: string | null | undefined): number => {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getSortableValue = (part: PartRecord, field: SortField): string | number => {
  switch (field) {
    case 'id':
    case 'stock':
      return part[field] ?? 0;
    case 'priceWithoutVAT':
      return parseNumberString(part.priceWithoutVAT);
    case 'priceWithVAT':
      return parseNumberString(part.priceWithVAT);
    case 'createdAt':
    case 'updatedAt':
      return part[field] ? new Date(part[field] as string | Date).getTime() : 0;
    case 'sku':
    case 'brand':
    case 'model':
    case 'title':
      return (part[field] ?? '').toLowerCase();
    default:
      return 0;
  }
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

const normalizeSku = (value: string): string =>
  value.trim().replace(/\s+/g, "-").toUpperCase();

type ApiErrorPayload = {
  error?: string;
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

const fieldLabelMap: Record<string, string> = {
  sku: "SKU",
  title: "Naziv",
  price: "Cijena",
  priceWithoutVAT: "Cijena bez PDV-a",
  priceWithVAT: "Cijena sa PDV-om",
  discount: "Popust",
  currency: "Valuta",
  stock: "Zaliha",
  categoryId: "Kategorija",
  imageUrl: "URL slike",
  thumbUrl: "Thumbnail URL",
  delivery: "Dostupnost",
};

const parseApiError = (
  errorData: unknown,
  fallbackMessage: string
): { message: string; fieldErrors: Record<string, string> } => {
  if (!errorData || typeof errorData !== "object") {
    return { message: fallbackMessage, fieldErrors: {} };
  }

  const typed = errorData as ApiErrorPayload;
  const flattenedFieldErrors: Record<string, string> = {};

  if (typed.fieldErrors) {
    for (const [field, messages] of Object.entries(typed.fieldErrors)) {
      const firstMessage = messages?.find(Boolean);
      if (firstMessage) {
        flattenedFieldErrors[field] = firstMessage;
      }
    }
  }

  const firstFormError = typed.formErrors?.find(Boolean);
  const firstFieldError = Object.values(flattenedFieldErrors).find(Boolean);
  const message =
    typed.error || firstFormError || firstFieldError || fallbackMessage;

  return {
    message,
    fieldErrors: flattenedFieldErrors,
  };
};

export default function AdminParts() {
  const [cats, setCats] = useState<Category[]>([]);
  const [parts, setParts] = useState<PartRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PartInput>(() => createInitialForm(1));
  const [q, setQ] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBrand, setFilterBrand] = useState<string>('');

  const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black shadow-[0_18px_45px_-20px_rgba(255,107,0,0.9)] transition-all hover:scale-105 hover:bg-[#ff7f1a] disabled:opacity-50 disabled:cursor-not-allowed';
  const secondaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-neutral-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00] hover:scale-105';
  const inputClass = 'w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-[#ff6b00]/50 focus:ring-2 focus:ring-[#ff6b00]/60';
  const labelClass = 'block text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-neutral-400 mb-2';
  const validSortFields: SortField[] = ['id', 'sku', 'brand', 'model', 'title', 'stock', 'priceWithoutVAT', 'priceWithVAT', 'createdAt', 'updatedAt'];

  const clearFieldError = (field: string) => {
    setFormFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const getInputClassName = (field: string) =>
    `${inputClass} ${formFieldErrors[field] ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40' : ''}`;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load categories
        try {
          const res = await fetch("/api/categories");
          if (res.ok) {
            const categories = (await res.json()) as Category[];
            setCats(categories);
          } else {
            setCats([{ id: 1, name: "Default" }]);
          }
        } catch (error) {
          console.warn('Failed to load categories:', error);
          setCats([{ id: 1, name: "Default" }]);
        }

        // Load parts
        const partsRes = await fetch('/api/parts?sort=createdAt&order=desc');
        if (!partsRes.ok) {
          throw new Error(`HTTP ${partsRes.status}: ${partsRes.statusText}`);
        }
        const partsPayload = (await partsRes.json()) as PartsResponsePayload | PartRecord[];
        const loadedParts = Array.isArray(partsPayload) ? partsPayload : partsPayload.items ?? [];
        setParts(loadedParts);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Greška pri učitavanju podataka');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  async function refresh(search?: string) {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (filterCategory) params.append('categoryId', filterCategory);
      if (filterStatus) params.append('status', filterStatus);
      if (filterBrand) params.append('brand', filterBrand);
      if (sortField) params.append('sort', sortField);
      if (sortDirection) params.append('order', sortDirection);

      const url = `/api/parts?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = (await res.json()) as PartsResponsePayload | PartRecord[];
      const nextParts = Array.isArray(data) ? data : data.items ?? [];
      setParts(nextParts);
    } catch (error) {
      console.error('Error refreshing parts:', error);
      setError('Greška pri učitavanju dijelova');
      setParts([]);
    } finally {
      setLoading(false);
    }
  }

  async function uploadImage(): Promise<string | undefined> {
    if (!file) return undefined;
    const fd = new FormData();
    fd.append("file", file);
    const resp = await fetch("/api/upload", { method: "POST", body: fd });
    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      const parsed = parseApiError(errorData, "Upload slike nije uspio");
      throw new Error(parsed.message);
    }
    const { url } = await resp.json();
    return url as string;
  }

  async function savePart(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFormError(null);
    setFormSuccess(null);
    setFormFieldErrors({});

    try {
      const validationErrors: Record<string, string> = {};
      if (!form.sku?.trim()) validationErrors.sku = "SKU je obavezan.";
      if (!form.title?.trim()) validationErrors.title = "Naziv dijela je obavezan.";
      if (!form.currency?.trim()) validationErrors.currency = "Valuta je obavezna.";
      if (Number(form.price) < 0) validationErrors.price = "Cijena ne može biti negativna.";
      if (Number(form.stock) < 0) validationErrors.stock = "Zaliha ne može biti negativna.";
      if (form.priceWithoutVAT && form.priceWithoutVAT < 0) {
        validationErrors.priceWithoutVAT = "Cijena bez PDV-a ne može biti negativna.";
      }
      if (form.priceWithVAT && form.priceWithVAT < 0) {
        validationErrors.priceWithVAT = "Cijena sa PDV-om ne može biti negativna.";
      }
      if (form.discount && (form.discount < 0 || form.discount > 100)) {
        validationErrors.discount = "Popust mora biti između 0 i 100%.";
      }

      if (Object.keys(validationErrors).length) {
        setFormFieldErrors(validationErrors);
        throw new Error("Provjerite obavezna i neispravna polja.");
      }

      const imageUrl = file ? await uploadImage() : form.imageUrl;
      const payload = {
        ...form,
        sku: normalizeSku(form.sku),
        currency: (form.currency || "BAM").trim().toUpperCase(),
        price: Number(form.price),
        priceWithoutVAT: form.priceWithoutVAT ? Number(form.priceWithoutVAT) : undefined,
        priceWithVAT: form.priceWithVAT ? Number(form.priceWithVAT) : undefined,
        discount: form.discount ? Number(form.discount) : 0,
        stock: Number(form.stock),
        ...(imageUrl && { imageUrl })
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/parts/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/parts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const parsed = parseApiError(
          errorData,
          `HTTP ${res.status}: ${res.statusText}`
        );
        if (Object.keys(parsed.fieldErrors).length) {
          setFormFieldErrors(parsed.fieldErrors);
        }
        throw new Error(parsed.message);
      }

      await res.json();

      resetForm();
      await refresh();

      setFormSuccess(editingId ? "Dio je uspješno ažuriran." : "Dio je uspješno dodan.");

    } catch (e: unknown) {
      console.error('Save error:', e);
      setFormError(getErrorMessage(e, "Došlo je do greške prilikom spremanja"));
    } finally {
      setSaving(false);
    }
  }

  async function deletePart(id: number) {
    if (!confirm("Jeste li sigurni da želite obrisati ovaj dio? Ova akcija se ne može poništiti.")) return;

    setLoading(true);
    setError(null);
    setFormError(null);
    setFormSuccess(null);
    setFormFieldErrors({});

    try {
      const res = await fetch(`/api/parts/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const parsed = parseApiError(
          errorData,
          `HTTP ${res.status}: ${res.statusText}`
        );
        throw new Error(parsed.message);
      }

      await refresh();
      setFormSuccess("Dio je uspješno obrisan.");

    } catch (e: unknown) {
      console.error('Delete error:', e);
      setFormError(getErrorMessage(e, "Greška pri brisanju dijela"));
    } finally {
      setLoading(false);
    }
  }

  function editPart(p: PartRecord) {
    setFormError(null);
    setFormSuccess(null);
    setFormFieldErrors({});
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
      price: parseNumberString(p.price),
      priceWithoutVAT: parseNumberString(p.priceWithoutVAT),
      priceWithVAT: parseNumberString(p.priceWithVAT),
      discount: parseNumberString(p.discount),
      currency: p.currency || "BAM",
      stock: p.stock,
      categoryId: p.categoryId || 1,
      imageUrl: p.imageUrl || undefined,
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
    setForm(createInitialForm(cats[0]?.id || 1));
    setFile(null);
    setFormError(null);
    setFormSuccess(null);
    setFormFieldErrors({});
  }

  // Filter and sort parts
  const filteredAndSorted = useMemo(() => {
    let filtered = [...parts];

    // Apply filters
    if (filterCategory) {
      filtered = filtered.filter((p) => p.categoryId === Number.parseInt(filterCategory, 10));
    }
    if (filterStatus) {
      filtered = filtered.filter((p) => (filterStatus === 'active' ? p.isActive : !p.isActive));
    }
    if (filterBrand) {
      filtered = filtered.filter((p) => p.brand?.toLowerCase().includes(filterBrand.toLowerCase()));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = getSortableValue(a, sortField);
      const bVal = getSortableValue(b, sortField);

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

  const handleSort = (field: SortField) => {
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
                id="search-parts"
                name="search-parts"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400 font-medium">📁 Kategorija</label>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className={inputClass}
              >
                <option value="">Sve kategorije</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400 font-medium">📊 Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className={inputClass}
              >
                <option value="">Svi statusi</option>
                <option value="active">✅ Aktivni</option>
                <option value="inactive">❌ Neaktivni</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400 font-medium">🏷️ Brend</label>
              <input
                id="filter-brand"
                name="filter-brand"
                value={filterBrand}
                onChange={(e) => {
                  setFilterBrand(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filtriraj po brendu..."
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400 font-medium">🔄 Sortiraj</label>
              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  if (validSortFields.includes(field as SortField)) {
                    setSortField(field as SortField);
                  }
                  setSortDirection(direction === 'asc' ? 'asc' : 'desc');
                }}
                className={inputClass}
              >
                <option value="createdAt-desc">🕒 Najnoviji prvi</option>
                <option value="createdAt-asc">📅 Najstariji prvi</option>
                <option value="title-asc">🔤 Naziv A-Z</option>
                <option value="title-desc">🔡 Naziv Z-A</option>
                <option value="brand-asc">🏷️ Brend A-Z</option>
                <option value="brand-desc">🏷️ Brend Z-A</option>
                <option value="priceWithoutVAT-desc">💰 Cijena ▼</option>
                <option value="priceWithoutVAT-asc">💰 Cijena ▲</option>
                <option value="stock-desc">📦 Zaliha ▼</option>
                <option value="stock-asc">📦 Zaliha ▲</option>
              </select>
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
            {formError && (
              <div className="rounded-2xl border border-red-500/40 bg-red-950/30 px-4 py-3">
                <p className="text-sm font-semibold text-red-300">Greška pri spremanju</p>
                <p className="mt-1 text-sm text-red-200">{formError}</p>
              </div>
            )}

            {formSuccess && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-3">
                <p className="text-sm font-semibold text-emerald-300">Uspješno</p>
                <p className="mt-1 text-sm text-emerald-200">{formSuccess}</p>
              </div>
            )}

            {Object.keys(formFieldErrors).length > 0 && (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 px-4 py-3">
                <p className="text-sm font-semibold text-amber-300">Provjerite polja</p>
                <ul className="mt-2 space-y-1 text-sm text-amber-200">
                  {Object.entries(formFieldErrors).map(([field, message]) => (
                    <li key={field}>
                      <span className="font-semibold">{fieldLabelMap[field] || field}:</span> {message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/10">Osnovni podaci</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Marka</label>
                  <input
                    id="part-brand"
                    name="part-brand"
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
                    id="part-model"
                    name="part-model"
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
                    id="part-catalog-number"
                    name="part-catalog-number"
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
                    id="part-sku"
                    name="part-sku"
                    type="text"
                    placeholder="SKU broj"
                    value={form.sku}
                    onChange={e => {
                      clearFieldError('sku');
                      setForm({ ...form, sku: normalizeSku(e.target.value) });
                    }}
                    className={getInputClassName('sku')}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Naziv</label>
                  <input
                    id="part-title"
                    name="part-title"
                    type="text"
                    placeholder="Naziv dijela"
                    value={form.title}
                    onChange={e => {
                      clearFieldError('title');
                      setForm({ ...form, title: e.target.value });
                    }}
                    className={getInputClassName('title')}
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
                    onChange={e => {
                      clearFieldError('stock');
                      setForm({ ...form, stock: Number(e.target.value) });
                    }}
                    className={getInputClassName('stock')}
                  />
                </div>
                <div>
                  <label className={labelClass}>Kategorija</label>
                  <select
                    value={form.categoryId}
                    onChange={e => {
                      clearFieldError('categoryId');
                      setForm({ ...form, categoryId: Number(e.target.value) });
                    }}
                    className={getInputClassName('categoryId')}
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
                    onChange={e => {
                      clearFieldError('priceWithoutVAT');
                      setForm({ ...form, priceWithoutVAT: Number(e.target.value) });
                    }}
                    className={getInputClassName('priceWithoutVAT')}
                  />
                </div>
                <div>
                  <label className={labelClass}>Cijena sa PDV-om (17%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.priceWithVAT || ""}
                    onChange={e => {
                      clearFieldError('priceWithVAT');
                      setForm({ ...form, priceWithVAT: Number(e.target.value) });
                    }}
                    className={getInputClassName('priceWithVAT')}
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
                    onChange={e => {
                      clearFieldError('discount');
                      setForm({ ...form, discount: Number(e.target.value) });
                    }}
                    className={getInputClassName('discount')}
                  />
                </div>
                <div>
                  <label className={labelClass}>Cijena (legacy)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={e => {
                      clearFieldError('price');
                      setForm({ ...form, price: Number(e.target.value) });
                    }}
                    className={getInputClassName('price')}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Valuta</label>
                  <input
                    type="text"
                    placeholder="EUR"
                    value={form.currency}
                    onChange={e => {
                      clearFieldError('currency');
                      setForm({ ...form, currency: e.target.value.toUpperCase() });
                    }}
                    className={getInputClassName('currency')}
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
                disabled={saving || loading}
                className={primaryButtonClass}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Spremam...
                  </div>
                ) : editingId ? "Ažuriraj dio" : "Dodaj dio"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const confirmed = confirm('Jeste li sigurni da želite resetovati formu? Sve unesene podatke ćete izgubiti.');
                  if (confirmed) {
                    resetForm();
                  }
                }}
                disabled={saving || loading}
                className={secondaryButtonClass}
              >
                Resetuj formu
              </button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-[#101010] p-10 shadow-[0_35px_90px_-40px_rgba(255,107,0,0.5)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Inventory Management - Rezervni dijelovi ({filteredAndSorted.length})</h2>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {filterCategory && (
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs flex items-center gap-1">
                      📁 {cats.find(c => c.id === parseInt(filterCategory))?.name || filterCategory}
                      <button
                        onClick={() => setFilterCategory('')}
                        className="hover:text-red-400 ml-1"
                        title="Ukloni filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filterStatus && (
                    <span className="px-2 py-1 bg-green-900/30 text-green-300 rounded-full text-xs flex items-center gap-1">
                      {filterStatus === 'active' ? '✅ Aktivni' : '❌ Neaktivni'}
                      <button
                        onClick={() => setFilterStatus('')}
                        className="hover:text-red-400 ml-1"
                        title="Ukloni filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filterBrand && (
                    <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs flex items-center gap-1">
                      🏷️ {filterBrand}
                      <button
                        onClick={() => setFilterBrand('')}
                        className="hover:text-red-400 ml-1"
                        title="Ukloni filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {sortField !== 'createdAt' && (
                    <span className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded-full text-xs flex items-center gap-1">
                      🔄 {sortField === 'title' ? 'Naziv' : sortField === 'brand' ? 'Brend' : sortField === 'priceWithoutVAT' ? 'Cijena' : sortField === 'stock' ? 'Zaliha' : sortField}
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </div>
                {(filterCategory || filterStatus || filterBrand || sortField !== 'createdAt') && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-[#ff6b00] hover:text-[#ff7f1a] underline font-medium"
                  >
                    🗑️ Resetuj sve filtere
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {loading && (
                <div className="flex items-center gap-2 text-neutral-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ff6b00]"></div>
                  <span>Učitavanje...</span>
                </div>
              )}
              <button
                onClick={() => refresh()}
                disabled={loading}
                className={secondaryButtonClass}
                title="Osvježi podatke"
              >
                🔄 Osvježi
              </button>
              <button
                onClick={() => {
                  const csvData = paginatedParts.map(p => ({
                    ID: p.id,
                    SKU: p.sku,
                    Naziv: p.title,
                    Brend: p.brand || '',
                    Model: p.model || '',
                    'Kat. broj': p.catalogNumber || '',
                    Primjena: p.application || '',
                    Opis: p.description || '',
                    Dostupnost: p.delivery === 'available' ? 'Odmah' : p.delivery === '15_days' ? '15 dana' : 'Po dogovoru',
                    Zaliha: p.stock || 0,
                    'Bez PDV': p.priceWithoutVAT ? `${p.priceWithoutVAT} ${p.currency}` : '',
                    'Sa PDV': p.priceWithVAT ? `${p.priceWithVAT} ${p.currency}` : '',
                    Popust: p.discount ? `${p.discount}%` : '',
                    Valuta: p.currency,
                    'Spec 1': p.spec1 || '',
                    'Spec 2': p.spec2 || '',
                    'Spec 3': p.spec3 || '',
                    'Spec 4': p.spec4 || '',
                    'Spec 5': p.spec5 || '',
                    'Spec 6': p.spec6 || '',
                    'Spec 7': p.spec7 || '',
                    Kategorija: p.category || '',
                    Status: p.isActive ? 'Aktivan' : 'Neaktivan',
                    'Kreirano': p.createdAt ? new Date(p.createdAt).toLocaleDateString('bs-BA') : '',
                    'Ažurirano': p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('bs-BA') : '',
                  }));

                  if (csvData.length === 0) {
                    alert('Nema podataka za izvoz.');
                    return;
                  }

                  const csvContent = [
                    Object.keys(csvData[0]).join(','),
                    ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
                  ].join('\n');

                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = `rezervni-dijelovi-${new Date().toISOString().split('T')[0]}.csv`;
                  link.click();
                }}
                className={secondaryButtonClass}
                title="Preuzmi CSV"
              >
                📊 CSV Export
              </button>
            </div>
          </div>
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
                {paginatedParts.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-neutral-100 font-mono text-xs">{p.id}</td>
                    <td className="px-4 py-3">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.title}
                          width={64}
                          height={64}
                          unoptimized
                          className="w-16 h-16 object-cover rounded-lg"
                        />
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  title="Prva stranica"
                >
                  ⏮️
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Prethodna
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          pageNum === currentPage
                            ? 'bg-[#ff6b00] text-black'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Sljedeća
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  title="Posljednja stranica"
                >
                  ⏭️
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page, SparePart, CartItem, Availability } from '@/types';

const getNextId = (items: SparePart[]) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1);

const createEmptyPart = (id: number): SparePart => ({
  id,
  name: '',
  brand: '',
  model: '',
  catalogNumber: '',
  application: '',
  delivery: Availability.Available,
  priceWithoutVAT: 0,
  priceWithVAT: 0,
  discount: 0,
  imageUrl: '',
  technicalSpecs: {
    spec1: '',
    spec2: '',
    spec3: '',
    spec4: '',
    spec5: '',
    spec6: '',
    spec7: '',
  },
});

export default function AdminPanel() {
  const [activePage, setActivePage] = useState<Page>('admin');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<SparePart>(() => createEmptyPart(getNextId([])));

  useEffect(() => {
    // Load cart from localStorage
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('japanStrojCart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }
    }

    // Load spare parts from API
    fetch('/api/spare-parts')
      .then(res => res.json())
      .then(data => {
        setParts(data);
        if (editingId === null) {
          setFormData((prev) => (prev.name || prev.brand || prev.catalogNumber ? prev : createEmptyPart(getNextId(data))));
        }
      })
      .catch(error => console.error('Error loading spare parts:', error));
  }, [editingId]);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black shadow-[0_18px_45px_-20px_rgba(255,107,0,0.9)] transition-all hover:scale-105 hover:bg-[#ff7f1a]';
  const secondaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-neutral-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00] hover:scale-105';
  const inputClass = 'w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-[#ff6b00]/50 focus:ring-2 focus:ring-[#ff6b00]/60';
  const disabledInputClass = 'w-full rounded-2xl border border-white/10 bg-[#1b1b1b] px-4 py-3 text-sm text-neutral-400';
  const labelClass = 'block text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-neutral-400 mb-2';

  const calculateVAT = (price: number) => parseFloat((price * 1.17).toFixed(2));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof SparePart
  ) => {
    const value = e.target.value;
    if (field === 'priceWithoutVAT' || field === 'discount') {
      const numericValue = parseFloat(value) || 0;
      const nextState = { ...formData, [field]: numericValue } as SparePart;
      if (field === 'priceWithoutVAT') {
        nextState.priceWithVAT = calculateVAT(numericValue);
      }
      setFormData(nextState);
      return;
    }

    if (field === 'delivery') {
      setFormData({ ...formData, delivery: value as Availability });
      return;
    }

    setFormData({ ...formData, [field]: value } as SparePart);
  };

  const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement>, spec: keyof SparePart['technicalSpecs']) => {
    setFormData({
      ...formData,
      technicalSpecs: {
        ...formData.technicalSpecs,
        [spec]: e.target.value,
      },
    });
  };

  const handleEdit = (part: SparePart) => {
    setEditingId(part.id);
    setFormData({
      ...part,
      priceWithVAT: calculateVAT(part.priceWithoutVAT),
    });
  };

  const handleAdd = () => {
    const nextId = getNextId(parts);
    setEditingId(null);
    setFormData(createEmptyPart(nextId));
  };

  const handleSave = async () => {
    const partToSave: SparePart = {
      ...formData,
      priceWithVAT: calculateVAT(formData.priceWithoutVAT),
    };

    try {
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch('/api/spare-parts', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partToSave),
      });

      if (response.ok) {
        const updatedParts = editingId
          ? parts.map((item) => (item.id === editingId ? partToSave : item))
          : [...parts, partToSave];

        setParts(updatedParts);
        setEditingId(null);
        setFormData(createEmptyPart(getNextId(updatedParts)));
      } else {
        console.error('Failed to save spare part');
      }
    } catch (error) {
      console.error('Error saving spare part:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/spare-parts?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const filtered = parts.filter((item) => item.id !== id);
        setParts(filtered);
        if (editingId === id) {
          setEditingId(null);
          setFormData(createEmptyPart(getNextId(filtered)));
        }
      } else {
        console.error('Failed to delete spare part');
      }
    } catch (error) {
      console.error('Error deleting spare part:', error);
    }
  };

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />
      <main className="flex-grow">
        <div className="min-h-screen bg-gradient-to-b from-[#050505] via-[#0b0b0b] to-[#111111] py-16 px-6">
          <div className="mx-auto w-full max-w-6xl space-y-14">
            <div className="flex flex-col gap-3">
              <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-neutral-300">
                JapanStroj Admin
              </span>
              <h1 className="text-4xl font-extrabold text-white md:text-5xl">Upravljanje rezervnim dijelovima</h1>
              <p className="max-w-2xl text-sm text-neutral-400">
                Ažurirajte ponudu komponenti, pratite stanja i kontrolirajte dostupnost strojeva u realnom vremenu.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#101010] p-10 shadow-[0_35px_90px_-40px_rgba(255,107,0,0.5)]">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold text-white">{editingId ? 'Uredi postojeći dio' : 'Dodaj novu karticu'}</h2>
                <button onClick={handleAdd} className={secondaryButtonClass}>
                  Novi unos
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Naziv</label>
                  <input
                    type="text"
                    placeholder="Naziv dijela"
                    value={formData.name}
                    onChange={(e) => handleInputChange(e, 'name')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Marka</label>
                  <input
                    type="text"
                    placeholder="Marka (npr. Caterpillar)"
                    value={formData.brand}
                    onChange={(e) => handleInputChange(e, 'brand')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Model</label>
                  <input
                    type="text"
                    placeholder="Model"
                    value={formData.model}
                    onChange={(e) => handleInputChange(e, 'model')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Kataloški broj</label>
                  <input
                    type="text"
                    placeholder="Kataloški broj"
                    value={formData.catalogNumber}
                    onChange={(e) => handleInputChange(e, 'catalogNumber')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Primjena</label>
                  <input
                    type="text"
                    placeholder="npr. Hidraulika"
                    value={formData.application}
                    onChange={(e) => handleInputChange(e, 'application')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Dostupnost/Isporuka</label>
                  <select
                    value={formData.delivery}
                    onChange={(e) => handleInputChange(e, 'delivery')}
                    className={inputClass}
                  >
                    <option value={Availability.Available}>Dostupno odmah</option>
                    <option value={Availability.FifteenDays}>Rok isporuke 15 dana</option>
                    <option value={Availability.OnRequest}>Po dogovoru</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Cijena bez PDV-a</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.priceWithoutVAT}
                    onChange={(e) => handleInputChange(e, 'priceWithoutVAT')}
                    className={inputClass}
                    step="0.01"
                  />
                </div>
                <div>
                  <label className={labelClass}>Cijena sa PDV-om (17%)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.priceWithVAT.toFixed(2)}
                    disabled
                    className={disabledInputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Popust (%)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.discount}
                    onChange={(e) => handleInputChange(e, 'discount')}
                    className={inputClass}
                    step="0.01"
                  />
                </div>
                <div>
                  <label className={labelClass}>Link za sliku (URL)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/slika1.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange(e, 'imageUrl')}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-6">Tehnička specifikacija</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(['spec1', 'spec2', 'spec3', 'spec4', 'spec5', 'spec6', 'spec7'] as const).map((spec, idx) => (
                    <div key={spec}>
                      <label className={labelClass}>Specifikacija {idx + 1}</label>
                      <input
                        type="text"
                        placeholder={`Specifikacija ${idx + 1}`}
                        value={formData.technicalSpecs[spec]}
                        onChange={(e) => handleSpecChange(e, spec)}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleSave}
                  className={primaryButtonClass}
                >
                  {editingId ? 'Update kartice' : 'Dodaj karticu'}
                </button>
                {editingId && (
                  <button
                    onClick={handleAdd}
                    className={secondaryButtonClass}
                  >
                    Otkaži
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#101010] p-10 shadow-[0_35px_90px_-40px_rgba(255,107,0,0.5)]">
              <h2 className="text-2xl font-bold text-white mb-6">Rezervni dijelovi</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#1a1a1a] border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Naziv</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Marka</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Model</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Primjena</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Kataloški broj</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Isporuka</th>
                      <th className="px-4 py-3 text-right text-neutral-200 font-semibold">Cijena bez PDV-a</th>
                      <th className="px-4 py-3 text-right text-neutral-200 font-semibold">Cijena sa PDV-om</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 1</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 2</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 3</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 4</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 5</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 6</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Spec 7</th>
                      <th className="px-4 py-3 text-right text-neutral-200 font-semibold">Popust %</th>
                      <th className="px-4 py-3 text-left text-neutral-200 font-semibold">Link slike</th>
                      <th className="px-4 py-3 text-center text-neutral-200 font-semibold">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((part) => (
                      <tr key={part.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-neutral-100">{part.name}</td>
                        <td className="px-4 py-3 text-neutral-100">{part.brand}</td>
                        <td className="px-4 py-3 text-neutral-100">{part.model}</td>
                        <td className="px-4 py-3 text-neutral-100">{part.application}</td>
                        <td className="px-4 py-3 text-neutral-100">{part.catalogNumber}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              part.delivery === Availability.Available
                                ? 'bg-green-600 text-white'
                                : part.delivery === Availability.FifteenDays
                                ? 'bg-yellow-600 text-white'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {part.delivery === Availability.Available
                              ? 'Odmah'
                              : part.delivery === Availability.FifteenDays
                              ? '15 dana'
                              : 'Po dogovoru'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-100">{part.priceWithoutVAT.toFixed(2)} KM</td>
                        <td className="px-4 py-3 text-right text-neutral-100">{part.priceWithVAT.toFixed(2)} KM</td>
                        <td className="px-4 py-3 text-neutral-100">{part.technicalSpecs.spec1}</td>
                        <td className="px-4 py-3 text-neutral-100">{part.technicalSpecs.spec2}</td>
                        <td className="px-4 py-3 text-neutral-100">{part.technicalSpecs.spec3}</td>
                        <td className="px-4 py-3 text-neutral-100">{part.technicalSpecs.spec4}</td>
                        <td className="px-4 py-3 text-neutral-100">{part.technicalSpecs.spec5}</td>
                        <td className="px-4 py-3 text-neutral-100">{part.technicalSpecs.spec6}</td>
                        <td className="px-4 py-3 text-neutral-100">{part.technicalSpecs.spec7}</td>
                        <td className="px-4 py-3 text-right text-neutral-100">{part.discount.toFixed(2)}%</td>
                        <td className="px-4 py-3">
                          {part.imageUrl ? (
                            <a
                              href={part.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#ff6b00] hover:text-[#ff7f1a] hover:underline font-semibold"
                            >
                              Otvori
                            </a>
                          ) : (
                            <span className="text-neutral-500">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleEdit(part)}
                            className="bg-[#ff6b00] hover:bg-[#ff7f1a] text-white px-4 py-2 rounded-full mr-2 font-semibold transition-all hover:scale-105"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(part.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold transition-all hover:scale-105"
                          >
                            Obriši
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parts.length === 0 && (
                <p className="text-center py-8 text-neutral-400">Nema unesenih rezervnih dijelova</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
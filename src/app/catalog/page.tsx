async function fetchParts() {
  const res = await fetch("http://localhost:3000/api/parts", { next: { revalidate: 60 } });
  return res.json();
}

export default async function CatalogPage() {
  const parts = await fetchParts();
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Katalog dijelova</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {parts.map((p:any)=>(
          <article key={p.id} className="border rounded-2xl p-4 hover:shadow-sm transition">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3">
              {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />}
            </div>
            <div className="text-sm text-gray-500">{p.sku}</div>
            <h2 className="font-medium">{p.title}</h2>
            <div className="mt-1">{p.price} {p.currency}</div>
            {/* ovdje dodaj CTA: "Detalji", "Dodaj u korpu", itd. */}
          </article>
        ))}
      </div>
    </main>
  );
}
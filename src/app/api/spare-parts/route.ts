import { NextRequest, NextResponse } from 'next/server';
import { SparePart, Availability } from '@/types';

// Fallback data for when database is not available
const fallbackSpareParts: SparePart[] = [
  {
    id: 1,
    name: 'Filter ulja',
    brand: 'Caterpillar',
    model: '320D',
    catalogNumber: 'CAT-320D-FLT',
    application: 'Motor',
    delivery: Availability.Available,
    priceWithoutVAT: 38.89,
    priceWithVAT: 45.5,
    discount: 0,
    stock: 10,
    imageUrl: 'https://picsum.photos/seed/filter1/400/300',
    technicalSpecs: {
      spec1: 'Primjena: Motor',
      spec2: 'Model: 320D',
      spec3: 'Brend: Caterpillar',
      spec4: 'Kataloški broj: CAT-320D-FLT',
      spec5: 'Kapacitet: 10L',
      spec6: 'Visina: 150mm',
      spec7: 'Pakovanje: 1 komad',
    },
  },
  {
    id: 2,
    name: 'Zupčanik pogona',
    brand: 'Komatsu',
    model: 'PC200',
    catalogNumber: 'KMT-PC200-GEAR',
    application: 'Transmisija',
    delivery: Availability.FifteenDays,
    priceWithoutVAT: 1068.38,
    priceWithVAT: 1250,
    discount: 0,
    stock: 5,
    imageUrl: 'https://picsum.photos/seed/gear1/400/300',
    technicalSpecs: {
      spec1: 'Primjena: Transmisija',
      spec2: 'Model: PC200',
      spec3: 'Brend: Komatsu',
      spec4: 'Kataloški broj: KMT-PC200-GEAR',
      spec5: 'Materijal: Kaljeni čelik',
      spec6: 'Broj zuba: 28',
      spec7: 'Pakovanje: 1 komad',
    },
  },
  {
    id: 3,
    name: 'Injektor goriva',
    brand: 'Volvo',
    model: 'EC210',
    catalogNumber: 'VLV-EC210-INJ',
    application: 'Motor',
    delivery: Availability.Available,
    priceWithoutVAT: 727.14,
    priceWithVAT: 850.75,
    discount: 0,
    stock: 8,
    imageUrl: 'https://picsum.photos/seed/injector1/400/300',
    technicalSpecs: {
      spec1: 'Primjena: Motor',
      spec2: 'Model: EC210',
      spec3: 'Brend: Volvo',
      spec4: 'Kataloški broj: VLV-EC210-INJ',
      spec5: 'Tlak: 2000 bar',
      spec6: 'Tip: Common rail',
      spec7: 'Pakovanje: 1 komad',
    },
  },
  {
    id: 4,
    name: 'Hidraulična pumpa',
    brand: 'JCB',
    model: '3CX',
    catalogNumber: 'JCB-3CX-HYD',
    application: 'Hidraulika',
    delivery: Availability.OnRequest,
    priceWithoutVAT: 2735.04,
    priceWithVAT: 3200,
    discount: 0,
    stock: 2,
    imageUrl: 'https://picsum.photos/seed/pump1/400/300',
    technicalSpecs: {
      spec1: 'Primjena: Hidraulika',
      spec2: 'Model: 3CX',
      spec3: 'Brend: JCB',
      spec4: 'Kataloški broj: JCB-3CX-HYD',
      spec5: 'Protok: 160 L/min',
      spec6: 'Pritisak: 320 bar',
      spec7: 'Pakovanje: 1 komad',
    },
  },
  {
    id: 5,
    name: 'Set brtvi motora',
    brand: 'Cummins',
    model: 'QSB6.7',
    catalogNumber: 'CUM-QSB6.7-GSK',
    application: 'Motor',
    delivery: Availability.Available,
    priceWithoutVAT: 555.56,
    priceWithVAT: 650,
    discount: 0,
    stock: 15,
    imageUrl: 'https://picsum.photos/seed/gasket1/400/300',
    technicalSpecs: {
      spec1: 'Primjena: Motor',
      spec2: 'Model: QSB6.7',
      spec3: 'Brend: Cummins',
      spec4: 'Kataloški broj: CUM-QSB6.7-GSK',
      spec5: 'Set: 18 komada',
      spec6: 'Materijal: Grafit',
      spec7: 'Pakovanje: 1 komad',
    },
  },
  {
    id: 6,
    name: 'Filter zraka',
    brand: 'Fleetguard',
    model: 'AF25139M',
    catalogNumber: 'FLT-AF25139M-AIR',
    application: 'Motor',
    delivery: Availability.Available,
    priceWithoutVAT: 72.65,
    priceWithVAT: 85,
    discount: 0,
    stock: 20,
    imageUrl: 'https://picsum.photos/seed/airfilter/400/300',
    technicalSpecs: {
      spec1: 'Primjena: Motor',
      spec2: 'Model: AF25139M',
      spec3: 'Brend: Fleetguard',
      spec4: 'Kataloški broj: FLT-AF25139M-AIR',
      spec5: 'Efikasnost: 99%',
      spec6: 'Dimenzije: 420x220mm',
      spec7: 'Pakovanje: 1 komad',
    },
  },
  {
    id: 7,
    name: 'Starter motora',
    brand: 'Bosch',
    model: 'KB 24V',
    catalogNumber: 'BOS-KB24V-STR',
    application: 'Elektrika',
    delivery: Availability.FifteenDays,
    priceWithoutVAT: 615.38,
    priceWithVAT: 720,
    discount: 0,
    stock: 7,
    imageUrl: 'https://picsum.photos/seed/starter/400/300',
    technicalSpecs: {
      spec1: 'Primjena: Elektrika',
      spec2: 'Model: KB 24V',
      spec3: 'Brend: Bosch',
      spec4: 'Kataloški broj: BOS-KB24V-STR',
      spec5: 'Napon: 24V',
      spec6: 'Snaga: 5.4kW',
      spec7: 'Pakovanje: 1 komad',
    },
  },
  {
    id: 8,
    name: 'Gusjenica (link)',
    brand: 'Caterpillar',
    model: 'D6',
    catalogNumber: 'CAT-D6-TRK',
    application: 'Podvozje',
    delivery: Availability.Available,
    priceWithoutVAT: 153.85,
    priceWithVAT: 180,
    discount: 5,
    stock: 12,
    imageUrl: 'https://picsum.photos/seed/tracklink/400/300',
    technicalSpecs: {
      spec1: 'Primjena: Podvozje',
      spec2: 'Model: D6',
      spec3: 'Brend: Caterpillar',
      spec4: 'Kataloški broj: CAT-D6-TRK',
      spec5: 'Tvrdoća: 48 HRC',
      spec6: 'Težina: 22kg',
      spec7: 'Pakovanje: 1 komad',
    },
  },
  {
    id: 9,
    name: 'Klip i karika set',
    brand: 'Komatsu',
    model: 'S6D102E',
    catalogNumber: 'KMT-S6D102E-PST',
    application: 'Motor',
    delivery: Availability.OnRequest,
    priceWithoutVAT: 384.62,
    priceWithVAT: 450,
    discount: 0,
    stock: 3,
    imageUrl: 'https://picsum.photos/seed/piston/400/300',
    technicalSpecs: {
      spec1: 'Primjena: Motor',
      spec2: 'Model: S6D102E',
      spec3: 'Brend: Komatsu',
      spec4: 'Kataloški broj: KMT-S6D102E-PST',
      spec5: 'Promjer: 102mm',
      spec6: 'Materijal: Aluminij',
      spec7: 'Pakovanje: 1 komad',
    },
  },
  {
    id: 10,
    name: 'Turbopunjač',
    brand: 'Volvo',
    model: 'D6E',
    catalogNumber: 'VLV-D6E-TURBO',
    application: 'Motor',
    delivery: Availability.Available,
    priceWithoutVAT: 1794.87,
    priceWithVAT: 2100,
    discount: 3,
    stock: 4,
    imageUrl: 'https://picsum.photos/seed/turbo/400/300',
    technicalSpecs: {
      spec1: 'Primjena: Motor',
      spec2: 'Model: D6E',
      spec3: 'Brend: Volvo',
      spec4: 'Kataloški broj: VLV-D6E-TURBO',
      spec5: 'Pritisak: 1.6 bar',
      spec6: 'Hlađenje: Ulje',
      spec7: 'Pakovanje: 1 komad',
    },
  },
  {
    id: 11,
    name: 'Ventil hidraulike',
    brand: 'JCB',
    model: 'JS220',
    catalogNumber: 'JCB-JS220-VLV',
    application: 'Hidraulika',
    delivery: Availability.FifteenDays,
    priceWithoutVAT: 811.97,
    priceWithVAT: 950,
    discount: 0,
    stock: 6,
    imageUrl: 'https://picsum.photos/seed/valve/400/300',
    technicalSpecs: {
      spec1: 'Primjena: Hidraulika',
      spec2: 'Model: JS220',
      spec3: 'Brend: JCB',
      spec4: 'Kataloški broj: JCB-JS220-VLV',
      spec5: 'Pritisak: 310 bar',
      spec6: 'Kontrola: Proporcionalna',
      spec7: 'Pakovanje: 1 komad',
    },
  },
  {
    id: 12,
    name: 'Hladnjak vode',
    brand: 'Caterpillar',
    model: '330C',
    catalogNumber: 'CAT-330C-RAD',
    application: 'Hlađenje',
    delivery: Availability.Available,
    priceWithoutVAT: 1538.46,
    priceWithVAT: 1800,
    discount: 0,
    stock: 9,
    imageUrl: 'https://picsum.photos/seed/radiator/400/300',
    technicalSpecs: {
      spec1: 'Primjena: Hlađenje',
      spec2: 'Model: 330C',
      spec3: 'Brend: Caterpillar',
      spec4: 'Kataloški broj: CAT-330C-RAD',
      spec5: 'Materijal: Bakar',
      spec6: 'Protok: 220 L/min',
      spec7: 'Pakovanje: 1 komad',
    },
  },
];

let sparePartsData = [...fallbackSpareParts];

export async function GET() {
  try {
    // Try to use Vercel Blob for persistent storage
    try {
      const { head, put } = await import('@vercel/blob');
      const blob = await head('spare-parts-data.json');

      if (blob) {
        const response = await fetch(blob.url);
        const sparePartsData = await response.json();
        return NextResponse.json(sparePartsData);
      }
    } catch (blobError) {
      console.warn('Blob storage not available, trying database:', blobError);
    }

    // Fallback to database
    try {
      const { db } = await import('@/db');
      const { spareParts } = await import('@/db/schema');
      const result = await db.select().from(spareParts);
      const sparePartsData: SparePart[] = result.map((row: any) => ({
        id: row.id,
        name: row.name,
        brand: row.brand,
        model: row.model,
        catalogNumber: row.catalogNumber,
        application: row.application,
        delivery: row.delivery as Availability,
        priceWithoutVAT: row.priceWithoutVAT,
        priceWithVAT: row.priceWithVAT,
        discount: row.discount,
        imageUrl: row.imageUrl,
        stock: row.stock,
        technicalSpecs: {
          spec1: row.spec1,
          spec2: row.spec2,
          spec3: row.spec3,
          spec4: row.spec4,
          spec5: row.spec5,
          spec6: row.spec6,
          spec7: row.spec7,
        },
      }));
      return NextResponse.json(sparePartsData);
    } catch (dbError) {
      // If database fails, use fallback data
      console.warn('Database not available, using fallback data:', dbError);
      return NextResponse.json(sparePartsData);
    }
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    return NextResponse.json({ error: 'Failed to fetch spare parts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, brand, model, catalogNumber, application, delivery, priceWithoutVAT, priceWithVAT, discount, imageUrl, stock, technicalSpecs } = body;

    // Get current spare parts data
    let currentData: SparePart[] = [];
    try {
      const getResponse = await GET();
      if (getResponse.ok) {
        currentData = await getResponse.json();
      }
    } catch (error) {
      currentData = [...fallbackSpareParts];
    }

    // Create new spare part
    const newId = Math.max(...currentData.map(p => p.id), 0) + 1;
    const newSparePart: SparePart = {
      id: newId,
      name,
      brand,
      model,
      catalogNumber,
      application,
      delivery,
      priceWithoutVAT,
      priceWithVAT,
      discount,
      imageUrl,
      stock,
      technicalSpecs,
    };

    // Add to current data
    currentData.push(newSparePart);

    // Save to Vercel Blob
    try {
      const { put } = await import('@vercel/blob');
      await put('spare-parts-data.json', JSON.stringify(currentData), {
        access: 'public',
        contentType: 'application/json',
      });
    } catch (blobError) {
      console.warn('Blob storage failed, trying database:', blobError);
      // Fallback to database
      try {
        const { db } = await import('@/db');
        const { spareParts } = await import('@/db/schema');
        await db.insert(spareParts).values({
          name,
          brand,
          model,
          catalogNumber,
          application,
          delivery,
          priceWithoutVAT,
          priceWithVAT,
          discount,
          imageUrl,
          stock,
          spec1: technicalSpecs.spec1,
          spec2: technicalSpecs.spec2,
          spec3: technicalSpecs.spec3,
          spec4: technicalSpecs.spec4,
          spec5: technicalSpecs.spec5,
          spec6: technicalSpecs.spec6,
          spec7: technicalSpecs.spec7,
        });
      } catch (dbError) {
        console.warn('Database also failed, using in-memory storage:', dbError);
        sparePartsData.push(newSparePart);
      }
    }

    return NextResponse.json(newSparePart, { status: 201 });
  } catch (error) {
    console.error('Error creating spare part:', error);
    return NextResponse.json({ error: 'Failed to create spare part' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, brand, model, catalogNumber, application, delivery, priceWithoutVAT, priceWithVAT, discount, imageUrl, stock, technicalSpecs } = body;

    // Get current spare parts data
    let currentData: SparePart[] = [];
    try {
      const getResponse = await GET();
      if (getResponse.ok) {
        currentData = await getResponse.json();
      }
    } catch (error) {
      currentData = [...fallbackSpareParts];
    }

    // Find and update the spare part
    const index = currentData.findIndex(p => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Spare part not found' }, { status: 404 });
    }

    const updatedSparePart: SparePart = {
      id,
      name,
      brand,
      model,
      catalogNumber,
      application,
      delivery,
      priceWithoutVAT,
      priceWithVAT,
      discount,
      imageUrl,
      stock,
      technicalSpecs,
    };

    currentData[index] = updatedSparePart;

    // Save to Vercel Blob
    try {
      const { put } = await import('@vercel/blob');
      await put('spare-parts-data.json', JSON.stringify(currentData), {
        access: 'public',
        contentType: 'application/json',
      });
    } catch (blobError) {
      console.warn('Blob storage failed, trying database:', blobError);
      // Fallback to database
      try {
        const { db } = await import('@/db');
        const { spareParts } = await import('@/db/schema');
        const { eq } = await import('drizzle-orm');
        await db.update(spareParts).set({
          name,
          brand,
          model,
          catalogNumber,
          application,
          delivery,
          priceWithoutVAT,
          priceWithVAT,
          discount,
          imageUrl,
          stock,
          spec1: technicalSpecs.spec1,
          spec2: technicalSpecs.spec2,
          spec3: technicalSpecs.spec3,
          spec4: technicalSpecs.spec4,
          spec5: technicalSpecs.spec5,
          spec6: technicalSpecs.spec6,
          spec7: technicalSpecs.spec7,
        }).where(eq(spareParts.id, id));
      } catch (dbError) {
        console.warn('Database also failed, using in-memory storage:', dbError);
        sparePartsData[index] = updatedSparePart;
      }
    }

    return NextResponse.json(updatedSparePart);
  } catch (error) {
    console.error('Error updating spare part:', error);
    return NextResponse.json({ error: 'Failed to update spare part' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const partId = parseInt(id);

    // Get current spare parts data
    let currentData: SparePart[] = [];
    try {
      const getResponse = await GET();
      if (getResponse.ok) {
        currentData = await getResponse.json();
      }
    } catch (error) {
      currentData = [...fallbackSpareParts];
    }

    // Find and remove the spare part
    const index = currentData.findIndex(p => p.id === partId);
    if (index === -1) {
      return NextResponse.json({ error: 'Spare part not found' }, { status: 404 });
    }

    currentData.splice(index, 1);

    // Save to Vercel Blob
    try {
      const { put } = await import('@vercel/blob');
      await put('spare-parts-data.json', JSON.stringify(currentData), {
        access: 'public',
        contentType: 'application/json',
      });
    } catch (blobError) {
      console.warn('Blob storage failed, trying database:', blobError);
      // Fallback to database
      try {
        const { db } = await import('@/db');
        const { spareParts } = await import('@/db/schema');
        const { eq } = await import('drizzle-orm');
        await db.delete(spareParts).where(eq(spareParts.id, partId));
      } catch (dbError) {
        console.warn('Database also failed, using in-memory storage:', dbError);
        const memIndex = sparePartsData.findIndex(p => p.id === partId);
        if (memIndex !== -1) {
          sparePartsData.splice(memIndex, 1);
        }
      }
    }

    return NextResponse.json({ message: 'Spare part deleted successfully' });
  } catch (error) {
    console.error('Error deleting spare part:', error);
    return NextResponse.json({ error: 'Failed to delete spare part' }, { status: 500 });
  }
}
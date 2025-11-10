import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { spareParts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SparePart, Availability } from '@/types';

export async function GET() {
  try {
    const result = await db.select().from(spareParts);
    const sparePartsData: SparePart[] = result.map(row => ({
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
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    return NextResponse.json({ error: 'Failed to fetch spare parts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, brand, model, catalogNumber, application, delivery, priceWithoutVAT, priceWithVAT, discount, imageUrl, technicalSpecs } = body;

    const result = await db.insert(spareParts).values({
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
      spec1: technicalSpecs.spec1,
      spec2: technicalSpecs.spec2,
      spec3: technicalSpecs.spec3,
      spec4: technicalSpecs.spec4,
      spec5: technicalSpecs.spec5,
      spec6: technicalSpecs.spec6,
      spec7: technicalSpecs.spec7,
    }).returning();

    const newSparePart: SparePart = {
      id: result[0].id,
      name: result[0].name,
      brand: result[0].brand,
      model: result[0].model,
      catalogNumber: result[0].catalogNumber,
      application: result[0].application,
      delivery: result[0].delivery as Availability,
      priceWithoutVAT: result[0].priceWithoutVAT,
      priceWithVAT: result[0].priceWithVAT,
      discount: result[0].discount,
      imageUrl: result[0].imageUrl,
      technicalSpecs: {
        spec1: result[0].spec1,
        spec2: result[0].spec2,
        spec3: result[0].spec3,
        spec4: result[0].spec4,
        spec5: result[0].spec5,
        spec6: result[0].spec6,
        spec7: result[0].spec7,
      },
    };

    return NextResponse.json(newSparePart, { status: 201 });
  } catch (error) {
    console.error('Error creating spare part:', error);
    return NextResponse.json({ error: 'Failed to create spare part' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, brand, model, catalogNumber, application, delivery, priceWithoutVAT, priceWithVAT, discount, imageUrl, technicalSpecs } = body;

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
      spec1: technicalSpecs.spec1,
      spec2: technicalSpecs.spec2,
      spec3: technicalSpecs.spec3,
      spec4: technicalSpecs.spec4,
      spec5: technicalSpecs.spec5,
      spec6: technicalSpecs.spec6,
      spec7: technicalSpecs.spec7,
    }).where(eq(spareParts.id, id));

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
      technicalSpecs,
    };

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

    await db.delete(spareParts).where(eq(spareParts.id, parseInt(id)));
    return NextResponse.json({ message: 'Spare part deleted successfully' });
  } catch (error) {
    console.error('Error deleting spare part:', error);
    return NextResponse.json({ error: 'Failed to delete spare part' }, { status: 500 });
  }
}
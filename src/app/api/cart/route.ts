import { NextRequest, NextResponse } from 'next/server';
import { CartItem } from '@/types';

// Generate a unique cart ID for anonymous users
function generateCartId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get cart ID from cookies or generate new one
function getCartId(request: NextRequest): string {
  const cookie = request.cookies.get('japanStrojCartId');
  return cookie?.value || generateCartId();
}

export async function GET(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    console.log('[GET] Cart ID:', cartId);
    console.log('[GET] Cookies:', request.cookies.getAll());

    try {
      const { db } = await import('@/db');
      const { carts } = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');

      const result = await db.select().from(carts).where(eq(carts.id, cartId)).limit(1);
      console.log('[GET] Database query result:', result);
      if (result.length > 0) {
        const cartData = JSON.parse(result[0].data);
        console.log('[GET] Returning cart from database:', cartData);
        return NextResponse.json(cartData);
      } else {
        console.log('[GET] No cart found in database for ID:', cartId);
      }
    } catch (dbError) {
      console.error('Database failed for cart retrieval:', dbError);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cartItems: CartItem[] = await request.json();
    const cartId = getCartId(request);
    console.log('[POST] Cart ID:', cartId);
    console.log('[POST] Cookies:', request.cookies.getAll());
    console.log('[POST] Cart items count:', cartItems.length);

    try {
      const { db } = await import('@/db');
      const { carts } = await import('@/db/schema');
      const now = new Date();

      await db.insert(carts).values({
        id: cartId,
        data: JSON.stringify(cartItems),
        createdAt: now,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: carts.id,
        set: {
          data: JSON.stringify(cartItems),
          updatedAt: now,
        },
      });

      console.log('[POST] Saved to database, cart ID:', cartId);

      const response = NextResponse.json({ success: true });
      response.cookies.set('japanStrojCartId', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });

      console.log('[POST] Cookie set for cart ID:', cartId);

      return response;
    } catch (dbError) {
      console.error('Database failed:', dbError);
      const response = NextResponse.json({ success: true });
      response.cookies.set('japanStrojCartId', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }
  } catch (error) {
    console.error('Error saving cart:', error);
    return NextResponse.json({ error: 'Failed to save cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cartId = getCartId(request);

    try {
      const { db } = await import('@/db');
      const { carts } = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');

      await db.delete(carts).where(eq(carts.id, cartId));
    } catch (dbError) {
      console.warn('Database deletion failed:', dbError);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('japanStrojCartId', '', { maxAge: 0 });

    return response;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
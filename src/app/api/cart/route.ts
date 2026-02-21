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

    try {
      const { db, withRetry } = await import('@/db');
      const { carts } = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');

      const result = await withRetry(async () => 
        db.select().from(carts).where(eq(carts.id, cartId)).limit(1)
      );
      
      if (result.length > 0) {
        const cartData = JSON.parse(result[0].data);
        return NextResponse.json(cartData);
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

    try {
      const { db, withRetry } = await import('@/db');
      const { carts } = await import('@/db/schema');
      const now = new Date();

      await withRetry(async () => 
        db.insert(carts).values({
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
        })
      );

      const response = NextResponse.json({ success: true });
      response.cookies.set('japanStrojCartId', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });

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
      const { db, withRetry } = await import('@/db');
      const { carts } = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');

      await withRetry(async () => 
        db.delete(carts).where(eq(carts.id, cartId))
      );
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

import { NextRequest, NextResponse } from 'next/server';
import { put, head, del } from '@vercel/blob';
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
    const blobUrl = `cart-${cartId}.json`;

    try {
      // Try to get existing cart from blob storage first
      const blob = await head(blobUrl);
      if (blob) {
        // Fetch the actual content
        const response = await fetch(blob.url);
        const cartData = await response.json();
        return NextResponse.json(cartData);
      }
    } catch (blobError) {
      console.log('[GET] Blob storage failed, trying database...');
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
        console.warn('Both blob and database failed for cart retrieval:', { blobError, dbError });
      }
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

    // Try to save to Vercel Blob first
    try {
      const blobUrl = `cart-${cartId}.json`;
      const blob = await put(blobUrl, JSON.stringify(cartItems), {
        access: 'public',
        contentType: 'application/json',
      });

      // Set cart ID cookie for future requests
      const response = NextResponse.json({ success: true, url: blob.url });
      response.cookies.set('japanStrojCartId', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    } catch (blobError) {
      console.log('[POST] Blob storage failed, trying database...');
    }

    // Fallback to database if blob fails
    try {
      const { db } = await import('@/db');
      const { carts } = await import('@/db/schema');
      const now = new Date();

      const result = await db.insert(carts).values({
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
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      console.log('[POST] Cookie set for cart ID:', cartId);

      return response;
    } catch (dbError) {
      console.warn('Database also failed, using localStorage fallback:', dbError);
      // For development, just return success since localStorage will be used
      const response = NextResponse.json({ success: true });
      response.cookies.set('japanStrojCartId', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
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
    const blobUrl = `cart-${cartId}.json`;

    // Delete from blob storage
    try {
      await del(blobUrl);
    } catch (error) {
      // Blob might not exist, that's okay
      console.log('Cart blob not found for deletion');
    }

    // Also delete from database backup
    try {
      const { db } = await import('@/db');
      const { carts } = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');

      await db.delete(carts).where(eq(carts.id, cartId));
    } catch (dbError) {
      console.warn('Database deletion failed:', dbError);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('japanStrojCartId', '', { maxAge: 0 }); // Clear cookie

    return response;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
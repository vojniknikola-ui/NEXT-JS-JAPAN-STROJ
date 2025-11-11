# Japan Stroj - Rezervni Dijelovi - UPUTE

Kompletan Next.js App Router projekt sa Neon Postgres bazom, Vercel Blob upload-om, admin autentikacijom i CRUD API-em za rezervne dijelove.

---

## 📋 Pregled Arhitekture

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Baza**: Neon Postgres (serverless) preko `@neondatabase/serverless`
- **ORM**: Drizzle ORM + drizzle-kit za migracije
- **Storage**: Vercel Blob za upload slika
- **Validacija**: Zod
- **Styling**: Tailwind CSS v4
- **Autentikacija**: Minimalna cookie-based admin auth (`ADMIN_PASSWORD`)

---

## 🚀 STEP-BY-STEP SETUP

### 1. Instalirane Zavisnosti

Sve zavisnosti su već instalirane:

```bash
npm install
```

**Paketi**:
- `@neondatabase/serverless` - Neon HTTP driver
- `drizzle-orm` + `drizzle-kit` - ORM + migracije
- `@vercel/blob` - Vercel Blob storage
- `zod` - Validacija
- `tsx` - TypeScript executor za skripte

---

### 2. Environment Varijable

#### Lokalno (`.env.local`)

```env
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
ADMIN_PASSWORD=citybar
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Vercel (Production)

U Vercel Project Settings → Environment Variables dodaj:

- `DATABASE_URL` - Neon connection string (pooled connection sa `?sslmode=require`)
- `ADMIN_PASSWORD` - Sigurna lozinka za admin
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token (automatski iz integracije)
- `NEXT_PUBLIC_BASE_URL` - Production URL (npr. `https://japan-stroj.vercel.app`)

---

### 3. Database Setup

#### 3.1 Kreiranje Tabela

Izvršiti migracije:

```bash
npm run db:push
# ili manuelno:
./node_modules/.bin/tsx ./scripts/apply-migration.ts
```

Ovo kreira:
- `categories` tabelu (id, name, slug UNIQUE, created_at)
- `parts` tabelu (id, sku UNIQUE, title, description, price, currency, stock, category_id, image_url, thumb_url, spec_json, is_active, created_at, updated_at)

#### 3.2 Seed Podataka (opcionalno)

```bash
npm run seed
```

Dodaje demo kategoriju "Hidraulika" i jedan test dio.

---

## 📁 Struktura Projekta

```
/src
  /app
    /admin
      /login
        page.tsx          # Client admin login forma
      /parts
        page.tsx          # Admin CRUD za dijelove
    /api
      /admin-login
        route.ts          # POST: provjera ADMIN_PASSWORD, postavi cookie
      /parts
        route.ts          # GET (lista+pretraga) | POST (create)
        /[id]
          route.ts        # GET | PATCH | DELETE po id
      /upload
        route.ts          # POST: Vercel Blob upload slika
      /categories
        route.ts          # GET: lista kategorija
    /catalog
      page.tsx            # SSR javni katalog (fetch /api/parts, revalidate 60s)
    page.tsx              # Landing stranica
  /db
    index.ts              # Neon connection + drizzle({ schema })
    schema.ts             # Drizzle pgTable definicije (categories, parts, carts)
  /lib
    validation.ts         # Zod sheme (partCreateSchema, partUpdateSchema)

/scripts
  seed.ts                 # Seed skripta za pocetne podatke
  apply-migration.ts      # Manual SQL migracije (CREATE TABLE IF NOT EXISTS)

middleware.ts             # Zaštita /admin ruta (provjera cookie "admin=1")
drizzle.config.ts         # Drizzle Kit konfiguracija (schema, dialect, dbCredentials)
```

---

## 🔐 Autentikacija

### Admin Login Flow

1. Korisnik otvara `/admin/login`
2. Unosi password → POST `/api/admin-login`
3. Server provjera `password === process.env.ADMIN_PASSWORD`
4. Ako OK → postavlja cookie `admin=1; HttpOnly; SameSite=Lax; Max-Age=86400`
5. Middleware na `/admin/*` provjera cookie → redirect na login ako nema

---

## 🛠️ API Endpoints

### `GET /api/parts`

**Query params**:
- `q` - pretraga po title (ilike)
- `categoryId` - filter po kategoriji

**Response**:
```json
[
  {
    "id": 1,
    "sku": "HYD-001",
    "title": "Hidraulična pumpa P350",
    "price": "450.00",
    "currency": "EUR",
    "stock": 15,
    "imageUrl": "https://...",
    "isActive": true,
    "category": "Hidraulika"
  }
]
```

### `POST /api/parts`

**Body**:
```json
{
  "sku": "HYD-002",
  "title": "Filter ulja",
  "description": "Opis...",
  "price": 120.50,
  "currency": "EUR",
  "stock": 10,
  "categoryId": 1,
  "imageUrl": "https://...",
  "isActive": true
}
```

**Response**: `{ "id": 2 }`

### `GET /api/parts/[id]`

Vraća kompletan dio po ID-u.

### `PATCH /api/parts/[id]`

Partial update (šalje samo polja koja se mijenjaju).

### `DELETE /api/parts/[id]`

Briše dio.

### `POST /api/upload`

**Multipart form-data**: `file`

**Response**:
```json
{ "url": "https://vercel-blob.com/..." }
```

---

## 📦 Vercel Deploy

### 1. Poveži Repo na Vercel

- Vercel Dashboard → New Project → Import Git Repository

### 2. Environment Variables

Dodaj sve varijable iz `.env.example`:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_BASE_URL`

### 3. Vercel Blob Integration

- Vercel → Project → Storage → Create Blob Store
- Automatski će dodati `BLOB_READ_WRITE_TOKEN`

### 4. Neon Database

- Neon Console → Create Project
- Connection string (pooled) sa `?sslmode=require`
- Dodaj kao `DATABASE_URL` u Vercel env

### 5. Deploy

Vercel automatski build i deploy na svaki push.

---

## ✅ Test Plan

### Lokalno

1. **Migracije**:
   ```bash
   npm run db:push
   # Ili:
   ./node_modules/.bin/tsx ./scripts/apply-migration.ts
   ```
   Očekujem: Bez errora, tabele kreirane.

2. **Seed**:
   ```bash
   npm run seed
   ```
   Očekujem: Demo kategorija i dio dodani.

3. **Dev server**:
   ```bash
   npm run dev
   ```
   Otvori `http://localhost:3000`

4. **Admin login**:
   - Idi na `/admin/login`
   - Unesi password (`citybar` ili vrijednost iz `ADMIN_PASSWORD`)
   - Očekujem: Redirect na `/admin/parts`

5. **Upload slika**:
   - U admin panel, odaberi file → klikni "Spremi"
   - Očekujem: POST `/api/upload` vraća URL, dio se kreira

6. **Lista dijelova**:
   - GET `/api/parts`
   - Očekujem: JSON array sa dodanim dijelom

7. **Javni katalog**:
   - Otvori `/catalog`
   - Očekujem: SSR lista dijelova sa slikom, sku, cijena

8. **Unique constraint**:
   - Pokušaj dodati dio sa istim SKU
   - Očekujem: Error (unique violation) ili validacija

### Production (Vercel)

- Deploy → otvori production URL
- Provjeri `/admin/login` → dodaj dio → provjeri `/catalog`
- Provjeri da Vercel Blob upload radi

---

## 🗂️ Database Schema

### `categories`

| Column     | Type         | Constraints          |
|------------|--------------|----------------------|
| id         | serial       | PRIMARY KEY          |
| name       | varchar(120) | NOT NULL             |
| slug       | varchar(140) | NOT NULL, **UNIQUE** |
| created_at | timestamp    | DEFAULT now()        |

### `parts`

| Column       | Type            | Constraints                    |
|--------------|-----------------|--------------------------------|
| id           | serial          | PRIMARY KEY                    |
| sku          | varchar(64)     | NOT NULL, **UNIQUE**           |
| title        | varchar(200)    | NOT NULL                       |
| description  | text            |                                |
| price        | numeric(10,2)   | NOT NULL                       |
| currency     | varchar(3)      | NOT NULL, DEFAULT 'EUR'        |
| stock        | integer         | NOT NULL, DEFAULT 0            |
| category_id  | integer         | NOT NULL, FK → categories(id)  |
| image_url    | text            |                                |
| thumb_url    | text            |                                |
| spec_json    | text            |                                |
| is_active    | boolean         | NOT NULL, DEFAULT true         |
| created_at   | timestamp       | DEFAULT now()                  |
| updated_at   | timestamp       | DEFAULT now()                  |

---

## 🔧 Drizzle Skripte

```json
{
  "db:generate": "drizzle-kit generate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
  "seed": "tsx scripts/seed.ts"
}
```

- `db:generate` - Generiraj SQL migracije iz schema.ts
- `db:push` - Pushaj schema promjene direktno u bazu (development)
- `db:studio` - Pokreni Drizzle Studio (GUI za bazu)
- `seed` - Ubaci demo podatke

---

## 🎯 Što Dalje (Roadmap)

1. **PATCH/DELETE UI** u admin panelu (trenutno samo TODO komentar)
2. **CRUD za Categories** (admin ruta `/admin/categories`)
3. **Kompatibilnost sa Mašinama**:
   - Nova tabela `machines` (brand, model, series)
   - Tabela `part_compatibility` (part_id, machine_id)
   - M2M veza
4. **Trigram pretraga** (Postgres `pg_trgm` ekstenzija za fuzzy search)
5. **Detalj stranica** `/part/[sku]` ili `/product/[id]` sa SEO
6. **ISR** ili on-demand revalidation za catalog
7. **RBAC** - NextAuth.js umjesto cookie auth
8. **Thumbnail generation** - Sharp/Image resize za optimizaciju
9. **Validacija upload-a** (MIME type, file size limit)

---

## 📝 Napomene

- **Unique Constraint Error**: Ako pokušate dodati dio sa istim SKU, PostgreSQL će vratiti error. U budućnosti dodati validaciju u UI.
- **BLOB_READ_WRITE_TOKEN**: Na Vercelu dolazi automatski iz integracije, lokalno morate manuelno dodati.
- **SSR Katalog**: `/catalog` koristi `fetch` sa `{ next: { revalidate: 60 } }` za 60s cache.
- **Middleware**: Zaštita `/admin/*` ruta; ako nema cookie redirect na `/admin/login?next=...`.

---

## 🆘 Troubleshooting

### Error: `DATABASE_URL missing`

Provjerite da `.env.local` postoji i sadrži `DATABASE_URL`.

### Error: `BLOB_READ_WRITE_TOKEN undefined`

- Lokalno: dodaj u `.env.local`
- Vercel: kreiraj Blob Store i povežite integraciju

### Drizzle Push pita "create or rename table?"

Koristite `./node_modules/.bin/tsx ./scripts/apply-migration.ts` za manuelno kreiranje tabela.

### Admin redirect loop

Obrišite cookies i ponovo se prijavite.

---

## 📧 Kontakt

Za pitanja ili probleme, kontaktirajte dev team.

---

**Verzija**: 1.0  
**Zadnje ažurirano**: 11.11.2024

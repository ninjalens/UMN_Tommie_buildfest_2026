# Food Hub One-Stop

One-stop web app for food relief: connects **Patron** (recipients), **Provider** (hubs/staff), and **Supplier** (suppliers) with shared food data and automated pickup flow to reduce back-and-forth.

## Roles

| Role | Flow |
|------|------|
| **Patron** | Choose Provider → Add food to cart → Generate pickup QR Code → Show at hub to collect |
| **Provider** | View pending orders at your hub → Enter order ID to confirm pickup → Inventory updates automatically |
| **Supplier** | See each Provider’s inventory status (green / yellow / red), sorted by need for restock priority |

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**
- **JSON file store**: `data/foodhub.json` (no DB setup, runs on any Node version)
- **QR Code**: `qrcode` for pickup codes

## Quick start

```bash
# Install dependencies
npm install

# Seed sample hubs and inventory (optional; first visit also creates data/foodhub.json)
npm run db:seed

# Dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose your role:

- **Patron** → Pick hub → Add to cart → Generate pickup code
- **Provider** → Pick hub → View orders → Enter order ID to confirm pickup
- **Supplier** → View hub inventory status and restock priority

## Data flow

1. Patron places order → order and QR are created (order ID encoded in QR).
2. Provider staff prepare items; Patron shows QR at hub; staff enter order ID and confirm pickup.
3. Confirming pickup deducts that Provider’s inventory.
4. Supplier sees real-time hub inventory and red/yellow/green status to prioritize restocking.

The first visit or `npm run db:seed` creates `data/foodhub.json` with 3 sample hubs and 6 food types.

## Project structure

- `src/app/` — Home (role pick), `/patron`, `/provider`, `/supplier` pages
- `src/app/api/` — Hub list, inventory, create order, confirm pickup, supplier inventory summary
- `src/lib/db.ts` — JSON store and business logic
- `src/lib/seed.ts` — Seed script

---

UMN Tommie Buildfest 2026 · Inspired by inventory transparency and QR pickup ideas from [Food Insecurity Hackathon Data Strategy].

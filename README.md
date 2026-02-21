# Food Hub One-Stop Developer Documentation

## System Architecture

This application is built using Next.js 15 (App Router) and TypeScript, utilizing a local filesystem-based data store. It is designed to facilitate food relief by connecting Patrons, Providers, and Suppliers through a shared inventory and automated pickup flow.

### Data Management Layer
* **Storage Strategy**: The application uses a local JSON file located at `data/foodhub.json` as the primary data store.
* **Persistence Logic**: The `src/lib/db.ts` file handles all I/O operations using Node.js `fs` and `path` modules.
* **Serverless Compatibility**: The system detects the `VERCEL` environment variable; if set to "1", it defaults to an in-memory `memoryStore` to bypass read-only filesystem restrictions.
* **State Initialization**: Database initialization is managed via `initDb()`, which is called at the start of API requests to ensure the store is loaded.

### Core Data Models
The system defines several TypeScript interfaces in `src/lib/db.ts`:
* **Provider**: Represents a hub with an ID, name, and address.
* **FoodItem**: Defines food products and their measurement units.
* **ProviderInventoryRow**: Maps food items to specific providers with quantity and restock thresholds (`threshold_low`, `threshold_medium`).
* **Order**: Tracks the lifecycle of a pickup request (`pending`, `prepared`, `picked_up`) and stores encoded QR data.

---

## Technical Workflows

### Order and Pickup Flow
1.  **Creation**: The `createOrder` function validates stock levels against the provider's inventory before pushing a new order and its associated items to the store.
2.  **QR Generation**: Orders generate a `qr_data` string containing the `orderId`, `providerId`, and a timestamp.
3.  **Confirmation**: The `confirmPickup` function validates the order status and provider ID, then deducts the ordered quantities from the provider's inventory.

### Supplier Inventory Monitoring
The supplier interface performs real-time status aggregation:
* **Priority Sorting**: Providers are sorted by urgency based on "red" (critical) and "yellow" (low) stock counts.
* **Data Fetching**: The frontend uses client-side `useEffect` hooks to fetch data from `/api/supplier/inventory`.
* **Polling**: To maintain up-to-date status, the interface implements a `setInterval` that refreshes the data every 10,000ms.

---

## Development Roadmap

### Planned Feature: Inventory Check-In/Check-Out
* **Database Extension**: Implement a function in `db.ts` to increment `ProviderInventoryRow.quantity` for restock events.
* **OCR Integration**: Developers should integrate a library like Tesseract.js or a cloud-based Vision API to scan packing slips or labels to automate the check-in process.

### Planned Feature: Navigation Integration
* **Routing**: Leverage the `address` field in the `Provider` type to generate Google Maps deep links.
* **Public Transit**: Implement the Google Maps JavaScript API to provide Patrons with real-time public transportation routes to their selected hub.

---

## Setup and Contribution

### Local Environment Setup
1.  **Install Dependencies**: Execute `npm install`.
2.  **Seed Data**: Run `npm run db:seed`. This executes `src/lib/seed.ts`, which deletes any existing `foodhub.json` and recreates the sample dataset.
3.  **Development Mode**: Run `npm run dev` to start the Next.js development server with Turbopack.

### Coding Standards
* **Logic Centralization**: All business logic affecting the data store (inventory updates, status calculations) must reside in `src/lib/db.ts`.
* **Type Safety**: New data structures must be added to the `Store` type and initialized in `getSeedStore()`.
* **API Handlers**: New endpoints should be placed in `src/app/api/` and must include `initDb()` calls to maintain data consistency.
# FitFuel Delivery — changelog

Version scheme: `YYYY-MM-DD.N` (date + same-day counter), the same as the
wholesale app. Before every push that changes an app:

```bash
node scripts/stamp-version.mjs        # stamps APP_VERSION + service-worker cache names
```

…then add an entry here. Each app's header shows its running version
(`name · vYYYY-MM-DD.N`), so "which build is this phone on?" is answerable at
a glance.

## v2026-09-13.4
- **Cash tab** (new `cash` right): driver cash on hand — collected minus handed
  over, with a "💵 Received" confirm when the office takes the cash — and
  **courier COD settlement**: tick the orders a TFM remittance covers and mark
  them settled + paid in Shopify. Balances count from 2026-09-13.
- **Push notifications** with a 🔔 bell in every header (admin, warehouse,
  driver): new order → allocate holders; courier failed attempt → fulfilment
  holders; anything coming back → returns holders; drivers get pinged when an
  order is allocated to them. iPhone needs the app on the Home Screen.
- **Order lookup** in Activity: search an order number for its full attempt
  history — who, when, GPS, proof photos, current whereabouts.
- **Driver day panel**: "Today: N delivered · X collected · 💵 cash with you".

## v2026-09-13.3
- Fulfillment, courier cards: buttons now read left-to-right as the physical
  flow — **📦 Book shipment** on the left, **✓ Courier collected** on the right,
  greyed out until the shipment is booked.

## v2026-09-13.2
- **Per-user rights**, same model as the wholesale app: the Admins tab is now
  **People** — every staff account gets capability rows (Allocate orders,
  Fulfillment & dispatch, Delivery queue, Returns, End-of-day summary, Activity
  log, Manage drivers, Manage people & rights) at **None / Read / Write / Edit**,
  with Save rights, per-row password reset, and disable. New people start with
  no rights; rights changes apply the next time the person signs in.
- Tabs and action buttons now follow the signed-in person's rights (the server
  enforces them on every route regardless). The old warehouse-account limitation
  became a rights preset, so warehouse staff keep exactly what they had.
- This release signs everyone out once (drivers included) — sign back in.

## v2026-09-13.1
- **Root launcher**: delivery.fitfuel.ae now shows a pick-your-app page
  (Driver / Warehouse / Admin) instead of redirecting straight to Driver.
- **Version stamping**: app version in every header, stamped by
  `scripts/stamp-version.mjs`, tracked in this file.
- **TFM Express courier lane** (admin + warehouse consoles):
  - Allocate tab: 🚛 TFM Express under a new "Couriers" group in the dropdown;
    moving a booked order away from the courier cancels its shipment.
  - Fulfillment tab: "📦 Book shipment" (creates the AWB with no fulfilment or
    customer message), "🖨 Label" (opens the AWB label PDF), and
    "✓ Courier collected" as the dispatch step at pickup.
  - Orders tab: courier orders show AWB + last TFM scan status, updated
    automatically by the backend poller.
  - Returns / Summary / Activity: courier actions appear as "TFM Express".

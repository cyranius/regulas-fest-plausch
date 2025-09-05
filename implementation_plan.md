# Implementation Plan

[Overview]
This plan will resolve the issue of duplicate guest entries in Supabase when a single guest brings multiple items, ensuring that each guest is counted only once.

The current data model stores guest information and item details in a single table (`rsvp_items`), leading to redundant guest data and incorrect attendee counts. To fix this, I will introduce a new `guests` table to store unique guest information and link it to the `rsvp_items` table with a foreign key. This will normalize the database schema and ensure data integrity.

[Types]
The database schema will be updated to include a new `guests` table and modify the existing `rsvp_items` table.

**New `guests` table:**
- `id`: UUID (Primary Key)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ
- `guest_name`: TEXT
- `contact`: TEXT
- `coming`: BOOLEAN
- `attendees_count`: INTEGER

**Modified `rsvp_items` table:**
- `guest_id`: UUID (Foreign Key to `guests.id`)
- `guest_name`: (removed)
- `contact`: (removed)
- `coming`: (removed)
- `attendees_count`: (removed)

[Files]
The following files will be created or modified:

- **New file:** `supabase/migrations/YYYYMMDDHHMMSS_add_guests_table.sql` - A new database migration to create the `guests` table and update the `rsvp_items` table.
- **Modified file:** `src/pages/Anmeldung.tsx` - The form submission logic will be updated to first create a guest entry, then associate items with that guest.
- **Modified file:** `src/integrations/supabase/types.ts` - The Supabase type definitions will be updated to reflect the new database schema.
- **Modified file:** `src/pages/Uebersicht.tsx` - The data fetching and display logic will be updated to work with the new schema.
- **Modified file:** `src/pages/Admin.tsx` - The data fetching and display logic will be updated to work with the new schema.

[Functions]
The following functions will be modified:

- `handleSubmit` in `src/pages/Anmeldung.tsx`: This function will be refactored to first insert a new guest into the `guests` table, and then insert the associated items into the `rsvp_items` table with the new `guest_id`.
- `loadData` in `src/pages/Anmeldung.tsx`: This function will be updated to fetch data from both the `guests` and `rsvp_items` tables and correctly calculate the number of available slots for each category.
- Data fetching functions in `src/pages/Uebersicht.tsx` and `src/pages/Admin.tsx`: These will be updated to join the `guests` and `rsvp_items` tables to display the correct information.

[Classes]
No classes will be added, modified, or removed.

[Dependencies]
No new dependencies will be added.

[Testing]
Manual testing will be required to verify the following:
- Submitting the form with one or more items creates a single guest entry and the correct number of item entries.
- The "Buffet-Übersicht" section on the `Anmeldung` page correctly displays the number of available slots.
- The `Uebersicht` and `Admin` pages display the correct data.

[Implementation Order]
1. Create the new database migration file (`supabase/migrations/YYYYMMDDHHMMSS_add_guests_table.sql`).
2. Apply the database migration.
3. Update the Supabase type definitions in `src/integrations/supabase/types.ts`.
4. Modify the `handleSubmit` and `loadData` functions in `src/pages/Anmeldung.tsx`.
5. Update the data fetching and display logic in `src/pages/Uebersicht.tsx`.
6. Update the data fetching and display logic in `src/pages/Admin.tsx`.
7. Manually test the changes.

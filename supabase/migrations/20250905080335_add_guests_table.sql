CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    guest_name TEXT NOT NULL,
    contact TEXT,
    coming BOOLEAN NOT NULL,
    attendees_count INTEGER NOT NULL
);

ALTER TABLE rsvp_items
ADD COLUMN guest_id UUID REFERENCES guests(id);

-- Backfill guest_id for existing rsvp_items
DO $$
DECLARE
    item RECORD;
    new_guest_id UUID;
BEGIN
    FOR item IN SELECT * FROM rsvp_items LOOP
        -- Check if a guest with the same name, contact, and coming status already exists
        SELECT id INTO new_guest_id FROM guests 
        WHERE guest_name = item.guest_name AND contact = item.contact AND coming = item.coming;

        -- If not, create a new guest
        IF new_guest_id IS NULL THEN
            INSERT INTO guests (guest_name, contact, coming, attendees_count)
            VALUES (item.guest_name, item.contact, item.coming, item.attendees_count)
            RETURNING id INTO new_guest_id;
        END IF;

        -- Update the rsvp_item with the guest_id
        UPDATE rsvp_items SET guest_id = new_guest_id WHERE id = item.id;
    END LOOP;
END $$;

ALTER TABLE rsvp_items
ALTER COLUMN guest_id SET NOT NULL;

ALTER TABLE rsvp_items
DROP COLUMN guest_name,
DROP COLUMN contact,
DROP COLUMN coming,
DROP COLUMN attendees_count;

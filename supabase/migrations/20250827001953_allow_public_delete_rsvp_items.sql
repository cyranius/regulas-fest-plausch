CREATE POLICY "Everyone can delete rsvp items"
ON public.rsvp_items
FOR DELETE
USING (true);

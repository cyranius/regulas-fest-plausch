-- Kategorien für Mitbringsel
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quota INTEGER NOT NULL DEFAULT 5,
  examples TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RSVP Einträge für Gäste
CREATE TABLE public.rsvp_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id),
  guest_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  item_title TEXT,
  servings INTEGER DEFAULT 1,
  diet_tags TEXT[] DEFAULT '{}',
  warm_needed BOOLEAN DEFAULT false,
  warm_notes TEXT,
  brings_utensils BOOLEAN DEFAULT false,
  coming BOOLEAN NOT NULL DEFAULT true,
  attendees_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvp_items ENABLE ROW LEVEL SECURITY;

-- Public read access für alle Daten (da es eine Familien-App ist)
CREATE POLICY "Everyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can view rsvp items" 
ON public.rsvp_items 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can create rsvp items" 
ON public.rsvp_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Everyone can update rsvp items" 
ON public.rsvp_items 
FOR UPDATE 
USING (true);

-- Admin kann alles ändern (später über App-Logic gesteuert)
CREATE POLICY "Allow all operations on categories" 
ON public.categories 
FOR ALL 
USING (true);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rsvp_items_updated_at
BEFORE UPDATE ON public.rsvp_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed-Daten für Kategorien
INSERT INTO public.categories (name, quota, examples, sort_order) VALUES
('Salate', 5, 'Caesar, Kartoffelsalat, Rüeblisalat', 1),
('Warme Gerichte vegetarisch', 3, 'Gemüse-Lasagne, Risotto', 2),
('Warme Gerichte mit Fleisch', 4, 'Geschnetzeltes, Hähnchen-Curry', 3),
('Beilagen', 4, 'Reis, Brot, Kartoffelgratin', 4),
('Dips & Aufstriche', 3, 'Hummus, Kräuterbutter, Tapenade', 5),
('Desserts', 6, 'Tiramisu, Obstsalat, Kuchen', 6);
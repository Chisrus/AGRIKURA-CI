
-- Table des projets agricoles
CREATE TABLE public.projets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titre TEXT NOT NULL,
    culture TEXT NOT NULL,
    localisation TEXT NOT NULL,
    humidite NUMERIC NOT NULL DEFAULT 0,
    temperature NUMERIC NOT NULL DEFAULT 0,
    rendement_estime NUMERIC NOT NULL DEFAULT 0,
    montant_besoin BIGINT NOT NULL DEFAULT 0,
    financement_actuel BIGINT NOT NULL DEFAULT 0,
    couleur_tag TEXT DEFAULT '#4CAF50',
    image_url TEXT,
    description TEXT,
    statut TEXT NOT NULL DEFAULT 'actif',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des conditions idéales par culture
CREATE TABLE public.conditions_ideales (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    culture TEXT NOT NULL UNIQUE,
    humidite_min NUMERIC NOT NULL,
    humidite_max NUMERIC NOT NULL,
    temp_min NUMERIC NOT NULL,
    temp_max NUMERIC NOT NULL
);

-- Table des investissements
CREATE TABLE public.investissements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    projet_id UUID NOT NULL REFERENCES public.projets(id) ON DELETE CASCADE,
    montant BIGINT NOT NULL,
    methode_paiement TEXT NOT NULL,
    statut TEXT NOT NULL DEFAULT 'en_attente',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.projets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions_ideales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investissements ENABLE ROW LEVEL SECURITY;

-- Les projets et conditions sont publics en lecture
CREATE POLICY "Projets lisibles par tous" ON public.projets FOR SELECT USING (true);
CREATE POLICY "Conditions lisibles par tous" ON public.conditions_ideales FOR SELECT USING (true);

-- Les investissements sont publics en insertion (pas d'auth pour le moment)
CREATE POLICY "Investissements insérables par tous" ON public.investissements FOR INSERT WITH CHECK (true);
CREATE POLICY "Investissements lisibles par tous" ON public.investissements FOR SELECT USING (true);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projets_updated_at
    BEFORE UPDATE ON public.projets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

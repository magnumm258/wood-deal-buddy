ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS orcamento character varying DEFAULT '' NOT NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS urgencia character varying DEFAULT '' NOT NULL;
ALTER TABLE public.design_templates ADD COLUMN IF NOT EXISTS like_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.sync_template_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.design_templates SET like_count = like_count + 1 WHERE id = NEW.template_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.design_templates SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.template_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_template_like_count ON public.template_favorites;
CREATE TRIGGER trg_sync_template_like_count
AFTER INSERT OR DELETE ON public.template_favorites
FOR EACH ROW EXECUTE FUNCTION public.sync_template_like_count();

UPDATE public.design_templates t
   SET like_count = COALESCE((SELECT count(*) FROM public.template_favorites f WHERE f.template_id = t.id), 0);
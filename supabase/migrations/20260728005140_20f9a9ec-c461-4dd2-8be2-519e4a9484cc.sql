CREATE OR REPLACE FUNCTION public.enforce_locked_card_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tpl_design jsonb;
  editable text[];
  is_privileged boolean;
BEGIN
  -- Only company-owned cards are governed by company locks.
  IF NEW.company_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Owners / admins / managers of the company may edit freely.
  SELECT EXISTS (
    SELECT 1 FROM public.companies c
     WHERE c.id = NEW.company_id AND c.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.company_members m
     WHERE m.company_id = NEW.company_id
       AND m.user_id = auth.uid()
       AND m.role IN ('owner','admin','manager')
  ) INTO is_privileged;

  IF is_privileged OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT t.design INTO tpl_design
    FROM public.company_templates t
   WHERE t.id = NEW.company_template_id;

  IF tpl_design ? 'editableFields'
     AND jsonb_typeof(tpl_design->'editableFields') = 'array' THEN
    SELECT array_agg(value::text) INTO editable
      FROM jsonb_array_elements_text(tpl_design->'editableFields') AS value;
  ELSE
    editable := ARRAY['name','avatar_url','phone','whatsapp','email','bio'];
  END IF;
  editable := COALESCE(editable, ARRAY[]::text[]);

  -- Always company-owned
  NEW.company            := OLD.company;
  NEW.accent_color       := OLD.accent_color;
  NEW.template           := OLD.template;
  NEW.slug               := OLD.slug;
  NEW.design             := OLD.design;
  NEW.department         := OLD.department;
  NEW.company_id         := OLD.company_id;
  NEW.department_id      := OLD.department_id;
  NEW.company_template_id := OLD.company_template_id;
  NEW.card_type          := OLD.card_type;

  -- Per-field allow-list
  IF NOT ('name'       = ANY(editable)) THEN NEW.name       := OLD.name;       END IF;
  IF NOT ('title'      = ANY(editable)) THEN NEW.title      := OLD.title;      END IF;
  IF NOT ('avatar_url' = ANY(editable)) THEN NEW.avatar_url := OLD.avatar_url; END IF;
  IF NOT ('phone'      = ANY(editable)) THEN NEW.phone      := OLD.phone;      END IF;
  IF NOT ('whatsapp'   = ANY(editable)) THEN NEW.whatsapp   := OLD.whatsapp;   END IF;
  IF NOT ('email'      = ANY(editable)) THEN NEW.email      := OLD.email;      END IF;
  IF NOT ('website'    = ANY(editable)) THEN NEW.website    := OLD.website;    END IF;
  IF NOT ('address'    = ANY(editable)) THEN NEW.address    := OLD.address;    END IF;
  IF NOT ('bio'        = ANY(editable)) THEN NEW.bio        := OLD.bio;        END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_locked_card_fields ON public.cards;
CREATE TRIGGER enforce_locked_card_fields
BEFORE UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.enforce_locked_card_fields();
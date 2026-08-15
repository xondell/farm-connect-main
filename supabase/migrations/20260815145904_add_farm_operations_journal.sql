CREATE TABLE public.farm_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 180),
  operation_type TEXT NOT NULL CHECK (
    operation_type IN (
      'sowing',
      'irrigation',
      'treatment',
      'harvest',
      'processing',
      'logistics',
      'maintenance',
      'other'
    )
  ),
  field_name TEXT CHECK (field_name IS NULL OR char_length(field_name) <= 120),
  crop TEXT CHECK (crop IS NULL OR char_length(crop) <= 120),
  responsible TEXT CHECK (responsible IS NULL OR char_length(responsible) <= 160),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (
    status IN ('planned', 'in_progress', 'completed', 'cancelled')
  ),
  planned_start TIMESTAMPTZ NOT NULL,
  planned_end TIMESTAMPTZ,
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 2000),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (planned_end IS NULL OR planned_end >= planned_start)
);

CREATE INDEX farm_operations_user_start
  ON public.farm_operations(user_id, planned_start);
CREATE INDEX farm_operations_user_status
  ON public.farm_operations(user_id, status, planned_start);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.farm_operations TO authenticated;
GRANT ALL ON public.farm_operations TO service_role;

ALTER TABLE public.farm_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "farm_operations_own"
  ON public.farm_operations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER trg_farm_operations_updated
  BEFORE UPDATE ON public.farm_operations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

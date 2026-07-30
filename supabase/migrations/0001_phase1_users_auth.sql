-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'sales', 'delivery', 'accountant');

-- 2. Create Users Table (extends auth.users)
-- This table securely holds business data about the user, bridging to Supabase Auth.
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'sales',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Audit Log Table
-- Immutable ledger for sensitive actions (sales, stock adjustments).
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for users
-- Anyone authenticated can read basic user info (needed for assigning sales/deliveries)
CREATE POLICY "Users are viewable by authenticated users"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- Only owners can update roles or names
CREATE POLICY "Only owners can update users"
  ON public.users FOR UPDATE
  TO authenticated
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner' );

-- 6. RLS Policies for audit_log
-- Any authenticated user can insert logs via the app (must match their own user_id)
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only owners and accountants can view the audit ledger
CREATE POLICY "Owners and accountants can view audit logs"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) IN ('owner', 'accountant') );

-- 7. Trigger to automatically create a public.users profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'sales'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

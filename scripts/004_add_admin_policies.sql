-- Add role column to profiles table for admin access control
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Add admin policies for full access to all tables
-- Admin policies for profiles table
CREATE POLICY "admin_full_access_profiles" ON public.profiles 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policies for competitions table
CREATE POLICY "admin_full_access_competitions" ON public.competitions 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policies for registrations table
CREATE POLICY "admin_full_access_registrations" ON public.registrations 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin policies for team_members table
CREATE POLICY "admin_full_access_team_members" ON public.team_members 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add public read access for competitions
CREATE POLICY "competitions_public_read" ON public.competitions 
  FOR SELECT USING (is_active = true);

-- Enable RLS on competitions table
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_competition ON public.registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_team_members_registration ON public.team_members(registration_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON public.registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

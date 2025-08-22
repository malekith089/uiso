-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  school_institution TEXT NOT NULL,
  education_level TEXT NOT NULL CHECK (education_level IN ('SMA/Sederajat', 'Mahasiswa/i')),
  identity_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- Create competitions table
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  target_level TEXT NOT NULL CHECK (target_level IN ('SMA/Sederajat', 'Mahasiswa/i')),
  participant_type TEXT NOT NULL CHECK (participant_type IN ('Individual', 'Team')),
  max_team_members INTEGER DEFAULT 1,
  registration_start TIMESTAMP WITH TIME ZONE,
  registration_end TIMESTAMP WITH TIME ZONE,
  competition_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default competitions
INSERT INTO public.competitions (name, code, description, target_level, participant_type, max_team_members) VALUES
('Olimpiade Sains Pelajar', 'OSP', 'Kompetisi sains untuk siswa SMA/Sederajat', 'SMA/Sederajat', 'Individual', 1),
('Esai Gagasan Kritis', 'EGK', 'Kompetisi esai untuk mahasiswa', 'Mahasiswa/i', 'Individual', 1),
('Study Case Competition', 'SCC', 'Kompetisi studi kasus untuk mahasiswa', 'Mahasiswa/i', 'Team', 3);

-- Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  team_name TEXT,
  team_size INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  identity_card_url TEXT,
  engagement_proof_url TEXT,
  payment_proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, competition_id)
);

-- Enable RLS for registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for registrations
CREATE POLICY "registrations_select_own" ON public.registrations 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "registrations_insert_own" ON public.registrations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "registrations_update_own" ON public.registrations 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  identity_number TEXT NOT NULL,
  identity_card_url TEXT,
  member_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for team members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for team members
CREATE POLICY "team_members_select_own" ON public.team_members 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = registration_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "team_members_insert_own" ON public.team_members 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = registration_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "team_members_update_own" ON public.team_members 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = registration_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "team_members_delete_own" ON public.team_members 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = registration_id AND r.user_id = auth.uid()
    )
  );

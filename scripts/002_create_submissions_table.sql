-- Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('file_upload', 'cbt_access')),
  file_url TEXT,
  cbt_session_id TEXT,
  cbt_status TEXT CHECK (cbt_status IN ('not_started', 'in_progress', 'completed')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  score DECIMAL(5,2),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for submissions
CREATE POLICY "submissions_select_own" ON public.submissions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = registration_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "submissions_insert_own" ON public.submissions 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = registration_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "submissions_update_own" ON public.submissions 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = registration_id AND r.user_id = auth.uid()
    )
  );

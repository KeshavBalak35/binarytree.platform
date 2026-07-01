-- ============================================================
-- BinaryTree Platform — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Profiles (one row per auth user)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Learner',
  role TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('student','designer','admin','director','founder')),
  hub TEXT DEFAULT '',
  country TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  level TEXT NOT NULL DEFAULT 'Beginner',
  description TEXT DEFAULT '',
  published BOOLEAN DEFAULT false,
  learner_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sections (ordered within a course)
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Section',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons (ordered within a section)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Lesson',
  published BOOLEAN DEFAULT false,
  goal TEXT DEFAULT '',
  steps JSONB DEFAULT '[]',
  checkpoint TEXT DEFAULT '',
  code TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress (student lesson completions)
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ── Trigger: auto-create profile on signup ──────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, hub, country)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    COALESCE(new.raw_user_meta_data->>'hub', ''),
    COALESCE(new.raw_user_meta_data->>'country', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Profiles: own row + staff can read all
CREATE POLICY "profiles_own_all" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "profiles_staff_read" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin','founder','director')
    )
  );

-- Courses: public read for published; staff read/write all
CREATE POLICY "courses_public_read" ON public.courses
  FOR SELECT USING (
    published = true
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('designer','admin','founder','director'))
  );

CREATE POLICY "courses_staff_write" ON public.courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('designer','admin','founder'))
  );

-- Sections: same read rules as parent course
CREATE POLICY "sections_public_read" ON public.sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND published = true)
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('designer','admin','founder','director'))
  );

CREATE POLICY "sections_staff_write" ON public.sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('designer','admin','founder'))
  );

-- Lessons: published readable by all; staff read/write all
CREATE POLICY "lessons_public_read" ON public.lessons
  FOR SELECT USING (
    published = true
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('designer','admin','founder','director'))
  );

CREATE POLICY "lessons_staff_write" ON public.lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('designer','admin','founder'))
  );

-- Progress: students manage their own rows
CREATE POLICY "progress_own" ON public.progress
  FOR ALL USING (auth.uid() = user_id);

-- ── Seed data ────────────────────────────────────────────────
INSERT INTO public.courses (id, title, category, level, description, published, learner_count) VALUES
  ('11111111-1111-1111-1111-111111111111','Introduction to Python','Python','Beginner','Learn variables, logic, loops, and the thinking habits behind every great program.',true,12840),
  ('22222222-2222-2222-2222-222222222222','Web Development Foundations','HTML/CSS','Beginner','Build accessible pages with semantic HTML, thoughtful forms, CSS layout, and flexbox.',true,9360),
  ('33333333-3333-3333-3333-333333333333','Digital Literacy Essentials','Foundations','Starter','Practice safer browsing, file organization, keyboard fluency, and responsible research.',true,15490)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sections (id, course_id, title, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111','Getting Started',0),
  ('a2222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','Logic & Control',1),
  ('a3333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222','HTML Basics',0),
  ('a4444444-4444-4444-4444-444444444444','33333333-3333-3333-3333-333333333333','Staying Safe Online',0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, section_id, title, published, goal, steps, checkpoint, code, sort_order) VALUES
  ('b1111111-1111-1111-1111-111111111111','a1111111-1111-1111-1111-111111111111','What is Programming?',true,
   'Understand what a program is — a set of clear instructions a computer follows step by step.',
   '["A program is a recipe — ordered steps that turn an input into an output.","Read the example and name the input, the action, and the output.","Change one line and predict what happens before you run it."]',
   'Explain why the order of steps matters in a program.',
   'name = "BinaryTree learner"\nprint("Hello", name)\n\n# Try changing this code.',0),
  ('b2222222-2222-2222-2222-222222222222','a1111111-1111-1111-1111-111111111111','Your First Variables',true,
   'Use variables to store and reuse a value by name.',
   '["A variable is a labelled box that holds a value.","Give it a clear name, put a value in, then use the name later.","Change the value and watch the output change."]',
   'Create a variable for your favourite number and print it twice.',
   'age = 12\nprint("Next year you will be", age + 1)',1),
  ('b3333333-3333-3333-3333-333333333333','a2222222-2222-2222-2222-222222222222','If-Else Statements',false,
   'Make a program choose between two paths based on a condition.',
   '["A condition is a yes/no question the program can answer.","if runs one block, else runs the other.","Indentation tells Python which lines belong to which path."]',
   'Write a check that prints ''pass'' when a score is 50 or more, otherwise ''try again''.',
   'score = 64\nif score >= 50:\n    print("pass")\nelse:\n    print("try again")',0),
  ('b4444444-4444-4444-4444-444444444444','a3333333-3333-3333-3333-333333333333','Semantic Structure',true,
   'Mark up a page with meaningful HTML elements.',
   '["Tags describe what content is, not how it looks.","Use header, main, and footer to give a page structure.","Good structure makes pages easier to read and more accessible."]',
   'List three semantic tags and what each one is for.',
   '<header>\n  <h1>My first page</h1>\n</header>\n<main>\n  <p>Hello, world.</p>\n</main>',0),
  ('b5555555-5555-5555-5555-555555555555','a4444444-4444-4444-4444-444444444444','Strong Passwords',true,
   'Understand what makes a password hard to guess.',
   '["Length beats complexity — longer is stronger.","Avoid names, birthdays, and common words.","Use a different password for each important account."]',
   'Explain why reusing one password everywhere is risky.',
   '# Good habits — no code needed.\n# "blue-river-lamp-42" is strong and memorable.',0)
ON CONFLICT (id) DO NOTHING;

-- ── Demo staff seed accounts ─────────────────────────────────
-- Create these via Supabase Auth > Users after running the schema,
-- OR run the seed_staff.sql script (see README).
-- The app's /api/admin/create-user endpoint does this automatically
-- once you're logged in as founder.

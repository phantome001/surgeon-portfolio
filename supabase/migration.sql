-- ═══════════════════════════════════════════════════════════════
-- Supabase SQL Migration — Surgeon Portfolio
-- Run this in the Supabase SQL Editor (supabase.com/dashboard)
-- ═══════════════════════════════════════════════════════════════

-- 1. Profiles table (extended from auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone_encrypted text,
  role text not null default 'patient' check (role in ('patient', 'doctor')),
  failed_attempts integer default 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Video categories
create table if not exists public.video_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_fr text not null,
  emoji text not null default '🔬',
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 3. Videos
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.video_categories(id) on delete cascade,
  title_ar text not null,
  title_fr text not null,
  desc_ar text not null default '',
  desc_fr text not null default '',
  embed_url text not null,
  duration text not null default '00:00',
  views integer default 0,
  is_published boolean default true,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- 4. Appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  time_slot text not null,
  full_name_encrypted text not null,
  phone_encrypted text not null,
  reason_encrypted text not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  doctor_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(date, time_slot, status)
);

-- 5. Conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- 6. Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  content_encrypted text not null,
  sent_at timestamptz default now(),
  read_at timestamptz
);

-- 7. Audit Logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  action text not null,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════════
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_appointments_user on public.appointments(user_id);
create index if not exists idx_appointments_date on public.appointments(date);
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_audit_user on public.audit_logs(user_id);
create index if not exists idx_audit_action on public.audit_logs(action);
create index if not exists idx_audit_created on public.audit_logs(created_at);

-- ═══════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.video_categories enable row level security;
alter table public.videos enable row level security;
alter table public.appointments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.audit_logs enable row level security;

-- Helper function: get user role
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid()
$$ language sql security definer;

-- Helper function: is doctor
create or replace function public.is_doctor()
returns boolean as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'doctor')
$$ language sql security definer;

-- Helper function: check slot availability
create or replace function public.is_slot_available(p_date date, p_time_slot text)
returns boolean as $$
  select not exists(
    select 1 from public.appointments
    where date = p_date and time_slot = p_time_slot and status in ('pending', 'confirmed')
  )
$$ language sql security definer;

-- Profiles: users can read own, doctors can read all
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Doctors read all profiles" on public.profiles for select using (is_doctor());
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Video categories: public read
create policy "Anyone reads categories" on public.video_categories for select using (true);
create policy "Doctors manage categories" on public.video_categories for all using (is_doctor());

-- Videos: public read published
create policy "Anyone reads published videos" on public.videos for select using (is_published = true);
create policy "Doctors manage videos" on public.videos for all using (is_doctor());

-- Appointments: patients read own, doctors read all
create policy "Patients read own appointments" on public.appointments for select using (auth.uid() = user_id);
create policy "Doctors read all appointments" on public.appointments for select using (is_doctor());
create policy "Patients create appointments" on public.appointments for insert with check (auth.uid() = user_id);
create policy "Doctors update appointments" on public.appointments for update using (is_doctor());

-- Conversations: patients see own, doctors see all
create policy "Patients see own conversations" on public.conversations for select using (auth.uid() = patient_id);
create policy "Doctors see all conversations" on public.conversations for select using (is_doctor());
create policy "Patients create conversations" on public.conversations for insert with check (auth.uid() = patient_id);

-- Messages: participants can read
create policy "Read messages in own conversation" on public.messages for select
  using (
    exists(select 1 from public.conversations c where c.id = conversation_id and c.patient_id = auth.uid())
    or is_doctor()
  );
create policy "Send messages in own conversation" on public.messages for insert
  with check (
    auth.uid() = sender_id
    and (
      exists(select 1 from public.conversations c where c.id = conversation_id and c.patient_id = auth.uid())
      or is_doctor()
    )
  );

-- Audit logs: only service role (via admin client)
create policy "No direct access to audit logs" on public.audit_logs for select using (false);

-- ═══════════════════════════════════════════════════════════════
-- Trigger: Auto-create profile on signup
-- ═══════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', 'مريض'),
    'patient'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- Enable Realtime for messages
-- ═══════════════════════════════════════════════════════════════
alter publication supabase_realtime add table public.messages;

-- ═══════════════════════════════════════════════════════════════
-- Seed: Video Categories
-- ═══════════════════════════════════════════════════════════════
insert into public.video_categories (slug, name_ar, name_fr, emoji, sort_order) values
  ('laparoscopy', 'عمليات بالمنظار', 'Chirurgie laparoscopique', '🔬', 1),
  ('hernia', 'الفتق', 'Hernie', '🩹', 2),
  ('gallbladder', 'المرارة', 'Vésicule biliaire', '💚', 3),
  ('appendix', 'الزائدة الدودية', 'Appendice', '🔴', 4),
  ('digestive', 'الجهاز الهضمي', 'Système digestif', '🫁', 5),
  ('general', 'جراحة عامة', 'Chirurgie générale', '🏥', 6)
on conflict (slug) do nothing;

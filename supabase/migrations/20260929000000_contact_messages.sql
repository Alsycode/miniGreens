-- Contact form submissions from the public website (webapp/components/ContactForm.tsx).
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  reason text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone (including signed-out visitors) may submit a message; only admins can read them.
create policy "contact_messages_insert_public" on public.contact_messages
  for insert to anon, authenticated
  with check (true);

create policy "contact_messages_admin_select" on public.contact_messages
  for select to authenticated
  using (public.is_admin());

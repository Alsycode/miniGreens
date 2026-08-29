-- T5: carry `date_of_birth` from sign-up metadata into the new profile row.
-- The mobile Register screen now passes options.data.date_of_birth (ISO YYYY-MM-DD)
-- into supabase.auth.signUp; copy it through the same trigger that seeds full_name.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, date_of_birth)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date
  );
  return new;
end;
$$;

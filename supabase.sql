-- Pegar completo en Supabase > SQL Editor > Run (una sola vez)
create table agendas(id uuid primary key default gen_random_uuid(), owner uuid not null default auth.uid(), invite_code text unique not null default substr(md5(random()::text||clock_timestamp()::text),1,12), created_at timestamptz default now());
create table members(agenda_id uuid references agendas on delete cascade, user_id uuid references auth.users on delete cascade, role text not null default 'admin', primary key(agenda_id,user_id));
create table kv(agenda_id uuid references agendas on delete cascade, path text, data jsonb not null, updated_at timestamptz default now(), primary key(agenda_id,path));
alter table agendas enable row level security; alter table members enable row level security; alter table kv enable row level security;

create function is_member(a uuid) returns boolean language sql security definer stable set search_path=public as $$ select exists(select 1 from members where agenda_id=a and user_id=auth.uid()) $$;
create function can_write(a uuid) returns boolean language sql security definer stable set search_path=public as $$ select exists(select 1 from members where agenda_id=a and user_id=auth.uid() and role<>'viewer') $$;
create function is_owner(a uuid) returns boolean language sql security definer stable set search_path=public as $$ select exists(select 1 from agendas where id=a and owner=auth.uid()) $$;

create policy ag_read on agendas for select using (is_member(id));
create policy mem_read on members for select using (is_member(agenda_id));
create policy mem_upd on members for update using (is_owner(agenda_id));
create policy mem_del on members for delete using (is_owner(agenda_id));
create policy kv_read on kv for select using (is_member(agenda_id));
create policy kv_ins on kv for insert with check (can_write(agenda_id));
create policy kv_upd on kv for update using (can_write(agenda_id));
create policy kv_del on kv for delete using (can_write(agenda_id));

create function create_agenda() returns uuid language plpgsql security definer set search_path=public as $$ declare a uuid; begin insert into agendas default values returning id into a; insert into members(agenda_id,user_id,role) values(a,auth.uid(),'admin'); return a; end $$;
create function join_agenda(code text) returns uuid language plpgsql security definer set search_path=public as $$ declare a uuid; begin select id into a from agendas where invite_code=code; if a is null then return null; end if; insert into members(agenda_id,user_id,role) values(a,auth.uid(),'admin') on conflict do nothing; return a; end $$;

alter publication supabase_realtime add table kv;

insert into storage.buckets(id,name,public) values('notas','notas',false);
create policy f_read on storage.objects for select using (bucket_id='notas' and is_member(((storage.foldername(name))[1])::uuid));
create policy f_ins on storage.objects for insert with check (bucket_id='notas' and can_write(((storage.foldername(name))[1])::uuid));
create policy f_del on storage.objects for delete using (bucket_id='notas' and can_write(((storage.foldername(name))[1])::uuid));

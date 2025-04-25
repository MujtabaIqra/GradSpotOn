-- Enable Row Level Security
alter table auth.users enable row level security;

-- Create enum types
create type user_type as enum ('Student', 'Staff', 'Admin', 'Security');
create type building_code as enum ('J1', 'J2', 'M1', 'M2', 'S1', 'S2');
create type booking_status as enum ('Active', 'Completed', 'Cancelled', 'Expired');
create type parking_zone_status as enum ('Open', 'Closed', 'Maintenance', 'Reserved');
create type violation_type as enum ('Overstay', 'NoQRScan', 'UnauthorizedSpot', 'Other');

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  user_type user_type not null default 'Student',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create stored procedure to update user to admin
create or replace function public.update_to_admin(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set user_type = 'Admin'::user_type,
      updated_at = now()
  where id = user_id;
end;
$$;

-- Create parking_zones table
create table public.parking_zones (
  id serial primary key,
  building building_code not null,
  zone_name text not null,
  total_spots integer not null,
  shaded_spots integer not null default 0,
  status parking_zone_status not null default 'Open',
  status_reason text,
  status_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create parking_spots table
create table public.parking_spots (
  id serial primary key,
  zone_id integer references public.parking_zones(id),
  spot_number integer not null,
  is_shaded boolean default false,
  is_reserved boolean default false,
  is_disabled_friendly boolean default false,
  status parking_zone_status not null default 'Open',
  status_reason text,
  status_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(zone_id, spot_number)
);

-- Create bookings table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  zone_id integer references public.parking_zones(id),
  spot_number integer not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status booking_status not null default 'Active',
  entry_time timestamptz,
  exit_time timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create violations table
create table public.violations (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id),
  user_id uuid references public.profiles(id),
  violation_type violation_type not null,
  description text not null,
  fine_amount decimal(10,2),
  is_paid boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create parking_analytics table for caching analytics data
create table public.parking_analytics (
  id serial primary key,
  zone_id integer references public.parking_zones(id),
  date date not null,
  total_bookings integer default 0,
  peak_occupancy_rate decimal(5,2) default 0,
  avg_occupancy_rate decimal(5,2) default 0,
  total_violations integer default 0,
  total_fine_amount decimal(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(zone_id, date)
);

-- Create notifications table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  title text not null,
  message text not null,
  type text not null,
  is_read boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create RLS policies
alter table public.profiles enable row level security;
alter table public.parking_zones enable row level security;
alter table public.parking_spots enable row level security;
alter table public.bookings enable row level security;
alter table public.violations enable row level security;
alter table public.parking_analytics enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Parking zones policies
create policy "Parking zones are viewable by everyone." on public.parking_zones
  for select using (true);

create policy "Only admins can modify parking zones." on public.parking_zones
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and user_type = 'Admin'
    )
  );

-- Parking spots policies
create policy "Parking spots are viewable by everyone." on public.parking_spots
  for select using (true);

create policy "Only admins can modify parking spots." on public.parking_spots
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and user_type = 'Admin'
    )
  );

-- Bookings policies
create policy "Users can view own bookings." on public.bookings
  for select using (auth.uid() = user_id);

create policy "Admins can view all bookings." on public.bookings
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and user_type = 'Admin'
    )
  );

create policy "Users can create bookings." on public.bookings
  for insert with check (auth.uid() = user_id);

create policy "Users can update own bookings." on public.bookings
  for update using (auth.uid() = user_id);

-- Violations policies
create policy "Users can view own violations." on public.violations
  for select using (auth.uid() = user_id);

create policy "Admins can manage all violations." on public.violations
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and user_type = 'Admin'
    )
  );

-- Analytics policies
create policy "Analytics are viewable by admins only." on public.parking_analytics
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and user_type = 'Admin'
    )
  );

create policy "Only admins can modify analytics." on public.parking_analytics
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and user_type = 'Admin'
    )
  );

-- Notifications policies
create policy "Users can view own notifications." on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications." on public.notifications
  for update using (auth.uid() = user_id);

-- Functions
create or replace function public.get_current_occupancy(zone_id integer)
returns table (
  total_spots integer,
  occupied_spots integer,
  occupancy_rate decimal
) language plpgsql security definer as $$
begin
  return query
  select
    pz.total_spots,
    count(b.id)::integer as occupied_spots,
    (count(b.id)::decimal / pz.total_spots::decimal * 100)::decimal as occupancy_rate
  from parking_zones pz
  left join bookings b on b.zone_id = pz.id
  where pz.id = zone_id
  and b.status = 'Active'
  group by pz.total_spots;
end;
$$; 
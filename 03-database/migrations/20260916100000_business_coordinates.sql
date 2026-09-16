-- EAH: business coordinates for interactive maps

alter table public.businesses
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists address_text text;

-- index for map queries (only rows with coords)
create index if not exists businesses_coords_idx
  on public.businesses (latitude, longitude)
  where latitude is not null and longitude is not null;

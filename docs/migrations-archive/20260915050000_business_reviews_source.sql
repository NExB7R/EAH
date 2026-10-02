-- EAH: add source to business_reviews for imported reviews

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'business_reviews'
      and column_name = 'source'
  ) then
    alter table public.business_reviews
      add column source text not null default 'eah';
  end if;
end $$;

create index if not exists business_reviews_source_idx
  on public.business_reviews (source, status);

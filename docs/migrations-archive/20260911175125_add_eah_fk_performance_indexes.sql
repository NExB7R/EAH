create index if not exists business_media_business_id_idx on public.business_media(business_id);
create index if not exists business_reviews_user_id_idx on public.business_reviews(user_id);
create index if not exists exclusions_business_id_idx on public.exclusions(business_id);
create index if not exists favorites_business_id_idx on public.favorites(business_id);
create index if not exists offer_reactions_user_id_idx on public.offer_reactions(user_id);
create index if not exists offers_business_id_idx on public.offers(business_id);

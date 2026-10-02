# Database Plan — Initial

## Primary tables (planned)
- profiles
- customer_preferences
- businesses
- business_categories
- business_locations
- restaurant_menu_images
- offers
- offer_reactions
- favorites
- exclusions
- restaurant_ratings
- restaurant_rating_dimensions
- delivery_coverage_areas
- business_contact_methods
- business_payment_methods
- notifications
- featured_placements
- customer_trust_events
- customer_trust_scores
- reports
- admin_actions

## Future tables (not enabled in MVP)
- orders
- order_items
- order_events
- restaurant_channels
- rewards
- customer_benefits

## RLS direction
- Customers can read/write only their own private preferences, favorites, exclusions and profile fields allowed by policy.
- Businesses can manage only business records they own/manage.
- Public/visitor reads are restricted to approved public business content.
- Contact/payment/rating content is restricted according to registration policy.
- Admin actions are role-protected and audited.

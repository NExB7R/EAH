# Product Specification — v0.1.0

## User roles
1. Visitor
2. Verified customer
3. Restaurant owner/staff
4. Delivery office owner/staff
5. Admin

## Visitor can
- Browse businesses
- See general business information
- View menu images
- View offer text/images
- See area/category information

## Verified customer can additionally
- See contact information
- See payment methods
- See ratings/comments
- Rate and comment under anti-abuse rules
- Favorite businesses
- Exclude businesses/categories
- Receive favorite-related notifications
- Interact with offers
- Use “Suggest food for me”
- Accumulate a private Trust Score

## Restaurant MVP
- Profile
- Status open/closed
- Menu image management
- Offers with title/description/price/optional expiry/teaser image
- Contact methods
- Payment methods
- Basic analytics

## Delivery office MVP
- Profile
- Coverage areas
- Pricing/fees
- Contact methods
- Ratings

## Admin MVP
- Approve/manage businesses
- Approve/manage offers/menu images
- Manage ratings/reports
- Manage users/business access
- Featured placement management
- Basic analytics

## Home feed
Order concept:
1. Featured / paid boost (capped)
2. Favorites
3. Personalized “For you”
4. Nearby (high weight for location-sensitive categories)
5. Trending/new discoveries

## Category ranking
Restaurant: personal match + favorites + offer engagement/trend + rating + featured boost + distance.
Pharmacy: open now + distance + reliability/rating + featured boost.
Supermarket: distance + open now + relevance + rating + featured boost.
Delivery office: coverage match + relevance + rating + featured boost.

## Suggest-food questionnaire
Initial dimensions:
- Craving/category
- Budget
- Light vs filling
- Safe choice vs new experience
- Waiting tolerance
- Distance preference

Return 3 recommendations and brief explanations.

## Privacy
Business-facing views must expose only data necessary for business operations. Customer Trust Score, complete favorite/exclusion history and unrelated activity remain private.

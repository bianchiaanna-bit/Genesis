# Génesis Restaurante — website concept

Frontend-first concept for Génesis Restaurante, La Laguna, Tenerife.

## Current stack

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub-ready
- Cloudflare-ready
- ES / EN / IT language switcher
- Responsive/mobile-first
- Accessible navigation, skip link, focusable controls and reduced-motion support
- Basic SEO metadata + Restaurant JSON-LD
- Temporary food photos are the two images supplied in this conversation.

## Important before publication

This is a design/development prototype. Replace:
- `https://www.example.com/` with the real domain
- temporary food photos with authorized high-resolution photos
- menu names/prices/descriptions with the current official menu
- phone/email/hours after confirmation by the restaurant
- the provisional founder story with the founder's actual story
- social links if the official accounts differ

## Planned Cloudflare phase

Recommended production architecture:

GitHub -> Cloudflare Pages/Workers -> D1 -> R2

D1 should hold editable content:
- dishes
- categories
- multilingual names/descriptions
- prices
- availability
- specials
- opening hours
- selected gallery items

R2 should hold uploaded images.

The public frontend should consume the content through a Cloudflare Worker API.

## Suggested next files

- `/admin/index.html`
- `/worker/src/index.js`
- `/worker/schema.sql`
- `/locales/` can later be moved to D1 for dynamic content.

Do not publish the admin until authentication and authorization are implemented.

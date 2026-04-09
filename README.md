# @arraypress/oembed-card

Generate self-contained HTML cards for oEmbed rich responses. All styles inline — safe for embedding in any context (Slack, Discord, social media, etc.). Zero dependencies.

Works in Node.js, Cloudflare Workers, Deno, Bun, and browsers.

## Install

```bash
npm install @arraypress/oembed-card
```

## Functions

### `buildOEmbedCard(options)`

Build a self-contained HTML card for oEmbed rich responses.

```js
import { buildOEmbedCard } from '@arraypress/oembed-card';

const html = buildOEmbedCard({
  productUrl: 'https://store.com/products/widget',
  name: 'Premium Widget',
  description: 'The best widget money can buy.',
  imageUrl: 'https://store.com/images/widget.jpg',
  collection: 'Widgets',
  priceStr: '$29.99',
  brandColor: '#6366f1',
  storeName: 'My Store',
  features: ['Free shipping', '30-day returns', 'Lifetime warranty'],
  ratingCount: 42,
  ratingAvg: 4.5,
  width: 480,
});
```

**Required options:** `productUrl`, `name`, `brandColor`, `storeName`, `width`.

**Optional:** `description`, `imageUrl`, `collection`, `priceStr`, `features`, `ratingCount`, `ratingAvg`.

### Card Features

- Dark theme card with rounded corners and shadow
- Product image with price badge overlay (or gradient placeholder when no image)
- Collection/category label in brand color
- Star rating display (1-5 stars, gold/grey)
- Feature list with check icons (max 3)
- CTA button with brand color background
- Footer with brand icon and store name

### Helper Functions

All internal helpers are exported for custom card building:

```js
import {
  escapeHtml,      // HTML entity escaping
  checkIcon,       // SVG check mark (color)
  starIcon,        // SVG star (filled/empty)
  logoIcon,        // SVG brand icon (color)
  buildStars,      // Star rating HTML (count, avg)
  buildFeatures,   // Feature list HTML (features[], color)
  buildImage,      // Image section HTML (url, link, name, price, color)
} from '@arraypress/oembed-card';
```

## Output

The card is a single `<div>` with all styles inline. No external CSS, no JavaScript, no `<style>` tags. This ensures it renders correctly in oEmbed consumers that strip external resources.

## License

MIT

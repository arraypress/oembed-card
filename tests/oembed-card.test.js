import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHtml,
  checkIcon,
  starIcon,
  logoIcon,
  buildStars,
  buildFeatures,
  buildImage,
  buildOEmbedCard,
} from '../src/index.js';

// ── escapeHtml ──────────────────────────────

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    assert.equal(escapeHtml('A & B'), 'A &amp; B');
  });

  it('escapes angle brackets', () => {
    assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
  });

  it('escapes quotes', () => {
    assert.equal(escapeHtml('say "hello"'), 'say &quot;hello&quot;');
  });

  it('handles null', () => {
    assert.equal(escapeHtml(null), '');
  });

  it('handles undefined', () => {
    assert.equal(escapeHtml(undefined), '');
  });

  it('handles empty string', () => {
    assert.equal(escapeHtml(''), '');
  });

  it('passes through safe text', () => {
    assert.equal(escapeHtml('Hello World'), 'Hello World');
  });
});

// ── SVG Icons ───────────────────────────────

describe('checkIcon', () => {
  it('returns SVG with correct color', () => {
    const svg = checkIcon('#ff0000');
    assert.ok(svg.includes('stroke="#ff0000"'));
    assert.ok(svg.includes('<svg'));
    assert.ok(svg.includes('</svg>'));
  });
});

describe('starIcon', () => {
  it('returns gold fill when filled', () => {
    const svg = starIcon(true);
    assert.ok(svg.includes('fill="#facc15"'));
  });

  it('returns grey fill when not filled', () => {
    const svg = starIcon(false);
    assert.ok(svg.includes('fill="#374151"'));
  });
});

describe('logoIcon', () => {
  it('returns SVG with correct color', () => {
    const svg = logoIcon('#6366f1');
    assert.ok(svg.includes('fill="#6366f1"'));
    assert.ok(svg.includes('<svg'));
  });
});

// ── buildStars ──────────────────────────────

describe('buildStars', () => {
  it('returns empty string for zero count', () => {
    assert.equal(buildStars(0, 4.5), '');
  });

  it('returns empty string for negative count', () => {
    assert.equal(buildStars(-1, 3), '');
  });

  it('renders 5 stars with count', () => {
    const html = buildStars(42, 4.2);
    assert.ok(html.includes('(42)'));
    // Should have 5 star SVGs
    const starCount = (html.match(/<svg/g) || []).length;
    assert.equal(starCount, 5);
  });

  it('fills correct number of stars', () => {
    const html = buildStars(10, 3);
    // 3 filled (gold) + 2 empty (grey)
    const gold = (html.match(/#facc15/g) || []).length;
    const grey = (html.match(/#374151/g) || []).length;
    assert.equal(gold, 3);
    assert.equal(grey, 2);
  });

  it('rounds to nearest star', () => {
    const html = buildStars(5, 4.6);
    // Rounds to 5 — all gold
    const gold = (html.match(/#facc15/g) || []).length;
    assert.equal(gold, 5);
  });
});

// ── buildFeatures ───────────────────────────

describe('buildFeatures', () => {
  it('returns empty string for empty array', () => {
    assert.equal(buildFeatures([], '#000'), '');
  });

  it('returns empty string for null', () => {
    assert.equal(buildFeatures(null, '#000'), '');
  });

  it('renders up to 3 features', () => {
    const html = buildFeatures(['A', 'B', 'C', 'D'], '#6366f1');
    assert.ok(html.includes('A'));
    assert.ok(html.includes('B'));
    assert.ok(html.includes('C'));
    assert.ok(!html.includes('D'));
  });

  it('includes check icons with brand color', () => {
    const html = buildFeatures(['Feature'], '#ff0000');
    assert.ok(html.includes('stroke="#ff0000"'));
  });

  it('escapes HTML in feature text', () => {
    const html = buildFeatures(['<script>alert(1)</script>'], '#000');
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(!html.includes('<script>alert'));
  });
});

// ── buildImage ──────────────────────────────

describe('buildImage', () => {
  it('renders image with URL', () => {
    const html = buildImage('https://img.com/photo.jpg', 'https://store.com/p', 'Widget', '$10', '#000');
    assert.ok(html.includes('src="https://img.com/photo.jpg"'));
    assert.ok(html.includes('href="https://store.com/p"'));
    assert.ok(html.includes('alt="Widget"'));
  });

  it('renders price badge when priceStr provided', () => {
    const html = buildImage('https://img.com/photo.jpg', 'https://store.com/p', 'Widget', '$29.99', '#000');
    assert.ok(html.includes('$29.99'));
  });

  it('omits price badge when priceStr is empty', () => {
    const html = buildImage('https://img.com/photo.jpg', 'https://store.com/p', 'Widget', '', '#000');
    // Should not have the price badge span
    assert.ok(!html.includes('ui-monospace'));
  });

  it('renders gradient placeholder when no image URL', () => {
    const html = buildImage('', 'https://store.com/p', 'Widget', '$10', '#6366f1');
    assert.ok(html.includes('linear-gradient'));
    assert.ok(html.includes('fill="#6366f1"'));
    assert.ok(!html.includes('<img'));
  });

  it('escapes product name in alt text', () => {
    const html = buildImage('https://img.com/p.jpg', 'https://store.com/p', 'Widget "Pro"', '', '#000');
    assert.ok(html.includes('alt="Widget &quot;Pro&quot;"'));
  });
});

// ── buildOEmbedCard ─────────────────────────

describe('buildOEmbedCard', () => {
  const fullOpts = {
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
  };

  it('renders complete card with all options', () => {
    const html = buildOEmbedCard(fullOpts);
    assert.ok(html.includes('max-width:480px'));
    assert.ok(html.includes('Premium Widget'));
    assert.ok(html.includes('The best widget money can buy.'));
    assert.ok(html.includes('Widgets'));
    assert.ok(html.includes('$29.99'));
    assert.ok(html.includes('My Store'));
    assert.ok(html.includes('Free shipping'));
    assert.ok(html.includes('30-day returns'));
    assert.ok(html.includes('Lifetime warranty'));
    assert.ok(html.includes('(42)'));
    assert.ok(html.includes('#6366f1'));
  });

  it('renders card without optional fields', () => {
    const html = buildOEmbedCard({
      productUrl: 'https://store.com/p',
      name: 'Simple Product',
      brandColor: '#000',
      storeName: 'Store',
      width: 400,
    });
    assert.ok(html.includes('Simple Product'));
    assert.ok(html.includes('Store'));
    assert.ok(html.includes('View Product'));
    assert.ok(html.includes('max-width:400px'));
    // No description, no collection, no stars, no features
    assert.ok(!html.includes('-webkit-line-clamp'));
    assert.ok(!html.includes('letter-spacing:0.12em'));
  });

  it('button shows price when priceStr provided', () => {
    const html = buildOEmbedCard(fullOpts);
    assert.ok(html.includes('View Product — $29.99'));
  });

  it('button shows plain text when no priceStr', () => {
    const html = buildOEmbedCard({
      productUrl: 'https://store.com/p',
      name: 'Free Item',
      brandColor: '#000',
      storeName: 'Store',
      width: 400,
    });
    assert.ok(html.includes('>View Product<'));
  });

  it('renders placeholder image when no imageUrl', () => {
    const html = buildOEmbedCard({
      productUrl: 'https://store.com/p',
      name: 'No Image',
      brandColor: '#ff0000',
      storeName: 'Store',
      width: 400,
    });
    assert.ok(html.includes('linear-gradient'));
    assert.ok(!html.includes('<img'));
  });

  it('renders image when imageUrl provided', () => {
    const html = buildOEmbedCard(fullOpts);
    assert.ok(html.includes('<img'));
    assert.ok(html.includes('src="https://store.com/images/widget.jpg"'));
  });

  it('escapes HTML in name', () => {
    const html = buildOEmbedCard({
      productUrl: 'https://store.com/p',
      name: '<script>alert(1)</script>',
      brandColor: '#000',
      storeName: 'Store',
      width: 400,
    });
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(!html.includes('<script>alert'));
  });

  it('escapes HTML in description', () => {
    const html = buildOEmbedCard({
      productUrl: 'https://store.com/p',
      name: 'Product',
      description: 'Buy <b>now</b> & save',
      brandColor: '#000',
      storeName: 'Store',
      width: 400,
    });
    assert.ok(html.includes('Buy &lt;b&gt;now&lt;/b&gt; &amp; save'));
  });

  it('escapes HTML in collection', () => {
    const html = buildOEmbedCard({
      productUrl: 'https://store.com/p',
      name: 'Product',
      collection: 'Tools & "Gear"',
      brandColor: '#000',
      storeName: 'Store',
      width: 400,
    });
    assert.ok(html.includes('Tools &amp; &quot;Gear&quot;'));
  });

  it('escapes HTML in storeName', () => {
    const html = buildOEmbedCard({
      productUrl: 'https://store.com/p',
      name: 'Product',
      brandColor: '#000',
      storeName: 'Store & Co',
      width: 400,
    });
    assert.ok(html.includes('Store &amp; Co'));
  });

  it('renders no stars when ratingCount is 0', () => {
    const html = buildOEmbedCard({
      productUrl: 'https://store.com/p',
      name: 'Product',
      brandColor: '#000',
      storeName: 'Store',
      width: 400,
      ratingCount: 0,
      ratingAvg: 0,
    });
    // No star SVGs in the rating section
    assert.ok(!html.includes('#facc15'));
  });

  it('uses brandColor for button and collection label', () => {
    const html = buildOEmbedCard({
      productUrl: 'https://store.com/p',
      name: 'Product',
      collection: 'Category',
      brandColor: '#e11d48',
      storeName: 'Store',
      width: 400,
    });
    assert.ok(html.includes('background:#e11d48'));
    assert.ok(html.includes('color:#e11d48'));
  });

  it('contains product URL in links', () => {
    const html = buildOEmbedCard(fullOpts);
    const linkCount = (html.match(/href="https:\/\/store\.com\/products\/widget"/g) || []).length;
    // Image link, title link, button link, footer link
    assert.ok(linkCount >= 3);
  });

  it('all links open in new tab', () => {
    const html = buildOEmbedCard(fullOpts);
    const targetBlank = (html.match(/target="_blank"/g) || []).length;
    const relNoopener = (html.match(/rel="noopener"/g) || []).length;
    assert.ok(targetBlank >= 3);
    assert.equal(targetBlank, relNoopener);
  });
});

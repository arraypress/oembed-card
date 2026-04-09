/**
 * @arraypress/oembed-card
 *
 * Generate self-contained HTML cards for oEmbed rich responses.
 * All styles are inline — safe for embedding in any context
 * (Slack, Discord, social media, etc.). No external CSS or JS.
 *
 * Zero dependencies. Works in Node.js, Cloudflare Workers, Deno,
 * Bun, and browsers.
 *
 * @module @arraypress/oembed-card
 */

// ── HTML Escaping ───────────────────────────

/**
 * Escape a string for safe HTML output.
 *
 * @param {string} str - String to escape.
 * @returns {string} Escaped string.
 */
export function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── SVG Icons ───────────────────────────────

/**
 * Generate an inline SVG check icon.
 *
 * @param {string} color - Stroke color.
 * @returns {string} SVG markup.
 */
export function checkIcon(color) {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
}

/**
 * Generate an inline SVG star icon.
 *
 * @param {boolean} filled - Whether the star is filled (gold) or empty (grey).
 * @returns {string} SVG markup.
 */
export function starIcon(filled) {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="${filled ? '#facc15' : '#374151'}" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
}

/**
 * Generate an inline SVG logo/brand icon.
 *
 * @param {string} color - Fill color.
 * @returns {string} SVG markup.
 */
export function logoIcon(color) {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="4" height="12" rx="2" fill="${color}" opacity="0.4"/><rect x="10" y="3" width="4" height="18" rx="2" fill="${color}"/><rect x="18" y="8" width="4" height="8" rx="2" fill="${color}" opacity="0.6"/></svg>`;
}

// ── Card Sections ───────────────────────────

/**
 * Build the star rating HTML.
 *
 * @param {number} count - Number of ratings.
 * @param {number} avg - Average rating (0-5).
 * @returns {string} HTML markup, or empty string if no ratings.
 */
export function buildStars(count, avg) {
  if (count <= 0) return '';
  const rounded = Math.round(avg);
  const stars = [1, 2, 3, 4, 5].map(n => starIcon(n <= rounded)).join('');
  return `<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;">
    ${stars}
    <span style="font-size:11px;color:#a1a1aa;margin-left:2px;">(${count})</span>
  </div>`;
}

/**
 * Build the features list HTML.
 *
 * @param {string[]} features - Feature strings (max 3 shown).
 * @param {string} brandColor - Color for check icons.
 * @returns {string} HTML markup, or empty string if no features.
 */
export function buildFeatures(features, brandColor) {
  if (!features || !features.length) return '';
  const items = features.slice(0, 3).map(f =>
    `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#a1a1aa;">${checkIcon(brandColor)}${escapeHtml(f)}</span>`
  ).join('');
  return `<div style="display:flex;flex-wrap:wrap;gap:8px 16px;margin-bottom:16px;">${items}</div>`;
}

/**
 * Build the image section HTML (product image or gradient placeholder).
 *
 * @param {string} imageUrl - Product image URL (empty for placeholder).
 * @param {string} productUrl - Link target URL.
 * @param {string} name - Product name (for alt text).
 * @param {string} priceStr - Formatted price string (for badge overlay).
 * @param {string} brandColor - Brand color (for placeholder icon).
 * @returns {string} HTML markup.
 */
export function buildImage(imageUrl, productUrl, name, priceStr, brandColor) {
  if (imageUrl) {
    const priceBadge = priceStr
      ? `<span style="position:absolute;bottom:12px;left:12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);color:#fff;padding:4px 12px;border-radius:6px;font-size:13px;font-weight:700;font-family:ui-monospace,monospace;">${priceStr}</span>`
      : '';
    return `<a href="${productUrl}" target="_blank" rel="noopener" style="display:block;position:relative;overflow:hidden;">
      <img src="${imageUrl}" alt="${escapeHtml(name)}" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block;" />
      ${priceBadge}
    </a>`;
  }

  // Fallback: gradient placeholder with brand icon
  return `<a href="${productUrl}" target="_blank" rel="noopener" style="display:block;">
    <div style="width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,#18181b 0%,#09090b 100%);display:flex;align-items:center;justify-content:center;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="4" height="12" rx="2" fill="${brandColor}" opacity="0.4"/>
        <rect x="10" y="3" width="4" height="18" rx="2" fill="${brandColor}"/>
        <rect x="18" y="8" width="4" height="8" rx="2" fill="${brandColor}" opacity="0.6"/>
      </svg>
    </div>
  </a>`;
}

// ── Main Card Builder ───────────────────────

/**
 * Build a self-contained HTML card for oEmbed rich responses.
 *
 * All styles are inline — no external CSS needed. Safe for embedding
 * in Slack, Discord, social media, or any oEmbed consumer.
 *
 * @param {Object} opts - Card options.
 * @param {string} opts.productUrl - URL to the product page.
 * @param {string} opts.name - Product/item name.
 * @param {string} [opts.description] - Short description (clamped to 2 lines).
 * @param {string} [opts.imageUrl] - Product image URL.
 * @param {string} [opts.collection] - Collection/category label.
 * @param {string} [opts.priceStr] - Formatted price string (e.g. '$29.99').
 * @param {string} opts.brandColor - Brand accent color (hex).
 * @param {string} opts.storeName - Store/brand name for footer.
 * @param {string[]} [opts.features] - Feature list (max 3 shown).
 * @param {number} [opts.ratingCount] - Number of ratings.
 * @param {number} [opts.ratingAvg] - Average rating (0-5).
 * @param {number} opts.width - Card max width in pixels.
 * @returns {string} Self-contained HTML string.
 *
 * @example
 * const html = buildOEmbedCard({
 *   productUrl: 'https://store.com/products/widget',
 *   name: 'Premium Widget',
 *   description: 'The best widget money can buy.',
 *   imageUrl: 'https://store.com/images/widget.jpg',
 *   collection: 'Widgets',
 *   priceStr: '$29.99',
 *   brandColor: '#6366f1',
 *   storeName: 'My Store',
 *   features: ['Free shipping', '30-day returns', 'Lifetime warranty'],
 *   ratingCount: 42,
 *   ratingAvg: 4.5,
 *   width: 480,
 * });
 */
export function buildOEmbedCard(opts) {
  const {
    productUrl, name, description, imageUrl, collection,
    priceStr, brandColor, storeName, features,
    ratingCount, ratingAvg, width,
  } = opts;

  const image = buildImage(imageUrl || '', productUrl, name, priceStr || '', brandColor);
  const stars = buildStars(ratingCount || 0, ratingAvg || 0);
  const feats = buildFeatures(features || [], brandColor);

  const collectionLabel = collection
    ? `<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${brandColor};margin-bottom:8px;">${escapeHtml(collection)}</div>`
    : '';

  const descriptionPara = description
    ? `<p style="font-size:13px;color:#a1a1aa;margin:0 0 14px;line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(description)}</p>`
    : '';

  const buttonLabel = priceStr ? `View Product — ${priceStr}` : 'View Product';

  return `<div style="max-width:${width}px;font-family:-apple-system,'Segoe UI',system-ui,sans-serif;border-radius:16px;overflow:hidden;background:#0a0a0b;color:#fafafa;box-shadow:0 4px 24px rgba(0,0,0,0.3);">
  ${image}
  <div style="padding:20px;">
    ${collectionLabel}
    <a href="${productUrl}" target="_blank" rel="noopener" style="font-size:18px;font-weight:800;color:#fafafa;text-decoration:none;line-height:1.2;display:block;margin-bottom:8px;">${escapeHtml(name)}</a>
    ${stars}
    ${descriptionPara}
    ${feats}
    <a href="${productUrl}" target="_blank" rel="noopener" style="display:block;text-align:center;padding:12px 24px;background:${brandColor};color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.01em;">${buttonLabel}</a>
  </div>
  <div style="padding:10px 20px;border-top:1px solid #ffffff0a;display:flex;align-items:center;justify-content:center;gap:6px;">
    ${logoIcon(brandColor)}
    <a href="${productUrl}" target="_blank" rel="noopener" style="font-size:11px;color:#525252;text-decoration:none;font-weight:500;">${escapeHtml(storeName)}</a>
  </div>
</div>`;
}

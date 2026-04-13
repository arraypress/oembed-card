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
 * Escape a string for safe inclusion in HTML output.
 * Replaces &, <, >, and " with their HTML entity equivalents.
 *
 * @param {string} str - The string to escape (null/undefined treated as empty string).
 * @returns {string} The HTML-escaped string.
 *
 * @example
 * escapeHtml('Hello <world> & "friends"');
 * // 'Hello &lt;world&gt; &amp; &quot;friends&quot;'
 *
 * @example
 * escapeHtml(null);  // ''
 */
export function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── SVG Icons ───────────────────────────────

/**
 * Generate an inline SVG check/tick icon.
 *
 * @param {string} color - Stroke color for the check mark (e.g. '#6366f1' or 'green').
 * @returns {string} SVG markup string (12x12 pixels).
 *
 * @example
 * checkIcon('#6366f1');
 * // '<svg width="12" height="12" ...><polyline points="20 6 9 17 4 12"/></svg>'
 */
export function checkIcon(color) {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
}

/**
 * Generate an inline SVG star icon, either filled (gold) or empty (grey).
 *
 * @param {boolean} filled - Whether the star should be filled (gold) or empty (dark grey).
 * @returns {string} SVG markup string (14x14 pixels).
 *
 * @example
 * starIcon(true);   // filled gold star SVG
 * starIcon(false);  // empty grey star SVG
 */
export function starIcon(filled) {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="${filled ? '#facc15' : '#374151'}" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
}

/**
 * Generate an inline SVG brand/logo icon with three vertical bars at varying opacity.
 *
 * @param {string} color - Fill color for the bars (e.g. '#6366f1').
 * @returns {string} SVG markup string (14x14 pixels).
 *
 * @example
 * logoIcon('#6366f1');
 * // '<svg width="14" height="14" ...>...</svg>'
 */
export function logoIcon(color) {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="4" height="12" rx="2" fill="${color}" opacity="0.4"/><rect x="10" y="3" width="4" height="18" rx="2" fill="${color}"/><rect x="18" y="8" width="4" height="8" rx="2" fill="${color}" opacity="0.6"/></svg>`;
}

// ── Card Sections ───────────────────────────

/**
 * Build the star rating HTML section for a card.
 * Returns an empty string if there are no ratings.
 *
 * @param {number} count - Number of ratings (0 or negative returns empty string).
 * @param {number} avg - Average rating value (0-5, rounded to nearest integer for display).
 * @returns {string} HTML markup for the star rating row, or empty string if count <= 0.
 *
 * @example
 * buildStars(42, 4.5);
 * // '<div style="...">★★★★★ <span>(42)</span></div>'
 *
 * @example
 * buildStars(0, 0);  // ''
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
 * Build the features list HTML section for a card.
 * Shows up to 3 features, each with a colored check icon.
 * Returns an empty string if there are no features.
 *
 * @param {string[]} features - Array of feature description strings (max 3 displayed).
 * @param {string} brandColor - Hex color for the check icons.
 * @returns {string} HTML markup for the features row, or empty string if no features.
 *
 * @example
 * buildFeatures(['Free shipping', '30-day returns', 'Warranty'], '#6366f1');
 * // '<div style="...">✓ Free shipping  ✓ 30-day returns  ✓ Warranty</div>'
 *
 * @example
 * buildFeatures([], '#000');  // ''
 */
export function buildFeatures(features, brandColor) {
  if (!features || !features.length) return '';
  const items = features.slice(0, 3).map(f =>
    `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#a1a1aa;">${checkIcon(brandColor)}${escapeHtml(f)}</span>`
  ).join('');
  return `<div style="display:flex;flex-wrap:wrap;gap:8px 16px;margin-bottom:16px;">${items}</div>`;
}

/**
 * Build the image section HTML for a card.
 * If an image URL is provided, renders the product image with an optional price badge overlay.
 * If no image URL is provided, renders a gradient placeholder with the brand icon.
 *
 * @param {string} imageUrl - Product image URL (empty string for gradient placeholder).
 * @param {string} productUrl - Link target URL for the image.
 * @param {string} name - Product name used for alt text.
 * @param {string} priceStr - Formatted price string for the badge overlay (empty to hide badge).
 * @param {string} brandColor - Brand color for the placeholder icon.
 * @returns {string} HTML markup for the image section.
 *
 * @example
 * buildImage('https://store.com/widget.jpg', 'https://store.com/widget', 'Widget', '$29.99', '#6366f1');
 * // '<a href="..."><img src="..." alt="Widget" /><span>$29.99</span></a>'
 *
 * @example
 * buildImage('', 'https://store.com/widget', 'Widget', '', '#6366f1');
 * // '<a href="..."><div style="...gradient...">...</div></a>'
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
 * All styles are inline — no external CSS needed. Safe for embedding
 * in Slack, Discord, social media, or any oEmbed consumer.
 *
 * The card includes: product image (or gradient placeholder), collection label,
 * product name, star ratings, description, feature checklist, CTA button,
 * and a branded footer.
 *
 * @param {Object} opts - Card configuration options.
 * @param {string} opts.productUrl - URL to the product page.
 * @param {string} opts.name - Product/item name.
 * @param {string} [opts.description] - Short description (clamped to 2 lines via CSS).
 * @param {string} [opts.imageUrl] - Product image URL (omit for gradient placeholder).
 * @param {string} [opts.collection] - Collection/category label shown above the name.
 * @param {string} [opts.priceStr] - Formatted price string (e.g. '$29.99') for badge and button.
 * @param {string} opts.brandColor - Brand accent color as hex string (e.g. '#6366f1').
 * @param {string} opts.storeName - Store/brand name displayed in the card footer.
 * @param {string[]} [opts.features] - Feature list (max 3 shown with check icons).
 * @param {number} [opts.ratingCount] - Number of ratings (0 hides the rating section).
 * @param {number} [opts.ratingAvg] - Average rating (0-5).
 * @param {number} opts.width - Card max width in pixels.
 * @returns {string} Self-contained HTML string ready for oEmbed embedding.
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

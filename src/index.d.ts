/**
 * @arraypress/oembed-card — TypeScript definitions.
 */

/** Options for building an oEmbed card. */
export interface OEmbedCardOptions {
  /** URL to the product/item page. */
  productUrl: string;
  /** Product/item name. */
  name: string;
  /** Short description (clamped to 2 lines). */
  description?: string;
  /** Product image URL. */
  imageUrl?: string;
  /** Collection/category label. */
  collection?: string;
  /** Formatted price string (e.g. '$29.99'). */
  priceStr?: string;
  /** Brand accent color (hex). */
  brandColor: string;
  /** Store/brand name for footer. */
  storeName: string;
  /** Feature list (max 3 shown). */
  features?: string[];
  /** Number of ratings. */
  ratingCount?: number;
  /** Average rating (0-5). */
  ratingAvg?: number;
  /** Card max width in pixels. */
  width: number;
}

/** Escape a string for safe HTML output. */
export function escapeHtml(str: string | undefined | null): string;

/** Generate an inline SVG check icon. */
export function checkIcon(color: string): string;

/** Generate an inline SVG star icon. */
export function starIcon(filled: boolean): string;

/** Generate an inline SVG logo/brand icon. */
export function logoIcon(color: string): string;

/** Build the star rating HTML. */
export function buildStars(count: number, avg: number): string;

/** Build the features list HTML. */
export function buildFeatures(features: string[], brandColor: string): string;

/** Build the image section HTML. */
export function buildImage(imageUrl: string, productUrl: string, name: string, priceStr: string, brandColor: string): string;

/** Build a self-contained HTML card for oEmbed rich responses. */
export function buildOEmbedCard(opts: OEmbedCardOptions): string;

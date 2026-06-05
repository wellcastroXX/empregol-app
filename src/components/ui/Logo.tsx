import WordmarkCream from '@/assets/images/logo/empregol-wordmark-cream.svg';
import WordmarkGreen from '@/assets/images/logo/empregol-wordmark-green.svg';
import WordmarkInk from '@/assets/images/logo/empregol-wordmark.svg';

export type LogoProps = {
  /** Glyph height in px (width scales with the wordmark aspect ratio). */
  size?: number;
  tone?: 'ink' | 'creme' | 'gramado';
};

/** Wordmark aspect ratio from the SVG viewBox (692 × 130.59). */
const RATIO = 692 / 130.59;

const VARIANTS = {
  ink: WordmarkInk,
  creme: WordmarkCream,
  gramado: WordmarkGreen,
} as const;

/** Global "empregol." wordmark — renders the brand SVG asset. */
export function Logo({ size = 28, tone = 'ink' }: LogoProps) {
  const Wordmark = VARIANTS[tone];
  const height = Math.round(size * 0.92);
  return <Wordmark width={Math.round(height * RATIO)} height={height} />;
}

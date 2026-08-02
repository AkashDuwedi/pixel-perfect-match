/**
 * Token accessors for JS consumers (charts, inline styles).
 * These mirror the CSS custom properties in src/styles.css — never
 * hardcode a hex value in a component; reference these instead.
 */

export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
] as const;

export const chartColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

/** 4px base spacing rhythm, in Tailwind step units. */
export const spacing = {
  tight: "gap-2",
  default: "gap-4",
  section: "gap-6",
  page: "gap-8",
} as const;

export const radius = {
  control: "rounded-lg",
  card: "rounded-xl",
  pill: "rounded-full",
} as const;

export const elevation = {
  flat: "elevation-1",
  raised: "elevation-2",
  floating: "elevation-3",
  overlay: "elevation-4",
} as const;

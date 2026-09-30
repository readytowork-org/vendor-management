// SVG sprite. Render once at the root; <Icon> references it.

/** Every icon id present in the sprite. */
export const ICON_NAMES = [
  "ic-waffle",
  "ic-search",
  "ic-gear",
  "ic-help",
  "ic-chevron-down",
  "ic-chevron-right",
  "ic-chevron-left",
  "ic-home",
  "ic-clock",
  "ic-pin",
  "ic-list",
  "ic-tag",
  "ic-history",
  "ic-building",
  "ic-import",
  "ic-chart",
  "ic-refresh",
  "ic-filter",
  "ic-more",
  "ic-export",
  "ic-menu",
  "ic-caret-up",
  "ic-caret-down",
  "ic-info",
  "ic-wrench",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export function IconSprite() {
  return (
    <svg className="sprite" aria-hidden="true">
      <symbol id="ic-waffle" viewBox="0 0 16 16">
        <g fill="currentColor"><rect x="1" y="1" width="4" height="4" rx=".5"/><rect x="6" y="1" width="4" height="4" rx=".5"/><rect x="11" y="1" width="4" height="4" rx=".5"/><rect x="1" y="6" width="4" height="4" rx=".5"/><rect x="6" y="6" width="4" height="4" rx=".5"/><rect x="11" y="6" width="4" height="4" rx=".5"/><rect x="1" y="11" width="4" height="4" rx=".5"/><rect x="6" y="11" width="4" height="4" rx=".5"/><rect x="11" y="11" width="4" height="4" rx=".5"/></g>
      </symbol>
      <symbol id="ic-search" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6.8" cy="6.8" r="4.3"/><path d="M10 10l4 4"/></g></symbol>
      <symbol id="ic-gear" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="2.4"/><path d="M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M12.5 3.5l-1.1 1.1M4.6 11.4l-1.1 1.1"/></g></symbol>
      <symbol id="ic-help" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="6.2"/><path d="M6.2 6.1c0-1 .8-1.7 1.8-1.7s1.8.7 1.8 1.6c0 1.4-1.8 1.4-1.8 2.7"/><circle cx="8" cy="11.4" r=".8" fill="currentColor" stroke="none"/></g></symbol>
      <symbol id="ic-chevron-down" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" strokeWidth="1.4" d="M3.5 6l4.5 4.5L12.5 6"/></symbol>
      <symbol id="ic-chevron-right" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" strokeWidth="1.4" d="M6 3.5L10.5 8 6 12.5"/></symbol>
      <symbol id="ic-chevron-left" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" strokeWidth="1.4" d="M10 3.5L5.5 8 10 12.5"/></symbol>
      <symbol id="ic-home" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" strokeWidth="1.3" d="M2.2 7.6L8 2.6l5.8 5v6.1H9.9v-3.9H6.1v3.9H2.2z"/></symbol>
      <symbol id="ic-clock" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.5V8l2.6 1.6"/></g></symbol>
      <symbol id="ic-pin" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M6 1.8h4l-.5 4.1 2.2 2.3v1.1H4.3V8.2l2.2-2.3z"/><path d="M8 9.3v4.9"/></g></symbol>
      <symbol id="ic-list" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M5.5 3.4h9M5.5 8h9M5.5 12.6h9"/><circle cx="2.4" cy="3.4" r="1"/><circle cx="2.4" cy="8" r="1"/><circle cx="2.4" cy="12.6" r="1"/></g></symbol>
      <symbol id="ic-tag" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M8.4 1.9H14v5.6l-6.5 6.5-5.6-5.6z"/><circle cx="11.3" cy="4.6" r="1.1"/></g></symbol>
      <symbol id="ic-history" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M2.3 8a5.7 5.7 0 1 0 1.9-4.2"/><path d="M2 1.9v3.4h3.4"/><path d="M8 5.1V8l2.3 1.5"/></g></symbol>
      <symbol id="ic-building" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M2.3 14V2.4h6.1V14"/><path d="M8.4 6.2h5.3V14"/><path d="M4.2 5h2.3M4.2 7.7h2.3M4.2 10.4h2.3M10.1 8.6h1.8M10.1 11.2h1.8"/></g></symbol>
      <symbol id="ic-import" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M8 1.8v7.6"/><path d="M5.2 6.8L8 9.6l2.8-2.8"/><path d="M2.2 11.3v2.9h11.6v-2.9"/></g></symbol>
      <symbol id="ic-chart" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M2 14h12"/><path d="M4.1 14V8.6M7.4 14V4.3M10.6 14V6.9M13.4 14V2.6"/></g></symbol>
      <symbol id="ic-refresh" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M13.4 8a5.4 5.4 0 1 1-1.8-4"/><path d="M13.7 2.2v3.5h-3.5"/></g></symbol>
      <symbol id="ic-filter" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" strokeWidth="1.3" d="M2 3.2h12L9.3 8.5v4.6L6.7 11.7V8.5z"/></symbol>
      <symbol id="ic-more" viewBox="0 0 16 16"><g fill="currentColor"><circle cx="3.2" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12.8" cy="8" r="1.2"/></g></symbol>
      <symbol id="ic-export" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M8 10.6V2.4"/><path d="M5.2 5.2L8 2.4l2.8 2.8"/><path d="M2.4 10.6v3.1h11.2v-3.1"/></g></symbol>
      <symbol id="ic-menu" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" strokeWidth="1.4" d="M2 4h12M2 8h12M2 12h12"/></symbol>
      <symbol id="ic-caret-up" viewBox="0 0 8 8"><path fill="currentColor" d="M4 1.6l3 4H1z"/></symbol>
      <symbol id="ic-caret-down" viewBox="0 0 8 8"><path fill="currentColor" d="M4 6.4l-3-4h6z"/></symbol>
      <symbol id="ic-info" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4"/><circle cx="8" cy="4.9" r=".8" fill="currentColor" stroke="none"/></g></symbol>
      <symbol id="ic-wrench" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M9.9 2.2a3.4 3.4 0 0 0 3.9 5.3l-6 6-2.4-2.4 6-6a3.4 3.4 0 0 1-1.5-2.9z"/></g></symbol>
    </svg>
  );
}

// Tile 1: year, city and material-name search with chips.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Icon } from "../Icon";
import { Tile, TileButton } from "./Tile";
import { itemLabel, matches, type Pricing } from "../../domain/pricing";
import type { CostDbMasters, CostItem, LocationKey, YearKey } from "../../domain/types";

/** Maximum number of suggestions rendered. */
const MAX_SUGGESTIONS = 40;

interface Suggestion {
  kind: "City" | "Middle item" | "Small item";
  /** Text shown in the row. */
  text: string;
  /** Metadata shown on the right. */
  meta: string;
  /** Keyword applied when a middle category is picked. */
  value: string;
  /** Item number, or null for a middle category / city. */
  no: number | null;
}

interface FilterTileProps {
  masters: CostDbMasters;
  items: CostItem[];
  pricing: Pricing;
  year: YearKey;
  location: LocationKey;
  keyword: string;
  /** Row count once this tile's filter is applied. */
  matchedCount: number;
  keywordInputRef: RefObject<HTMLInputElement | null>;
  onYearChange: (year: YearKey) => void;
  onLocationChange: (location: LocationKey) => void;
  /** Runs the search; selectedNo targets the charts. */
  onApplyKeyword: (keyword: string, selectedNo: number | null) => void;
  onReset: () => void;
  onFocusFilter: () => void;
  onDemoAction: (label: string) => void;
}

/** Wraps matched substrings so they can be highlighted. */
function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const needle = query.toLowerCase();
  const parts: ReactNode[] = [];
  let from = 0;
  let at = lower.indexOf(needle, from);
  let key = 0;
  while (at >= 0) {
    if (at > from) parts.push(text.slice(from, at));
    parts.push(
      <span className="mark" key={key++}>
        {text.slice(at, at + needle.length)}
      </span>,
    );
    from = at + needle.length;
    at = lower.indexOf(needle, from);
  }
  if (from < text.length) parts.push(text.slice(from));
  return parts;
}

function buildSuggestions(
  items: CostItem[],
  masters: CostDbMasters,
  query: string,
): Suggestion[] {
  const t = query.trim();
  if (!t) return [];
  const lower = t.toLowerCase();
  const out: Suggestion[] = [];

  // City / location matches.
  for (const loc of masters.locations) {
    if (!loc.label.toLowerCase().includes(lower) && !loc.pref.toLowerCase().includes(lower)) {
      continue;
    }
    out.push({
      kind: "City",
      text: loc.label,
      meta: loc.pref,
      value: loc.key,
      no: null,
    });
  }

  // Middle categories, i.e. groups.
  const seen = new Set<string>();
  for (const it of items) {
    if (seen.has(it.chuName)) continue;
    if (!it.chuName.toLowerCase().includes(lower)) continue;
    seen.add(it.chuName);
    const count = items.filter((x) => x.chuName === it.chuName).length;
    out.push({ kind: "Middle item", text: it.chuName, meta: `${count} items`, value: it.chuName, no: null });
  }

  // Individual line items.
  for (const it of items) {
    if (!matches(it, t)) continue;
    out.push({
      kind: "Small item",
      text: itemLabel(it),
      meta: `No.${it.no} / ${it.unit}`,
      value: it.name,
      no: it.no,
    });
  }

  return out.slice(0, MAX_SUGGESTIONS);
}

export function FilterTile({
  masters,
  items,
  pricing,
  year,
  location,
  keyword,
  matchedCount,
  keywordInputRef,
  onYearChange,
  onLocationChange,
  onApplyKeyword,
  onReset,
  onFocusFilter,
  onDemoAction,
}: FilterTileProps) {
  const [draft, setDraft] = useState(keyword);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Sync the draft when the applied keyword changes.
  // Adjusted during render, not in an effect.
  const [lastKeyword, setLastKeyword] = useState(keyword);
  if (keyword !== lastKeyword) {
    setLastKeyword(keyword);
    setDraft(keyword);
  }

  const suggestions = useMemo(
    () => (open ? buildSuggestions(items, masters, draft) : []),
    [open, items, masters, draft],
  );

  // Keep the active suggestion within the scroll view.
  useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Close the suggestion list on an outside click.
  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) closeSuggest();
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  function closeSuggest() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function applySuggestion(index: number) {
    const s = suggestions[index];
    if (!s) return;
    closeSuggest();
    if (s.kind === "City") {
      // Update the location filter to the picked city.
      onLocationChange(s.value);
      setDraft("");
      onApplyKeyword("", null);
    } else if (s.no !== null) {
      // Filter to this item and point the charts at it.
      setDraft(s.text);
      onApplyKeyword(s.text, s.no);
    } else {
      setDraft(s.value);
      onApplyKeyword(s.value, null);
    }
  }

  function onKeywordKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!suggestions.length) return;
      const delta = e.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((i) => (i + delta + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) applySuggestion(activeIndex);
      else {
        closeSuggest();
        onApplyKeyword(draft.trim(), null);
      }
    } else if (e.key === "Escape") {
      closeSuggest();
    }
  }

  function onKeywordChange(e: ChangeEvent<HTMLInputElement>) {
    setDraft(e.target.value);
    setOpen(Boolean(e.target.value.trim()));
    setActiveIndex(-1);
  }

  const loc = pricing.locationDef(location);
  const locationLabel = loc ? loc.label : location.replace(/^pref:/, "");
  const registeredPrefs = new Set(masters.locations.map((l) => l.pref));
  const otherPrefs = masters.prefectures.filter((p) => !registeredPrefs.has(p));

  return (
    <Tile
      title="Search & filter"
      span={6}
      actions={
        <>
          <TileButton icon="ic-refresh" title="Clear filters" onClick={onReset} />
          <TileButton icon="ic-filter" title="Filter" onClick={onFocusFilter} />
          <TileButton
            icon="ic-more"
            title="More"
            onClick={() => onDemoAction("More search and filter commands")}
          />
        </>
      }
    >
      <div className="filterbar">
        <div className="field">
          <label className="field-label" htmlFor="selYear">
            Fiscal year
          </label>
          <div className="select-wrap">
            <select
              className="input"
              id="selYear"
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
            >
              {masters.years.map((y) => (
                <option key={y.key} value={y.key}>
                  {y.label}
                </option>
              ))}
            </select>
            <Icon name="ic-chevron-down" size={12} className="select-caret" />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="selLocation">
            City
          </label>
          <div className="select-wrap">
            <select
              className="input"
              id="selLocation"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
            >
              <optgroup label="Registered cities">
                {masters.locations.map((l) => (
                  <option key={l.key} value={l.key}>
                    {`${l.label} (${l.pref})`}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other prefectures (no unit price data)">
                {otherPrefs.map((p) => (
                  <option key={p} value={`pref:${p}`}>
                    {p}
                  </option>
                ))}
              </optgroup>
            </select>
            <Icon name="ic-chevron-down" size={12} className="select-caret" />
          </div>
        </div>

        <div className="field field-grow">
          <label className="field-label" htmlFor="txtKeyword">
            Item name (middle/small) or city
          </label>
          <div className="suggest-wrap" ref={wrapRef}>
            <Icon name="ic-search" className="input-ic" />
            <input
              className="input input-with-ic"
              id="txtKeyword"
              type="text"
              autoComplete="off"
              placeholder="Example: rebar, mechanical joint, anchor plate, Tokyo…"
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              aria-controls="suggestList"
              ref={keywordInputRef}
              value={draft}
              onChange={onKeywordChange}
              onFocus={() => {
                if (draft.trim()) setOpen(true);
              }}
              onKeyDown={onKeywordKeyDown}
            />
            <div className="suggest" id="suggestList" role="listbox" hidden={!open} ref={listRef}>
              {open && suggestions.length === 0 && (
                <div className="suggest-empty">No matching items or cities found</div>
              )}
              {suggestions.map((s, i) => (
                <div
                  className={"suggest-item" + (i === activeIndex ? " is-active" : "")}
                  role="option"
                  aria-selected={i === activeIndex}
                  key={`${s.kind}-${s.no ?? s.value}-${i}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applySuggestion(i);
                  }}
                >
                  <span className="suggest-kind">{s.kind}</span>
                  <span className="suggest-main">{highlight(s.text, draft.trim())}</span>
                  <span className="suggest-meta">{s.meta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="field field-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              closeSuggest();
              onApplyKeyword(draft.trim(), null);
            }}
          >
            Search
          </button>
          <button className="btn" type="button" onClick={onReset}>
            Clear
          </button>
        </div>
      </div>

      <div className="chips">
        <span className="chips-label">Applied filters:</span>
        <span className="chip">
          Fiscal year <b>{pricing.yearDef(year).label}</b>
        </span>
        <span className={"chip" + (loc ? "" : " chip-warn")}>
          City <b>{locationLabel}</b>
          {loc ? "" : " (no unit price data)"}
        </span>
        <span className="chip">
          Item name <b>{keyword || "All"}</b>
        </span>
        <span className="chip">
          Matching <b>{matchedCount}</b> items
        </span>
      </div>
    </Tile>
  );
}

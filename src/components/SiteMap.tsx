import { Icon } from "./Icon";
import { SCREENS, type ScreenKey } from "../domain/screens";

/** Standard Power Apps chrome. No business behaviour. */
const CHROME_ITEMS = [
  { key: "home", label: "Home", icon: "ic-home", caret: false },
  { key: "recent", label: "Recently used", icon: "ic-clock", caret: true },
  { key: "pinned", label: "Pinned", icon: "ic-pin", caret: true },
] as const;

interface SiteMapProps {
  screen: ScreenKey;
  onSelect: (screen: ScreenKey) => void;
  onToggleNav: () => void;
  onDemoAction: (label: string) => void;
  modelDrivenAppUrl: string;
  onOpenModelDrivenApp: () => void;
}

export function SiteMap({
  screen,
  onSelect,
  onToggleNav,
  onDemoAction,
  modelDrivenAppUrl,
  onOpenModelDrivenApp,
}: SiteMapProps) {
  return (
    <nav className="sitemap" aria-label="Site map">
      <div className="sitemap-head">
        <button
          className="nav-collapse"
          type="button"
          title="Toggle navigation"
          aria-label="Toggle navigation"
          onClick={onToggleNav}
        >
          <Icon name="ic-menu" />
        </button>
        <img className="app-logo" src="./logomark.svg" alt="" />
        <span className="app-name">COSTDB</span>
      </div>

      <ul className="nav-list nav-list-top">
        {CHROME_ITEMS.map((item) => (
          <li key={item.key}>
            <a
              className="nav-item"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onDemoAction(item.label);
              }}
            >
              <Icon name={item.icon} className="nav-ic" />
              <span>{item.label}</span>
              {item.caret && <Icon name="ic-chevron-down" size={12} className="nav-caret" />}
            </a>
          </li>
        ))}
      </ul>

      <div className="nav-divider" />
      <div className="nav-group-label">COSTDB</div>

      <ul className="nav-list">
        <li>
          <a
            className="nav-item"
            href={modelDrivenAppUrl || "#"}
            onClick={(e) => {
              if (!modelDrivenAppUrl) {
                e.preventDefault();
                onOpenModelDrivenApp();
              }
            }}
          >
            <Icon name="ic-wrench" className="nav-ic" />
            <span>Model-driven app</span>
          </a>
        </li>
      </ul>

      <ul className="nav-list">
        {SCREENS.map((def) => (
          <li key={def.key}>
            <a
              className={"nav-item" + (screen === def.key ? " is-selected" : "")}
              href="#"
              aria-current={screen === def.key ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                onSelect(def.key);
              }}
            >
              <Icon name={def.icon} className="nav-ic" />
              <span>{def.title}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="sitemap-foot">
        <img src="./logo.svg" alt="Company logo" className="corp-logo" />
      </div>
    </nav>
  );
}

import { Icon } from "./Icon";

interface TopBarProps {
  /** Last breadcrumb segment, i.e. the screen name. */
  pageTitle: string;
  /** Always shown so the environment is never mistaken. */
  environmentLabel: string;
  /** Tooltip carrying the real environment and org URL. */
  environmentTitle: string;
  /** Initials of the signed-in user. */
  userInitials: string;
  /** Tooltip on the avatar. */
  userTitle: string;
  onDemoAction: (label: string) => void;
}

export function TopBar({
  pageTitle,
  environmentLabel,
  environmentTitle,
  userInitials,
  userTitle,
  onDemoAction,
}: TopBarProps) {
  return (
    <header className="topbar">
      <button
        className="topbar-btn"
        type="button"
        title="App launcher"
        aria-label="App launcher"
        onClick={() => onDemoAction("App launcher")}
      >
        <Icon name="ic-waffle" />
      </button>
      <span className="topbar-brand">Power Apps</span>
      <span className="topbar-sep" aria-hidden="true" />
      <nav className="crumbs" aria-label="Breadcrumb">
        <span className="crumb crumb-app">COSTDB</span>
        <Icon name="ic-chevron-right" size={12} className="crumb-arrow" />
        <span className="crumb">{pageTitle}</span>
      </nav>
      <div className="topbar-right">
        <span className="env-chip" title={environmentTitle}>
          {environmentLabel}
        </span>
        <button
          className="topbar-btn"
          type="button"
          title="Search"
          aria-label="Search"
          onClick={() => onDemoAction("Search")}
        >
          <Icon name="ic-search" />
        </button>
        <button
          className="topbar-btn"
          type="button"
          title="Settings"
          aria-label="Settings"
          onClick={() => onDemoAction("Settings")}
        >
          <Icon name="ic-gear" />
        </button>
        <button
          className="topbar-btn"
          type="button"
          title="Help"
          aria-label="Help"
          onClick={() => onDemoAction("Help")}
        >
          <Icon name="ic-help" />
        </button>
        <span className="avatar" title={userTitle}>
          {userInitials}
        </span>
      </div>
    </header>
  );
}

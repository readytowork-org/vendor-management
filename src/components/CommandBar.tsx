import { Icon } from "./Icon";

interface CommandBarProps {
  title: string;
  /** Export is only offered on the dashboard screen. */
  showExport: boolean;
  /** The last-updated stamp. */
  stamp: string;
  onRefresh: () => void;
  onDemoAction: (label: string) => void;
}

export function CommandBar({
  title,
  showExport,
  stamp,
  onRefresh,
  onDemoAction,
}: CommandBarProps) {
  return (
    <div className="cmdbar">
      <button className="cmd-title" type="button" onClick={() => onDemoAction(title)}>
        <span>{title}</span>
        <Icon name="ic-chevron-down" size={12} />
      </button>
      <span className="cmd-sep" aria-hidden="true" />
      <button className="cmd-btn" type="button" onClick={onRefresh}>
        <Icon name="ic-refresh" />
        <span>Refresh</span>
      </button>
      {showExport && (
        <button
          className="cmd-btn"
          type="button"
          onClick={() => onDemoAction("Export to Excel")}
        >
          <Icon name="ic-export" />
          <span>Export to Excel</span>
        </button>
      )}
      <button
        className="cmd-btn cmd-icon-only"
        type="button"
        title="More commands"
        aria-label="More commands"
        onClick={() => onDemoAction("More commands")}
      >
        <Icon name="ic-more" />
      </button>
      <span className="cmd-spacer" />
      <span className="cmd-stamp">{stamp}</span>
    </div>
  );
}

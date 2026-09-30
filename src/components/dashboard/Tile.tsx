import type { ReactNode } from "react";
import { Icon, type IconName } from "../Icon";

interface TileProps {
  title: string;
  /** Columns spanned in the six column tile grid. */
  span: 2 | 4 | 6;
  /** Row count shown beside the title. */
  count?: string;
  actions?: ReactNode;
  /** Drops the body padding, used by the grid tile. */
  flush?: boolean;
  children: ReactNode;
}

export function Tile({ title, span, count, actions, flush, children }: TileProps) {
  return (
    <section className={`tile span${span}`}>
      <div className="tile-head">
        <h2 className="tile-title">{title}</h2>
        {count && <span className="tile-count">{count}</span>}
        <div className="tile-actions">{actions}</div>
      </div>
      <div className={"tile-body" + (flush ? " tile-body-flush" : "")}>{children}</div>
    </section>
  );
}

interface TileButtonProps {
  icon: IconName;
  title: string;
  onClick: () => void;
}

export function TileButton({ icon, title, onClick }: TileButtonProps) {
  return (
    <button className="tile-btn" type="button" title={title} aria-label={title} onClick={onClick}>
      <Icon name={icon} />
    </button>
  );
}

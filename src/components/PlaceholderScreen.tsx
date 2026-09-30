import { Icon } from "./Icon";
import type { ScreenDef } from "../domain/screens";

interface PlaceholderScreenProps {
  def: ScreenDef;
  onBackToDashboard: () => void;
}

export function PlaceholderScreen({ def, onBackToDashboard }: PlaceholderScreenProps) {
  return (
    <div className="screen">
      <div className="placeholder">
        <Icon name={def.icon} size={0} className="placeholder-ic" />
        <h2 className="placeholder-title">{def.title}</h2>
        <p className="placeholder-badge">This screen is under development</p>
        <p className="placeholder-desc">{def.desc}</p>
        <ul className="placeholder-list">
          {def.list?.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <button className="btn btn-primary" type="button" onClick={onBackToDashboard}>
          Show analytics dashboard
        </button>
      </div>
    </div>
  );
}

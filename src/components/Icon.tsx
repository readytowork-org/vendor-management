import type { IconName } from "./IconSprite";

export type { IconName };

interface IconProps {
  name: IconName;
  /** Maps to .ic10/.ic12/.ic16. Pass 0 for no size class. */
  size?: 0 | 10 | 12 | 16;
  className?: string;
}

export function Icon({ name, size = 16, className }: IconProps) {
  const cls = ["ic", size ? `ic${size}` : "", className].filter(Boolean).join(" ");
  return (
    <svg className={cls} aria-hidden="true">
      <use href={`#${name}`} />
    </svg>
  );
}

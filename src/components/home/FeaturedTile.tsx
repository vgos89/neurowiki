// HOME_SPEC §1.25.4 — featured tile visual contract
// HOME_SPEC §1.25.5 — three lines: type label, name, description
// Tinted card, no border, no dot. 8% bg → 10% on hover.
// 2026-05-19 (V direction): tiles shrunk + width-released so the 4 featured
// items fit on one screen in a 2×2 mobile grid / 4-across desktop. Padding,
// type-label scale, name scale, and description scale all stepped down.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FeaturedItem } from '../../data/featured';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface Props {
  item: FeaturedItem;
}

export const FeaturedTile: React.FC<Props> = ({ item }) => {
  const [hovered, setHovered] = useState(false);
  const alpha = hovered ? 0.1 : 0.08;
  const bg = hexToRgba(item.categoryColor, alpha);

  return (
    <Link
      to={item.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="featured-tile min-h-[88px] p-3 rounded-[12px] border-0 cursor-pointer text-left transition-colors block"
      style={{ backgroundColor: bg }}
    >
      <div className="text-[9.5px] font-semibold uppercase text-slate-600 tracking-[0.06em] mb-1">
        {item.type === 'pathway' ? 'Pathway' : 'Calculator'}
      </div>
      <div className="text-[13.5px] font-semibold text-slate-900 leading-tight tracking-tight mb-1">
        {item.name}
      </div>
      <div className="text-[11px] text-slate-600 leading-snug">
        {item.description}
      </div>
    </Link>
  );
};

export default FeaturedTile;

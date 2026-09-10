/**
 * Neighbuur Spot Illustrations
 *
 * Geometrische illustraties in het Neighbuur-palet.
 * Gebruik deze als fallback; vervang ze op termijn door
 * AI-gegenereerde illustraties in de warme editorial stijl.
 *
 * Alle illustraties gebruiken enkel merkkleurenL
 * - terracotta (#E8572A)
 * - groen (#2A8C5A)
 * - blauw (#2A6BE8)
 * - oker (#C4871A)
 * - cream (#FAF7F2) / sand (#F0EAE0)
 */

import { cn } from "@/lib/utils";

type IllusProps = { className?: string; size?: number };

export function IllusHuis({ className, size = 200 }: IllusProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={cn("flex-shrink-0", className)}>
      {/* Ground shadow */}
      <ellipse cx="100" cy="172" rx="70" ry="8" fill="#E8572A" opacity="0.06" />
      {/* House body */}
      <rect x="52" y="82" width="96" height="88" rx="4" fill="white" stroke="#E8572A" strokeWidth="2" />
      {/* Roof */}
      <path d="M42 88 L100 42 L158 88" stroke="#E8572A" strokeWidth="2.5" fill="#FFF5F0" strokeLinecap="round" strokeLinejoin="round" />
      {/* Door */}
      <rect x="84" y="125" width="32" height="45" rx="16" fill="#E8572A" opacity="0.12" stroke="#E8572A" strokeWidth="1.5" />
      <circle cx="108" cy="150" r="2.5" fill="#E8572A" />
      {/* Windows */}
      <rect x="62" y="95" width="22" height="22" rx="3" fill="#EBF1FF" stroke="#2A6BE8" strokeWidth="1.5" />
      <line x1="73" y1="95" x2="73" y2="117" stroke="#2A6BE8" strokeWidth="1" opacity="0.5" />
      <line x1="62" y1="106" x2="84" y2="106" stroke="#2A6BE8" strokeWidth="1" opacity="0.5" />
      <rect x="116" y="95" width="22" height="22" rx="3" fill="#EBF1FF" stroke="#2A6BE8" strokeWidth="1.5" />
      <line x1="127" y1="95" x2="127" y2="117" stroke="#2A6BE8" strokeWidth="1" opacity="0.5" />
      <line x1="116" y1="106" x2="138" y2="106" stroke="#2A6BE8" strokeWidth="1" opacity="0.5" />
      {/* Key */}
      <circle cx="100" cy="30" r="7" fill="none" stroke="#E8572A" strokeWidth="2" />
      <line x1="107" y1="30" x2="122" y2="30" stroke="#E8572A" strokeWidth="2" strokeLinecap="round" />
      <line x1="118" y1="30" x2="118" y2="37" stroke="#E8572A" strokeWidth="2" strokeLinecap="round" />
      {/* Plant left */}
      <ellipse cx="30" cy="168" rx="14" ry="6" fill="#2A8C5A" opacity="0.15" />
      <rect x="28" y="148" width="4" height="22" rx="2" fill="#2A8C5A" opacity="0.3" />
      <circle cx="30" cy="145" r="10" fill="#2A8C5A" opacity="0.2" />
      <circle cx="24" cy="150" r="7" fill="#2A8C5A" opacity="0.15" />
      {/* Plant right */}
      <ellipse cx="170" cy="168" rx="12" ry="5" fill="#2A8C5A" opacity="0.15" />
      <rect x="168" y="150" width="4" height="20" rx="2" fill="#2A8C5A" opacity="0.3" />
      <circle cx="170" cy="147" r="9" fill="#2A8C5A" opacity="0.2" />
    </svg>
  );
}

export function IllusStucwerk({ className, size = 160 }: IllusProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={cn("flex-shrink-0", className)}>
      <rect x="20" y="30" width="120" height="100" rx="4" fill="#F0EAE0" />
      {/* Wall texture lines */}
      <line x1="30" y1="50" x2="130" y2="50" stroke="#E5DDD0" strokeWidth="1" />
      <line x1="30" y1="70" x2="130" y2="70" stroke="#E5DDD0" strokeWidth="1" />
      <line x1="30" y1="90" x2="130" y2="90" stroke="#E5DDD0" strokeWidth="1" />
      {/* Smooth section */}
      <rect x="20" y="30" width="65" height="100" rx="4" fill="white" stroke="#E8572A" strokeWidth="1.5" opacity="0.8" />
      {/* Trowel */}
      <rect x="90" y="55" width="40" height="6" rx="3" fill="#C4871A" />
      <rect x="95" y="48" width="30" height="4" rx="2" fill="#E8572A" opacity="0.6" />
      <line x1="110" y1="61" x2="110" y2="80" stroke="#8A877F" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bucket */}
      <rect x="28" y="108" width="24" height="20" rx="2" fill="#8A877F" opacity="0.2" stroke="#8A877F" strokeWidth="1.5" />
      <ellipse cx="40" cy="108" rx="12" ry="3" fill="none" stroke="#8A877F" strokeWidth="1.5" />
    </svg>
  );
}

export function IllusSchilderen({ className, size = 160 }: IllusProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={cn("flex-shrink-0", className)}>
      {/* Paint can */}
      <rect x="30" y="60" width="40" height="50" rx="4" fill="#E8572A" opacity="0.15" stroke="#E8572A" strokeWidth="1.5" />
      <ellipse cx="50" cy="60" rx="20" ry="6" fill="#E8572A" opacity="0.2" stroke="#E8572A" strokeWidth="1.5" />
      {/* Paint drip */}
      <path d="M70 65 Q75 65 75 80 Q75 90 72 95" stroke="#E8572A" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Roller */}
      <rect x="88" y="30" width="30" height="18" rx="9" fill="#E8572A" opacity="0.8" stroke="#E8572A" strokeWidth="1.5" />
      <rect x="100" y="48" width="6" height="60" rx="3" fill="#C4871A" opacity="0.5" />
      <rect x="98" y="105" width="10" height="14" rx="2" fill="#8A877F" opacity="0.3" />
      {/* Color swatches */}
      <circle cx="40" cy="135" r="8" fill="#E8572A" opacity="0.3" />
      <circle cx="60" cy="135" r="8" fill="#2A8C5A" opacity="0.3" />
      <circle cx="80" cy="135" r="8" fill="#2A6BE8" opacity="0.3" />
    </svg>
  );
}

export function IllusVloeren({ className, size = 160 }: IllusProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={cn("flex-shrink-0", className)}>
      {/* Floor planks - herringbone pattern */}
      <rect x="25" y="50" width="50" height="16" rx="2" fill="#C4871A" opacity="0.2" stroke="#C4871A" strokeWidth="1" transform="rotate(-15 50 58)" />
      <rect x="45" y="65" width="50" height="16" rx="2" fill="#C4871A" opacity="0.3" stroke="#C4871A" strokeWidth="1" transform="rotate(15 70 73)" />
      <rect x="25" y="80" width="50" height="16" rx="2" fill="#C4871A" opacity="0.2" stroke="#C4871A" strokeWidth="1" transform="rotate(-15 50 88)" />
      <rect x="45" y="95" width="50" height="16" rx="2" fill="#C4871A" opacity="0.35" stroke="#C4871A" strokeWidth="1" transform="rotate(15 70 103)" />
      {/* Stacked planks */}
      <rect x="95" y="70" width="40" height="10" rx="2" fill="#C4871A" opacity="0.25" stroke="#C4871A" strokeWidth="1" />
      <rect x="97" y="62" width="40" height="10" rx="2" fill="#C4871A" opacity="0.2" stroke="#C4871A" strokeWidth="1" />
      <rect x="99" y="54" width="40" height="10" rx="2" fill="#C4871A" opacity="0.15" stroke="#C4871A" strokeWidth="1" />
    </svg>
  );
}

export function IllusKeuken({ className, size = 160 }: IllusProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={cn("flex-shrink-0", className)}>
      {/* Counter */}
      <rect x="20" y="80" width="120" height="50" rx="4" fill="#2A8C5A" opacity="0.12" stroke="#2A8C5A" strokeWidth="1.5" />
      {/* Counter top */}
      <rect x="18" y="76" width="124" height="8" rx="2" fill="#C4871A" opacity="0.2" />
      {/* Cabinet doors */}
      <rect x="28" y="90" width="30" height="34" rx="3" fill="white" stroke="#2A8C5A" strokeWidth="1" opacity="0.6" />
      <rect x="64" y="90" width="30" height="34" rx="3" fill="white" stroke="#2A8C5A" strokeWidth="1" opacity="0.6" />
      <circle cx="55" cy="107" r="1.5" fill="#2A8C5A" opacity="0.5" />
      <circle cx="91" cy="107" r="1.5" fill="#2A8C5A" opacity="0.5" />
      {/* Hanging lamps */}
      <line x1="50" y1="25" x2="50" y2="50" stroke="#8A877F" strokeWidth="1" />
      <path d="M38 50 Q50 56 62 50" stroke="#8A877F" strokeWidth="1.5" fill="none" />
      <line x1="110" y1="25" x2="110" y2="50" stroke="#8A877F" strokeWidth="1" />
      <path d="M98 50 Q110 56 122 50" stroke="#8A877F" strokeWidth="1.5" fill="none" />
      {/* Plant */}
      <rect x="108" y="60" width="16" height="16" rx="8" fill="#C4871A" opacity="0.15" stroke="#C4871A" strokeWidth="1" />
      <circle cx="116" cy="54" r="8" fill="#2A8C5A" opacity="0.2" />
      <circle cx="112" cy="58" r="5" fill="#2A8C5A" opacity="0.15" />
    </svg>
  );
}

export function IllusBadkamer({ className, size = 160 }: IllusProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={cn("flex-shrink-0", className)}>
      {/* Mirror */}
      <circle cx="80" cy="55" r="30" fill="#EBF1FF" stroke="#2A6BE8" strokeWidth="1.5" opacity="0.5" />
      <circle cx="80" cy="55" r="25" fill="white" opacity="0.5" />
      {/* Vanity */}
      <rect x="40" y="90" width="80" height="35" rx="4" fill="white" stroke="#8A877F" strokeWidth="1.5" />
      {/* Sink */}
      <ellipse cx="80" cy="95" rx="20" ry="6" fill="#EBF1FF" stroke="#2A6BE8" strokeWidth="1" />
      {/* Faucet */}
      <path d="M80 85 L80 78 Q80 74 84 74 L90 74" stroke="#8A877F" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Bottle */}
      <rect x="112" y="78" width="10" height="16" rx="3" fill="#2A8C5A" opacity="0.2" stroke="#2A8C5A" strokeWidth="1" />
      <rect x="114" y="74" width="6" height="6" rx="1" fill="#2A8C5A" opacity="0.15" />
    </svg>
  );
}

export function IllusTuin({ className, size = 160 }: IllusProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={cn("flex-shrink-0", className)}>
      {/* Fence */}
      <rect x="10" y="70" width="8" height="50" rx="1" fill="#C4871A" opacity="0.25" stroke="#C4871A" strokeWidth="1" />
      <rect x="28" y="70" width="8" height="50" rx="1" fill="#C4871A" opacity="0.25" stroke="#C4871A" strokeWidth="1" />
      <rect x="46" y="70" width="8" height="50" rx="1" fill="#C4871A" opacity="0.25" stroke="#C4871A" strokeWidth="1" />
      <rect x="8" y="80" width="48" height="4" rx="1" fill="#C4871A" opacity="0.2" />
      <rect x="8" y="100" width="48" height="4" rx="1" fill="#C4871A" opacity="0.2" />
      {/* Big plant */}
      <rect x="90" y="95" width="20" height="28" rx="3" fill="#C4871A" opacity="0.15" stroke="#C4871A" strokeWidth="1" />
      <circle cx="100" cy="80" r="18" fill="#2A8C5A" opacity="0.2" />
      <circle cx="92" cy="88" r="12" fill="#2A8C5A" opacity="0.15" />
      <circle cx="110" cy="85" r="10" fill="#2A8C5A" opacity="0.15" />
      <rect x="98" y="90" width="4" height="8" rx="2" fill="#2A8C5A" opacity="0.3" />
      {/* Ground */}
      <ellipse cx="80" cy="130" rx="65" ry="6" fill="#2A8C5A" opacity="0.08" />
      {/* Grass tufts */}
      <path d="M65 125 Q67 115 69 125" stroke="#2A8C5A" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M130 122 Q132 112 134 122" stroke="#2A8C5A" strokeWidth="1.5" fill="none" opacity="0.3" />
    </svg>
  );
}

/** Map dienst-slug to illustration component */
export const dienstIllustraties: Record<string, React.FC<IllusProps>> = {
  stucwerk: IllusStucwerk,
  schilderwerk: IllusSchilderen,
  vloeren: IllusVloeren,
  keuken: IllusKeuken,
  badkamer: IllusBadkamer,
  tuin: IllusTuin,
};

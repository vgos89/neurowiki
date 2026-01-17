
import React from 'react';

interface AspectsBrainMapProps {
  side: 'left' | 'right';
  selectedRegions: Set<string>;
  onToggle: (regionId: string) => void;
}

const AspectsBrainMap: React.FC<AspectsBrainMapProps> = ({ side, selectedRegions, onToggle }) => {
  // Helper to determine if a region is selected
  const isSelected = (id: string) => selectedRegions.has(id);

  // Common styles
  const baseFill = "#f1f5f9"; // slate-100
  const activeFill = "#fb7185"; // rose-400
  const strokeColor = "#94a3b8"; // slate-400
  const hoverClass = "cursor-pointer hover:opacity-80 transition-all duration-200 active:scale-[0.98]";

  // Path definitions for a Schematic Right Hemisphere (we will mirror for Left)
  // Center X is 0 for the group, we'll translate it.
  
  // Supraganglionic (Top Slice) - M4, M5, M6
  const pathM4 = "M 0,-80 L 0,-10 C 30,-10 50,-20 60,-40 C 50,-60 30,-80 0,-80 Z";
  const pathM5 = "M 60,-40 C 70,-20 70,20 60,40 C 50,20 30,10 0,10 L 0,-10 C 30,-10 50,-20 60,-40 Z"; 
  const pathM6 = "M 0,10 C 30,10 50,20 60,40 C 50,70 30,90 0,90 L 0,10 Z";

  // Ganglionic (Bottom Slice) - C, L, IC, I, M1, M2, M3
  // Internal structures simplified
  const pathC = "M 10,-40 C 25,-40 25,-25 10,-25 C 5,-25 5,-40 10,-40 Z"; // Caudate
  const pathL = "M 35,-25 L 45,-15 L 35,-5 L 25,-15 Z"; // Lentiform (triangle-ish)
  const pathIC = "M 25,-25 L 35,-15 L 25,-5 L 20,-5 L 20,-20 Z"; // Internal Capsule (V shape approx) - actually simpler to make it a wedge between C and L
  // Let's refine IC/C/L for better schematic clickability
  // C: Head of Caudate
  const dC = "M 5,-50 L 25,-50 L 25,-30 L 5,-30 Z"; 
  // L: Lentiform
  const dL = "M 30,-30 L 50,-30 L 50,-10 L 30,-10 Z";
  // IC: Internal Capsule (Between C/L and midline)
  const dIC = "M 5,-30 L 25,-30 L 30,-30 L 30,-10 L 5,-10 Z"; // Simplification for click target
  
  // Actually, let's use a standard wedge map style
  // M1: Anterior Cortex
  const dM1 = "M 0,-90 L 0,-20 L 55,-40 C 40,-70 20,-85 0,-90 Z";
  // M2: Lateral Cortex
  const dM2 = "M 55,-40 L 0,-20 L 0,20 L 55,40 C 65,10 65,-10 55,-40 Z";
  // M3: Posterior Cortex
  const dM3 = "M 0,90 L 0,20 L 55,40 C 40,70 20,85 0,90 Z";
  
  // Deep structures (Overlaying the inner part of M1/M2/M3 visually, but logically separate)
  // We'll place them in the center.
  // Insula (I): Strip lateral to deep nuclei
  const dI = "M 35,-25 L 45,-25 L 45,25 L 35,25 Z";
  // Lentiform (L): Medial to Insula
  const dLen = "M 15,-15 L 35,-15 L 35,15 L 15,15 Z";
  // Caudate (C): Anterior Medial
  const dCau = "M 5,-45 L 25,-45 L 25,-20 L 5,-20 Z";
  // Internal Capsule (IC): Posterior Medial (simplified posterior limb)
  const dIntCap = "M 5,-15 L 15,-15 L 15,15 L 5,15 Z";

  // Refined Geometry for better visual appeal
  const renderRegion = (idSuffix: string, path: string, labelX: number, labelY: number, label: string) => {
    const fullId = side === 'right' ? `R-${idSuffix}` : `L-${idSuffix}`; // Current side renders
    // However, we render BOTH sides. The SVG draws left and right.
    // The prop `side` tells us which one is active/highlighted in the UI context, 
    // but the map shows both hemispheres.
    
    // We need to generate the ID based on WHICH hemisphere we are currently drawing in the loop.
    // So this helper needs to know if it's drawing the left or right side.
    return null; 
  };

  const RegionPath = ({ regionKey, d, lx, ly, label, isRight }: { regionKey: string, d: string, lx: number, ly: number, label: string, isRight: boolean }) => {
    const id = `${isRight ? 'R' : 'L'}-${regionKey}`;
    const selected = isSelected(id);
    const activeSide = side === (isRight ? 'right' : 'left');
    
    return (
      <g 
        onClick={() => onToggle(id)} 
        className={hoverClass}
        style={{ opacity: activeSide ? 1 : 0.5 }}
      >
        <path 
          d={d} 
          fill={selected ? activeFill : baseFill} 
          stroke={strokeColor} 
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <text 
          x={lx} 
          y={ly} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          className={`text-[10px] font-bold pointer-events-none select-none ${selected ? 'fill-white' : 'fill-slate-500'}`}
        >
          {label}
        </text>
      </g>
    );
  };

  const Hemisphere = ({ isRight }: { isRight: boolean }) => {
    const scaleX = isRight ? 1 : -1;
    // Labels need to be un-mirrored if we scale the group
    // Easier to just mirror coordinates in paths or use transform scale but invert text scale
    
    return (
      <g transform={`scale(${scaleX}, 1)`}>
        {/* We use a negative scale for Left, so text needs to be flipped back. 
            Actually, let's just draw right side, and for left side we place it at x < 0 and flip geometry.
        */}
      </g>
    );
  };

  return (
    <svg viewBox="0 0 320 520" className="w-full h-auto select-none touch-manipulation">
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* --- TOP SLICE (Supraganglionic) --- */}
      <g transform="translate(160, 130)">
        <text x="0" y="-110" textAnchor="middle" className="fill-slate-400 text-xs font-bold uppercase tracking-widest">Supraganglionic</text>
        
        {/* Right Hemisphere Top */}
        <g transform="translate(5, 0)">
           <RegionPath regionKey="M4" isRight={true} d="M 0,-90 C 40,-90 70,-60 70,-30 L 0,-10 L 0,-90 Z" lx={30} ly={-50} label="M4" />
           <RegionPath regionKey="M5" isRight={true} d="M 70,-30 C 70,10 50,40 30,50 L 0,-10 L 70,-30 Z" lx={45} ly={0} label="M5" />
           <RegionPath regionKey="M6" isRight={true} d="M 30,50 C 10,60 0,60 0,90 L 0,-10 L 30,50 Z" lx={15} ly={60} label="M6" />
        </g>

        {/* Left Hemisphere Top (Mirrored) */}
        <g transform="translate(-5, 0) scale(-1, 1)">
           <RegionPath regionKey="M4" isRight={false} d="M 0,-90 C 40,-90 70,-60 70,-30 L 0,-10 L 0,-90 Z" lx={30} ly={-50} label="M4" />
           <RegionPath regionKey="M5" isRight={false} d="M 70,-30 C 70,10 50,40 30,50 L 0,-10 L 70,-30 Z" lx={45} ly={0} label="M5" />
           <RegionPath regionKey="M6" isRight={false} d="M 30,50 C 10,60 0,60 0,90 L 0,-10 L 30,50 Z" lx={15} ly={60} label="M6" />
        </g>
      </g>


      {/* --- BOTTOM SLICE (Ganglionic) --- */}
      <g transform="translate(160, 380)">
        <text x="0" y="-130" textAnchor="middle" className="fill-slate-400 text-xs font-bold uppercase tracking-widest">Ganglionic</text>

        {/* Right Hemisphere Bottom */}
        <g transform="translate(5, 0)">
           {/* Cortex */}
           <RegionPath regionKey="M1" isRight={true} d="M 0,-100 L 0,-20 L 80,-40 C 70,-80 40,-100 0,-100 Z" lx={40} ly={-70} label="M1" />
           <RegionPath regionKey="M2" isRight={true} d="M 80,-40 L 0,-20 L 0,20 L 80,40 C 90,10 90,-20 80,-40 Z" lx={65} ly={0} label="M2" />
           <RegionPath regionKey="M3" isRight={true} d="M 0,100 L 0,20 L 80,40 C 70,80 40,100 0,100 Z" lx={40} ly={70} label="M3" />
           
           {/* Deep Structures - Drawn on top */}
           <RegionPath regionKey="C" isRight={true} d="M 5,-50 L 30,-40 L 25,-20 L 5,-20 Z" lx={15} ly={-35} label="C" />
           <RegionPath regionKey="IC" isRight={true} d="M 5,-20 L 25,-20 L 35,-10 L 25,5 L 5,5 Z" lx={18} ly={-8} label="IC" />
           <RegionPath regionKey="L" isRight={true} d="M 28,-35 L 50,-25 L 45,5 L 30,-5 Z" lx={38} ly={-15} label="L" />
           <RegionPath regionKey="I" isRight={true} d="M 38,-35 L 55,-25 L 50,10 L 35,5 Z" lx={45} ly={-10} label="I" />
           {/* Note: I and L overlap slightly in this simplified geometry, simplified to non-overlapping layout for clarity */}
           {/* Redrawing Deep to be non-overlapping and clearer */}
           <g>
             {/* Caudate: Medial Anterior */}
             <path d="M 5,-60 L 25,-60 L 25,-30 L 5,-30 Z" fill={isSelected(side === 'right' ? 'R-C' : 'L-C') && side === 'right' ? activeFill : baseFill} stroke="none" /> 
             <RegionPath regionKey="C" isRight={true} d="M 5,-50 L 20,-50 L 20,-25 L 5,-25 Z" lx={12} ly={-37} label="C" />
             
             {/* Internal Capsule: Medial Middle */}
             <RegionPath regionKey="IC" isRight={true} d="M 5,-25 L 20,-25 L 25,-5 L 5,-5 Z" lx={13} ly={-15} label="IC" />
             
             {/* Lentiform: Lateral to IC */}
             <RegionPath regionKey="L" isRight={true} d="M 20,-45 L 45,-35 L 40,-5 L 25,-5 L 20,-25 Z" lx={32} ly={-25} label="L" />
             
             {/* Insula: Lateral Strip */}
             <RegionPath regionKey="I" isRight={true} d="M 45,-35 L 55,-30 L 50,5 L 40,-5 Z" lx={48} ly={-15} label="I" />
           </g>
        </g>

        {/* Left Hemisphere Bottom (Mirrored) */}
        <g transform="translate(-5, 0) scale(-1, 1)">
           <RegionPath regionKey="M1" isRight={false} d="M 0,-100 L 0,-20 L 80,-40 C 70,-80 40,-100 0,-100 Z" lx={40} ly={-70} label="M1" />
           <RegionPath regionKey="M2" isRight={false} d="M 80,-40 L 0,-20 L 0,20 L 80,40 C 90,10 90,-20 80,-40 Z" lx={65} ly={0} label="M2" />
           <RegionPath regionKey="M3" isRight={false} d="M 0,100 L 0,20 L 80,40 C 70,80 40,100 0,100 Z" lx={40} ly={70} label="M3" />
           
           <g>
             <RegionPath regionKey="C" isRight={false} d="M 5,-50 L 20,-50 L 20,-25 L 5,-25 Z" lx={12} ly={-37} label="C" />
             <RegionPath regionKey="IC" isRight={false} d="M 5,-25 L 20,-25 L 25,-5 L 5,-5 Z" lx={13} ly={-15} label="IC" />
             <RegionPath regionKey="L" isRight={false} d="M 20,-45 L 45,-35 L 40,-5 L 25,-5 L 20,-25 Z" lx={32} ly={-25} label="L" />
             <RegionPath regionKey="I" isRight={false} d="M 45,-35 L 55,-30 L 50,5 L 40,-5 Z" lx={48} ly={-15} label="I" />
           </g>
        </g>
      </g>
      
      {/* Midline */}
      <line x1="160" y1="20" x2="160" y2="500" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

    </svg>
  );
};

export default AspectsBrainMap;

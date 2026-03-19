interface DoorDesignSVGProps {
  design: string;
  frameColor?: string;
  glassColor?: string;
  isDouble?: boolean;
  className?: string;
}

const DoorDesignSVG = ({ 
  design, 
  frameColor = '#8B7355', 
  glassColor = '#6B8BA4',
  isDouble = true,
  className = ''
}: DoorDesignSVGProps) => {
  const frameStroke = '#5C4A3A';
  const handleColor = '#C0C0C0';
  const hingeColor = '#A0A0A0';
  
  // Render a single door panel
  const renderDoorPanel = (x: number, y: number, width: number, height: number, isMain: boolean, flipHandle: boolean = false) => {
    const padding = 4;
    const innerX = x + padding;
    const innerY = y + padding;
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;

    return (
      <g>
        {/* Door frame */}
        <rect x={x} y={y} width={width} height={height} fill={frameColor} stroke={frameStroke} strokeWidth={1.5} />
        
        {/* Glass area background */}
        <rect x={innerX} y={innerY} width={innerW} height={innerH} fill={glassColor} />
        
        {/* Design pattern */}
        {renderPattern(innerX, innerY, innerW, innerH, isMain)}
        
        {/* Handle for main doors */}
        {isMain && (
          <g>
            <rect 
              x={flipHandle ? x + 6 : x + width - 10} 
              y={y + height * 0.45} 
              width={4} 
              height={28} 
              fill={handleColor}
              rx={2}
            />
          </g>
        )}
        
        {/* Hinges for main doors */}
        {isMain && (
          <>
            <rect 
              x={flipHandle ? x + width - 6 : x + 2} 
              y={y + 20} 
              width={4} 
              height={10} 
              fill={hingeColor}
              rx={1}
            />
            <rect 
              x={flipHandle ? x + width - 6 : x + 2} 
              y={y + height - 30} 
              width={4} 
              height={10} 
              fill={hingeColor}
              rx={1}
            />
          </>
        )}
      </g>
    );
  };

  // Render design pattern inside glass area
  const renderPattern = (x: number, y: number, w: number, h: number, isMain: boolean) => {
    const strokeWidth = isMain ? 4 : 2.5;
    const cx = x + w / 2;
    const cy = y + h / 2;

    // True Division designs (MG-X/X)
    if (design.startsWith('MG-')) {
      return renderTrueDivision(x, y, w, h, strokeWidth);
    }

    // Decorative designs (MGD-XX)
    if (design.startsWith('MGD-')) {
      return renderDecorativePattern(x, y, w, h, strokeWidth, cx, cy, isMain);
    }

    return null;
  };

  const renderTrueDivision = (x: number, y: number, w: number, h: number, strokeWidth: number) => {
    const hasColonial = design.includes('-C');
    const hasSolidBottom = design.includes('-SB');
    
    // Parse ratio
    let topRatio = 0.5;
    if (design.includes('1/3')) topRatio = 0.33;
    else if (design.includes('2/3')) topRatio = 0.67;
    
    const dividerY = y + h * topRatio;
    const railHeight = 4;

    // For MG-1/2 style: 2 equal glass panels
    if (design === 'MG-1/2') {
      return (
        <g>
          <rect x={x} y={dividerY - railHeight/2} width={w} height={railHeight} fill={frameColor} />
        </g>
      );
    }

    // MG-1/2-SB: Top glass, bottom solid
    if (design === 'MG-1/2-SB') {
      return (
        <g>
          <rect x={x} y={dividerY - railHeight/2} width={w} height={railHeight} fill={frameColor} />
          <rect x={x} y={dividerY + railHeight/2} width={w} height={h - (dividerY - y) - railHeight/2} fill={frameColor} />
        </g>
      );
    }

    // MG-1/2-SB-C: Top glass with colonial grid, bottom solid
    if (design === 'MG-1/2-SB-C') {
      const topH = dividerY - y - railHeight/2;
      return (
        <g>
          {/* Colonial grid on top */}
          <line x1={x + w/2} y1={y} x2={x + w/2} y2={y + topH} stroke={frameColor} strokeWidth={3} />
          <line x1={x} y1={y + topH/2} x2={x + w} y2={y + topH/2} stroke={frameColor} strokeWidth={3} />
          {/* Divider rail */}
          <rect x={x} y={dividerY - railHeight/2} width={w} height={railHeight} fill={frameColor} />
          {/* Solid bottom */}
          <rect x={x} y={dividerY + railHeight/2} width={w} height={h - (dividerY - y) - railHeight/2} fill={frameColor} />
        </g>
      );
    }

    // MG-1/3-U: 1/3 top glass, center glass, small bottom
    if (design === 'MG-1/3-U') {
      const topH = h * 0.33;
      const bottomH = h * 0.2;
      return (
        <g>
          <rect x={x} y={y + topH - railHeight/2} width={w} height={railHeight} fill={frameColor} />
          <rect x={x} y={y + h - bottomH - railHeight/2} width={w} height={railHeight} fill={frameColor} />
        </g>
      );
    }

    // MG-1/3-U-SB: 1/3 top glass, rest solid
    if (design === 'MG-1/3-U-SB') {
      const topH = h * 0.33;
      return (
        <g>
          <rect x={x} y={y + topH - railHeight/2} width={w} height={railHeight} fill={frameColor} />
          <rect x={x} y={y + topH + railHeight/2} width={w} height={h - topH - railHeight/2} fill={frameColor} />
        </g>
      );
    }

    // MG-1/3-U-SB-C: 1/3 top glass with colonial, rest solid
    if (design === 'MG-1/3-U-SB-C') {
      const topH = h * 0.33;
      return (
        <g>
          {/* Colonial grid on top */}
          <line x1={x + w/2} y1={y} x2={x + w/2} y2={y + topH - railHeight/2} stroke={frameColor} strokeWidth={3} />
          <line x1={x} y1={y + topH/2} x2={x + w} y2={y + topH/2} stroke={frameColor} strokeWidth={3} />
          {/* Divider rail */}
          <rect x={x} y={y + topH - railHeight/2} width={w} height={railHeight} fill={frameColor} />
          {/* Solid bottom */}
          <rect x={x} y={y + topH + railHeight/2} width={w} height={h - topH - railHeight/2} fill={frameColor} />
        </g>
      );
    }

    // MG-2/3-U: 2/3 top glass, bottom panel
    if (design === 'MG-2/3-U') {
      const topH = h * 0.67;
      return (
        <g>
          <rect x={x} y={y + topH - railHeight/2} width={w} height={railHeight} fill={frameColor} />
        </g>
      );
    }

    // MG-2/3-U-SB: 2/3 top glass, solid bottom
    if (design === 'MG-2/3-U-SB') {
      const topH = h * 0.67;
      return (
        <g>
          <rect x={x} y={y + topH - railHeight/2} width={w} height={railHeight} fill={frameColor} />
          <rect x={x} y={y + topH + railHeight/2} width={w} height={h - topH - railHeight/2} fill={frameColor} />
        </g>
      );
    }

    // MG-2/3-U-SB-C: 2/3 top glass with colonial, solid bottom
    if (design === 'MG-2/3-U-SB-C') {
      const topH = h * 0.67;
      return (
        <g>
          {/* Colonial grid on top - 2x3 grid */}
          <line x1={x + w/2} y1={y} x2={x + w/2} y2={y + topH - railHeight/2} stroke={frameColor} strokeWidth={3} />
          <line x1={x} y1={y + topH/3} x2={x + w} y2={y + topH/3} stroke={frameColor} strokeWidth={3} />
          <line x1={x} y1={y + topH*2/3} x2={x + w} y2={y + topH*2/3} stroke={frameColor} strokeWidth={3} />
          {/* Divider rail */}
          <rect x={x} y={y + topH - railHeight/2} width={w} height={railHeight} fill={frameColor} />
          {/* Solid bottom */}
          <rect x={x} y={y + topH + railHeight/2} width={w} height={h - topH - railHeight/2} fill={frameColor} />
        </g>
      );
    }

    return null;
  };

  const renderDecorativePattern = (
    x: number, y: number, w: number, h: number, 
    strokeWidth: number, cx: number, cy: number, isMain: boolean
  ) => {
    const sw = isMain ? strokeWidth : strokeWidth * 0.7;

    switch (design) {
      // MGD-01: Concentric circles offset to left
      case 'MGD-01':
        return (
          <g>
            <circle cx={cx - w * 0.1} cy={cy - h * 0.1} r={w * 0.45} fill="none" stroke={frameColor} strokeWidth={sw} />
            <circle cx={cx - w * 0.1} cy={cy - h * 0.1} r={w * 0.3} fill="none" stroke={frameColor} strokeWidth={sw} />
            <circle cx={cx - w * 0.1} cy={cy - h * 0.1} r={w * 0.15} fill="none" stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-02: Concentric rectangles (Art Deco)
      case 'MGD-02':
        return (
          <g>
            <rect x={x + w * 0.1} y={y + h * 0.08} width={w * 0.8} height={h * 0.84} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.22} y={y + h * 0.18} width={w * 0.56} height={h * 0.64} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.34} y={y + h * 0.28} width={w * 0.32} height={h * 0.44} fill="none" stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-03: Flowing diagonal waves
      case 'MGD-03':
        return (
          <g>
            <path 
              d={`M${x + w * 0.2} ${y + h * 0.05} 
                  Q${x + w * 0.5} ${y + h * 0.25} ${x + w * 0.3} ${y + h * 0.5}
                  Q${x + w * 0.1} ${y + h * 0.75} ${x + w * 0.4} ${y + h * 0.95}`}
              fill="none" stroke={frameColor} strokeWidth={sw} strokeLinecap="round"
            />
            <path 
              d={`M${x + w * 0.5} ${y + h * 0.05} 
                  Q${x + w * 0.8} ${y + h * 0.25} ${x + w * 0.6} ${y + h * 0.5}
                  Q${x + w * 0.4} ${y + h * 0.75} ${x + w * 0.7} ${y + h * 0.95}`}
              fill="none" stroke={frameColor} strokeWidth={sw} strokeLinecap="round"
            />
            <path 
              d={`M${x + w * 0.8} ${y + h * 0.05} 
                  Q${x + w * 1.1} ${y + h * 0.25} ${x + w * 0.9} ${y + h * 0.5}
                  Q${x + w * 0.7} ${y + h * 0.75} ${x + w * 1.0} ${y + h * 0.95}`}
              fill="none" stroke={frameColor} strokeWidth={sw} strokeLinecap="round"
            />
          </g>
        );

      // MGD-04: Interlocking curved ovals (infinity-like)
      case 'MGD-04':
        return (
          <g>
            <ellipse cx={cx} cy={cy - h * 0.2} rx={w * 0.4} ry={h * 0.35} fill="none" stroke={frameColor} strokeWidth={sw} />
            <ellipse cx={cx} cy={cy + h * 0.2} rx={w * 0.4} ry={h * 0.35} fill="none" stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-05: Similar to 04 with different angle
      case 'MGD-05':
        return (
          <g>
            <ellipse cx={cx - w * 0.1} cy={cy} rx={w * 0.35} ry={h * 0.4} fill="none" stroke={frameColor} strokeWidth={sw} />
            <ellipse cx={cx + w * 0.1} cy={cy} rx={w * 0.35} ry={h * 0.4} fill="none" stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-06: Crossed curves symmetrical
      case 'MGD-06':
        return (
          <g>
            <path 
              d={`M${x + w * 0.1} ${y + h * 0.1} 
                  Q${cx} ${cy} ${x + w * 0.9} ${y + h * 0.9}`}
              fill="none" stroke={frameColor} strokeWidth={sw} strokeLinecap="round"
            />
            <path 
              d={`M${x + w * 0.9} ${y + h * 0.1} 
                  Q${cx} ${cy} ${x + w * 0.1} ${y + h * 0.9}`}
              fill="none" stroke={frameColor} strokeWidth={sw} strokeLinecap="round"
            />
            <ellipse cx={cx} cy={cy} rx={w * 0.25} ry={h * 0.2} fill="none" stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-07: Circle with concentric rings
      case 'MGD-07':
        return (
          <g>
            <circle cx={cx} cy={cy} r={w * 0.42} fill="none" stroke={frameColor} strokeWidth={sw} />
            <circle cx={cx} cy={cy} r={w * 0.28} fill="none" stroke={frameColor} strokeWidth={sw} />
            <circle cx={cx} cy={cy} r={w * 0.14} fill="none" stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-08: Large circle with cross
      case 'MGD-08':
        return (
          <g>
            <circle cx={cx} cy={cy} r={w * 0.4} fill="none" stroke={frameColor} strokeWidth={sw} />
            <line x1={cx - w * 0.4} y1={cy} x2={cx + w * 0.4} y2={cy} stroke={frameColor} strokeWidth={sw} />
            <line x1={cx} y1={cy - w * 0.4} x2={cx} y2={cy + w * 0.4} stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-09: Waves with circle
      case 'MGD-09':
        return (
          <g>
            <path 
              d={`M${x} ${y + h * 0.3} 
                  Q${x + w * 0.25} ${y + h * 0.15} ${x + w * 0.5} ${y + h * 0.3}
                  Q${x + w * 0.75} ${y + h * 0.45} ${x + w} ${y + h * 0.3}`}
              fill="none" stroke={frameColor} strokeWidth={sw} strokeLinecap="round"
            />
            <circle cx={cx} cy={cy + h * 0.15} r={w * 0.25} fill="none" stroke={frameColor} strokeWidth={sw} />
            <path 
              d={`M${x} ${y + h * 0.85} 
                  Q${x + w * 0.5} ${y + h * 0.7} ${x + w} ${y + h * 0.85}`}
              fill="none" stroke={frameColor} strokeWidth={sw} strokeLinecap="round"
            />
          </g>
        );

      // MGD-10: Flowing S-wave
      case 'MGD-10':
        return (
          <g>
            <path 
              d={`M${x + w * 0.15} ${y + h * 0.1} 
                  C${x + w * 0.7} ${y + h * 0.2} ${x + w * 0.3} ${y + h * 0.5} ${x + w * 0.8} ${y + h * 0.5}
                  C${x + w * 0.3} ${y + h * 0.5} ${x + w * 0.7} ${y + h * 0.8} ${x + w * 0.15} ${y + h * 0.9}`}
              fill="none" stroke={frameColor} strokeWidth={sw} strokeLinecap="round"
            />
          </g>
        );

      // MGD-11: Art Deco rectangles
      case 'MGD-11':
        return (
          <g>
            <rect x={x + w * 0.15} y={y + h * 0.08} width={w * 0.7} height={h * 0.84} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.25} y={y + h * 0.15} width={w * 0.5} height={h * 0.35} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.25} y={y + h * 0.55} width={w * 0.5} height={h * 0.3} fill="none" stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-12: Rectangle with T pattern
      case 'MGD-12':
        return (
          <g>
            <rect x={x + w * 0.15} y={y + h * 0.08} width={w * 0.7} height={h * 0.84} fill="none" stroke={frameColor} strokeWidth={sw} />
            <line x1={cx} y1={y + h * 0.08} x2={cx} y2={y + h * 0.5} stroke={frameColor} strokeWidth={sw} />
            <line x1={x + w * 0.15} y1={y + h * 0.5} x2={x + w * 0.85} y2={y + h * 0.5} stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-13: 7 horizontal glass bars
      case 'MGD-13':
        const bars13 = 7;
        const gap13 = h / (bars13 + 1);
        return (
          <g>
            {Array.from({ length: bars13 }).map((_, i) => (
              <rect 
                key={i}
                x={x} 
                y={y + gap13 * (i + 1) - 3}
                width={w}
                height={6}
                fill={frameColor}
              />
            ))}
          </g>
        );

      // MGD-14: 4 horizontal glass panels (larger)
      case 'MGD-14':
        const bars14 = 4;
        const panelH14 = h / (bars14 + 0.5);
        return (
          <g>
            {Array.from({ length: bars14 - 1 }).map((_, i) => (
              <rect 
                key={i}
                x={x} 
                y={y + panelH14 * (i + 1) - 2}
                width={w}
                height={4}
                fill={frameColor}
              />
            ))}
          </g>
        );

      // MGD-15: Vertical diamond chain
      case 'MGD-15':
        return (
          <g>
            {[0, 1, 2, 3].map((i) => (
              <polygon
                key={i}
                points={`
                  ${cx},${y + h * 0.1 + i * h * 0.22}
                  ${cx + w * 0.18},${y + h * 0.2 + i * h * 0.22}
                  ${cx},${y + h * 0.3 + i * h * 0.22}
                  ${cx - w * 0.18},${y + h * 0.2 + i * h * 0.22}
                `}
                fill="none"
                stroke={frameColor}
                strokeWidth={sw}
              />
            ))}
          </g>
        );

      // MGD-16: Geometric squares (Art Deco)
      case 'MGD-16':
        return (
          <g>
            <rect x={x + w * 0.12} y={y + h * 0.08} width={w * 0.35} height={h * 0.35} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.22} y={y + h * 0.16} width={w * 0.15} height={h * 0.15} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.53} y={y + h * 0.08} width={w * 0.35} height={h * 0.35} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.63} y={y + h * 0.16} width={w * 0.15} height={h * 0.15} fill="none" stroke={frameColor} strokeWidth={sw} />
            {/* Vertical bar below */}
            <rect x={cx - w * 0.06} y={y + h * 0.48} width={w * 0.12} height={h * 0.45} fill="none" stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-17: Horizontal waves
      case 'MGD-17':
        return (
          <g>
            {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
              <path 
                key={i}
                d={`M${x} ${y + h * ratio} 
                    C${x + w * 0.25} ${y + h * ratio - h * 0.08} ${x + w * 0.5} ${y + h * ratio + h * 0.08} ${x + w * 0.75} ${y + h * ratio - h * 0.08}
                    S${x + w} ${y + h * ratio} ${x + w} ${y + h * ratio}`}
                fill="none" 
                stroke={frameColor} 
                strokeWidth={sw * 1.5}
                strokeLinecap="round"
              />
            ))}
          </g>
        );

      // MGD-18: Single vertical glass strip
      case 'MGD-18':
        return (
          <g>
            <rect x={x + w * 0.7} y={y + h * 0.15} width={w * 0.12} height={h * 0.7} fill="none" stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-19: Staggered vertical bars
      case 'MGD-19':
        return (
          <g>
            <rect x={x + w * 0.15} y={y + h * 0.15} width={w * 0.08} height={h * 0.35} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.28} y={y + h * 0.25} width={w * 0.08} height={h * 0.45} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.41} y={y + h * 0.35} width={w * 0.08} height={h * 0.55} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.54} y={y + h * 0.25} width={w * 0.08} height={h * 0.45} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.67} y={y + h * 0.15} width={w * 0.08} height={h * 0.35} fill="none" stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-20: Thin horizontal bars
      case 'MGD-20':
        return (
          <g>
            {[0.18, 0.32, 0.46, 0.6, 0.74, 0.88].map((ratio, i) => (
              <rect 
                key={i}
                x={x + w * 0.1} 
                y={y + h * ratio - 2}
                width={w * 0.8}
                height={4}
                fill={frameColor}
              />
            ))}
          </g>
        );

      // MGD-21: Double crescent / moon
      case 'MGD-21':
        return (
          <g>
            <path 
              d={`M${x + w * 0.7} ${y + h * 0.15} 
                  A${w * 0.35} ${h * 0.35} 0 0 0 ${x + w * 0.7} ${y + h * 0.85}`}
              fill="none" stroke={frameColor} strokeWidth={sw * 1.5} strokeLinecap="round"
            />
            <path 
              d={`M${x + w * 0.55} ${y + h * 0.25} 
                  A${w * 0.25} ${h * 0.25} 0 0 0 ${x + w * 0.55} ${y + h * 0.75}`}
              fill="none" stroke={frameColor} strokeWidth={sw * 1.5} strokeLinecap="round"
            />
          </g>
        );

      // MGD-22: Single tall vertical panel
      case 'MGD-22':
        return (
          <g>
            <rect x={cx - w * 0.1} y={y + h * 0.1} width={w * 0.2} height={h * 0.8} fill="none" stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      // MGD-23: 6 horizontal rectangles
      case 'MGD-23':
        return (
          <g>
            {[0.12, 0.27, 0.42, 0.57, 0.72, 0.87].map((ratio, i) => (
              <rect 
                key={i}
                x={x + w * 0.15} 
                y={y + h * ratio - h * 0.05}
                width={w * 0.7}
                height={h * 0.1}
                fill="none"
                stroke={frameColor}
                strokeWidth={sw}
              />
            ))}
          </g>
        );

      // MGD-24: 6 panels (2x3 grid)
      case 'MGD-24':
        return (
          <g>
            {/* Top row */}
            <rect x={x + w * 0.08} y={y + h * 0.08} width={w * 0.38} height={h * 0.26} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.54} y={y + h * 0.08} width={w * 0.38} height={h * 0.26} fill="none" stroke={frameColor} strokeWidth={sw} />
            {/* Middle row */}
            <rect x={x + w * 0.08} y={y + h * 0.38} width={w * 0.38} height={h * 0.26} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.54} y={y + h * 0.38} width={w * 0.38} height={h * 0.26} fill="none" stroke={frameColor} strokeWidth={sw} />
            {/* Bottom row */}
            <rect x={x + w * 0.08} y={y + h * 0.68} width={w * 0.38} height={h * 0.26} fill="none" stroke={frameColor} strokeWidth={sw} />
            <rect x={x + w * 0.54} y={y + h * 0.68} width={w * 0.38} height={h * 0.26} fill="none" stroke={frameColor} strokeWidth={sw} />
          </g>
        );

      default:
        return null;
    }
  };

  // Dimensions
  const doorWidth = 60;
  const sidelightWidth = 30;
  const doorHeight = 160;
  const gap = 2;
  
  const totalWidth = isDouble 
    ? sidelightWidth + gap + doorWidth + gap + doorWidth + gap + sidelightWidth 
    : doorWidth + gap + sidelightWidth;
  
  return (
    <svg 
      viewBox={`0 0 ${totalWidth + 4} ${doorHeight + 10}`} 
      className={`w-full h-auto ${className}`}
      style={{ maxHeight: '280px' }}
    >
      <defs>
        <linearGradient id={`glassGrad-${design}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7A9BB5" />
          <stop offset="50%" stopColor={glassColor} />
          <stop offset="100%" stopColor="#5A7B95" />
        </linearGradient>
        <filter id="doorShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.25"/>
        </filter>
      </defs>

      <g transform="translate(2, 5)">
        {isDouble ? (
          <>
            {/* Left sidelight */}
            <g filter="url(#doorShadow)">
              {renderDoorPanel(0, 0, sidelightWidth, doorHeight, false)}
            </g>

            {/* Left main door */}
            <g filter="url(#doorShadow)">
              {renderDoorPanel(sidelightWidth + gap, 0, doorWidth, doorHeight, true, false)}
            </g>

            {/* Right main door */}
            <g filter="url(#doorShadow)">
              {renderDoorPanel(sidelightWidth + gap + doorWidth + gap, 0, doorWidth, doorHeight, true, true)}
            </g>

            {/* Right sidelight */}
            <g filter="url(#doorShadow)">
              {renderDoorPanel(sidelightWidth + gap + doorWidth + gap + doorWidth + gap, 0, sidelightWidth, doorHeight, false)}
            </g>
          </>
        ) : (
          <>
            {/* Single main door */}
            <g filter="url(#doorShadow)">
              {renderDoorPanel(0, 0, doorWidth, doorHeight, true, false)}
            </g>

            {/* Sidelight */}
            <g filter="url(#doorShadow)">
              {renderDoorPanel(doorWidth + gap, 0, sidelightWidth, doorHeight, false)}
            </g>
          </>
        )}
      </g>
    </svg>
  );
};

export default DoorDesignSVG;

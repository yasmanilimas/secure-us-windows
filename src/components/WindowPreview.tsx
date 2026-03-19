import { useMemo, useState, useEffect } from 'react';

interface WindowPreviewProps {
  width: number;
  height: number;
  frameColor: string;
  glassTint: string;
  privacy: boolean;
  productType: 'window' | 'door';
  productKey: string;
  windowConfig?: string;
}

const WindowPreview = ({
  width,
  height,
  frameColor,
  glassTint,
  privacy,
  productType,
  productKey,
  windowConfig,
}: WindowPreviewProps) => {
  // Animation state for sliding windows
  const [animationPhase, setAnimationPhase] = useState(0);
  
  // Auto-animate sliding windows
  useEffect(() => {
    const isSliding = productKey === 'horizontalSliding' || productKey === 'slidingGlass';
    const isSingleHung = productKey === 'singleHung';
    const isCasement = productKey === 'casement';
    
    if (isSliding || isSingleHung || isCasement) {
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % 100);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [productKey]);
  // Calculate aspect ratio for preview (max 200px)
  const maxSize = 200;
  const aspectRatio = width / height;
  
  const dimensions = useMemo(() => {
    if (aspectRatio > 1) {
      return {
        previewWidth: maxSize,
        previewHeight: maxSize / aspectRatio,
      };
    } else {
      return {
        previewWidth: maxSize * aspectRatio,
        previewHeight: maxSize,
      };
    }
  }, [aspectRatio]);

  // Frame color mapping with light/dark variants for 3D effect
  const frameColorMap: Record<string, { main: string; light: string; dark: string; highlight: string }> = {
    white: { main: '#F5F5F5', light: '#FFFFFF', dark: '#D0D0D0', highlight: '#FFFFFF' },
    black: { main: '#2A2A2A', light: '#4A4A4A', dark: '#1A1A1A', highlight: '#5A5A5A' },
    silver: { main: '#A8A8A8', light: '#C8C8C8', dark: '#888888', highlight: '#E0E0E0' },
    bronze: { main: '#6B5344', light: '#8B7364', dark: '#4B3324', highlight: '#9B8374' },
  };

  // Glass tint color mapping with opacity
  const glassTintMap: Record<string, { color: string; opacity: number; reflectColor: string }> = {
    clear: { color: '#87CEEB', opacity: privacy ? 0.7 : 0.25, reflectColor: '#FFFFFF' },
    gray: { color: '#5A6570', opacity: privacy ? 0.85 : 0.45, reflectColor: '#E8E8E8' },
    bronze: { color: '#7A6550', opacity: privacy ? 0.8 : 0.4, reflectColor: '#F0E8D8' },
    green: { color: '#4A7B5E', opacity: privacy ? 0.8 : 0.4, reflectColor: '#E8F0E8' },
    blue: { color: '#3B6EA8', opacity: privacy ? 0.85 : 0.45, reflectColor: '#E8F0FF' },
  };

  const frame = frameColorMap[frameColor] || frameColorMap.white;
  const glass = glassTintMap[glassTint] || glassTintMap.clear;

  // Helper to convert hex to rgb
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '135, 206, 235';
  };

  const frameWidth = 12;
  const innerFrameWidth = 4;
  const innerWidth = dimensions.previewWidth - frameWidth * 2;
  const innerHeight = dimensions.previewHeight - frameWidth * 2;

  // Render glass panel with realistic effects
  const renderGlassPanel = (x: number, y: number, w: number, h: number, key: string) => (
    <g key={key}>
      {/* Glass base with tint */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={`rgba(${hexToRgb(glass.color)}, ${glass.opacity})`}
      />
      
      {/* Sky/exterior reflection gradient */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="url(#skyReflection)"
        opacity={0.4}
      />
      
      {/* Main diagonal reflection streak */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="url(#mainReflection)"
        opacity={0.5}
      />
      
      {/* Top-left bright reflection */}
      <ellipse
        cx={x + w * 0.25}
        cy={y + h * 0.2}
        rx={w * 0.35}
        ry={h * 0.15}
        fill="url(#spotReflection)"
        opacity={0.3}
      />
      
      {/* Subtle inner shadow for depth */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth={1}
      />
      
      {/* Privacy frosted effect */}
      {privacy && (
        <>
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill="url(#frostedPattern)"
            opacity={0.6}
          />
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            filter="url(#frostedBlur)"
            fill={`rgba(${hexToRgb(glass.color)}, 0.2)`}
          />
        </>
      )}
    </g>
  );

  // Render glass panel WITH interior frame (for sliding panels)
  const renderFramedGlassPanel = (x: number, y: number, w: number, h: number, key: string) => {
    const sashWidth = 3; // Width of the interior sash/frame
    return (
      <g key={key}>
        {/* Interior sash frame around the glass */}
        {/* Top sash */}
        <rect x={x} y={y} width={w} height={sashWidth} fill={frame.main} />
        <rect x={x} y={y} width={w} height={1} fill={frame.light} />
        {/* Bottom sash */}
        <rect x={x} y={y + h - sashWidth} width={w} height={sashWidth} fill={frame.main} />
        <rect x={x} y={y + h - 1} width={w} height={1} fill={frame.dark} />
        {/* Left sash */}
        <rect x={x} y={y} width={sashWidth} height={h} fill={frame.main} />
        <rect x={x} y={y} width={1} height={h} fill={frame.light} />
        {/* Right sash */}
        <rect x={x + w - sashWidth} y={y} width={sashWidth} height={h} fill={frame.main} />
        <rect x={x + w - 1} y={y} width={1} height={h} fill={frame.dark} />
        
        {/* Glass inside the sash */}
        {renderGlassPanel(x + sashWidth, y + sashWidth, w - sashWidth * 2, h - sashWidth * 2, `${key}-glass`)}
      </g>
    );
  };

  // Render 3D frame edge with bevel effect
  const render3DFrameEdge = (x: number, y: number, w: number, h: number, isOuter: boolean = true) => (
    <g>
      {/* Main frame body */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={frame.main}
      />
      
      {isOuter && (
        <>
          {/* Top highlight (light hits from top-left) */}
          <rect
            x={x}
            y={y}
            width={w}
            height={2}
            fill={frame.light}
          />
          <rect
            x={x}
            y={y}
            width={2}
            height={h}
            fill={frame.light}
          />
          
          {/* Bottom/right shadow */}
          <rect
            x={x}
            y={y + h - 2}
            width={w}
            height={2}
            fill={frame.dark}
          />
          <rect
            x={x + w - 2}
            y={y}
            width={2}
            height={h}
            fill={frame.dark}
          />
          
          {/* Inner bevel highlight */}
          <rect
            x={x + 3}
            y={y + 3}
            width={w - 6}
            height={1}
            fill={frame.highlight}
            opacity={0.5}
          />
        </>
      )}
    </g>
  );

  // Calculate animation offset based on phase (smooth sine wave)
  const getSlideOffset = (maxOffset: number, reverse: boolean = false) => {
    const normalizedPhase = animationPhase / 100;
    // Create smooth back-and-forth motion using sine wave
    const offset = Math.sin(normalizedPhase * Math.PI * 2) * maxOffset;
    return reverse ? -offset : offset;
  };

  // Render window/door types
  const renderWindowType = () => {
    const slideOffset = getSlideOffset(innerWidth * 0.15);
    const verticalSlideOffset = getSlideOffset(innerHeight * 0.12);
    const casementRotation = Math.sin((animationPhase / 100) * Math.PI * 2) * 15;
    
    switch (productKey) {
      case 'singleHung':
        return (
          <g>
            {/* Top fixed pane */}
            {renderFramedGlassPanel(frameWidth, frameWidth, innerWidth, innerHeight / 2 - innerFrameWidth, 'top')}
            
            {/* Bottom sliding pane with animation */}
            <g style={{ transform: `translateY(${-Math.abs(verticalSlideOffset)}px)`, transition: 'transform 0.1s ease-out' }}>
              {/* Middle rail with 3D effect */}
              {render3DFrameEdge(frameWidth - 2, frameWidth + innerHeight / 2 - innerFrameWidth, innerWidth + 4, innerFrameWidth * 2, false)}
              
              {/* Bottom sliding pane */}
              {renderFramedGlassPanel(frameWidth, frameWidth + innerHeight / 2 + innerFrameWidth, innerWidth, innerHeight / 2 - innerFrameWidth, 'bottom')}
              
              {/* Lock/handle */}
              <g>
                <rect
                  x={dimensions.previewWidth / 2 - 12}
                  y={frameWidth + innerHeight / 2 + innerFrameWidth + 8}
                  width={24}
                  height={6}
                  rx={2}
                  fill={frame.dark}
                />
                <rect
                  x={dimensions.previewWidth / 2 - 10}
                  y={frameWidth + innerHeight / 2 + innerFrameWidth + 9}
                  width={20}
                  height={4}
                  rx={1}
                  fill={frame.light}
                />
              </g>
            </g>
          </g>
        );

      case 'horizontalSliding':
        // Handle different window configurations with animation
        const renderSlidingConfig = () => {
          // XOX configurations with different proportions
          if (windowConfig?.startsWith('XOX')) {
            let leftRatio = 1/3, centerRatio = 1/3, rightRatio = 1/3;
            
            if (windowConfig === 'XOX[1/4][1/2][1/4]') {
              leftRatio = 1/4;
              centerRatio = 1/2;
              rightRatio = 1/4;
            }
            
            const railWidth = innerFrameWidth * 2;
            const availableWidth = innerWidth - railWidth * 2;
            const leftWidth = availableWidth * leftRatio;
            const centerWidth = availableWidth * centerRatio;
            const rightWidth = availableWidth * rightRatio;
            
            return (
              <g>
                {/* Center fixed pane (O) - rendered first as background */}
                {renderFramedGlassPanel(frameWidth + leftWidth + railWidth, frameWidth, centerWidth, innerHeight, 'center')}
                
                {/* Fixed indicator on center */}
                <text
                  x={frameWidth + leftWidth + railWidth + centerWidth / 2}
                  y={dimensions.previewHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill={frame.dark}
                  opacity={0.25}
                  fontWeight="bold"
                >
                  O
                </text>
                
                {/* Left sliding pane (X) with animation */}
                <g style={{ transform: `translateX(${Math.max(0, slideOffset)}px)`, transition: 'transform 0.1s ease-out' }}>
                  {renderFramedGlassPanel(frameWidth, frameWidth, leftWidth, innerHeight, 'left')}
                  {render3DFrameEdge(frameWidth + leftWidth, frameWidth - 2, railWidth, innerHeight + 4, false)}
                  {/* Handle on LEFT edge of left pane (exterior side) */}
                  <g>
                    <rect
                      x={frameWidth + 4}
                      y={dimensions.previewHeight / 2 - 15}
                      width={6}
                      height={30}
                      rx={2}
                      fill={frame.dark}
                    />
                    <rect
                      x={frameWidth + 5}
                      y={dimensions.previewHeight / 2 - 14}
                      width={4}
                      height={28}
                      rx={1}
                      fill={frame.light}
                    />
                  </g>
                  <text
                    x={frameWidth + leftWidth / 2}
                    y={frameWidth + 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill={frame.dark}
                    opacity={0.4}
                  >
                    →
                  </text>
                </g>
                
                {/* Right sliding pane (X) with animation */}
                <g style={{ transform: `translateX(${Math.min(0, slideOffset)}px)`, transition: 'transform 0.1s ease-out' }}>
                  {render3DFrameEdge(frameWidth + leftWidth + railWidth + centerWidth, frameWidth - 2, railWidth, innerHeight + 4, false)}
                  {renderFramedGlassPanel(frameWidth + leftWidth + railWidth * 2 + centerWidth, frameWidth, rightWidth, innerHeight, 'right')}
                  {/* Handle on RIGHT edge of right pane (exterior side) */}
                  <g>
                    <rect
                      x={frameWidth + leftWidth + railWidth * 2 + centerWidth + rightWidth - 10}
                      y={dimensions.previewHeight / 2 - 15}
                      width={6}
                      height={30}
                      rx={2}
                      fill={frame.dark}
                    />
                    <rect
                      x={frameWidth + leftWidth + railWidth * 2 + centerWidth + rightWidth - 9}
                      y={dimensions.previewHeight / 2 - 14}
                      width={4}
                      height={28}
                      rx={1}
                      fill={frame.light}
                    />
                  </g>
                  <text
                    x={frameWidth + leftWidth + railWidth * 2 + centerWidth + rightWidth / 2}
                    y={frameWidth + 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill={frame.dark}
                    opacity={0.4}
                  >
                    ←
                  </text>
                </g>
              </g>
            );
          }
          
          // XO configuration (left slides, right fixed)
          if (windowConfig === 'XO') {
            return (
              <g>
                {/* Right fixed pane (O) - background */}
                {renderFramedGlassPanel(frameWidth + innerWidth / 2 + innerFrameWidth, frameWidth, innerWidth / 2 - innerFrameWidth, innerHeight, 'right')}
                <text
                  x={frameWidth + innerWidth * 0.75 + innerFrameWidth / 2}
                  y={dimensions.previewHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill={frame.dark}
                  opacity={0.25}
                  fontWeight="bold"
                >
                  O
                </text>
                
                {/* Left sliding pane (X) with animation */}
                <g style={{ transform: `translateX(${Math.max(0, slideOffset)}px)`, transition: 'transform 0.1s ease-out' }}>
                  {renderFramedGlassPanel(frameWidth, frameWidth, innerWidth / 2 - innerFrameWidth, innerHeight, 'left')}
                  {render3DFrameEdge(frameWidth + innerWidth / 2 - innerFrameWidth, frameWidth - 2, innerFrameWidth * 2, innerHeight + 4, false)}
                  {/* Handle on LEFT edge of left pane (exterior side) */}
                  <g>
                    <rect
                      x={frameWidth + 4}
                      y={dimensions.previewHeight / 2 - 15}
                      width={6}
                      height={30}
                      rx={2}
                      fill={frame.dark}
                    />
                    <rect
                      x={frameWidth + 5}
                      y={dimensions.previewHeight / 2 - 14}
                      width={4}
                      height={28}
                      rx={1}
                      fill={frame.light}
                    />
                  </g>
                  <text
                    x={frameWidth + innerWidth / 4}
                    y={frameWidth + 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill={frame.dark}
                    opacity={0.4}
                  >
                    →
                  </text>
                </g>
              </g>
            );
          }
          
          // OX configuration (left fixed, right slides)
          if (windowConfig === 'OX') {
            return (
              <g>
                {/* Left fixed pane (O) - background */}
                {renderFramedGlassPanel(frameWidth, frameWidth, innerWidth / 2 - innerFrameWidth, innerHeight, 'left')}
                <text
                  x={frameWidth + innerWidth / 4 - innerFrameWidth / 2}
                  y={dimensions.previewHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill={frame.dark}
                  opacity={0.25}
                  fontWeight="bold"
                >
                  O
                </text>
                
                {/* Right sliding pane (X) with animation */}
                <g style={{ transform: `translateX(${Math.min(0, slideOffset)}px)`, transition: 'transform 0.1s ease-out' }}>
                  {render3DFrameEdge(frameWidth + innerWidth / 2 - innerFrameWidth, frameWidth - 2, innerFrameWidth * 2, innerHeight + 4, false)}
                  {renderFramedGlassPanel(frameWidth + innerWidth / 2 + innerFrameWidth, frameWidth, innerWidth / 2 - innerFrameWidth, innerHeight, 'right')}
                  {/* Handle on RIGHT edge of right pane (exterior side) */}
                  <g>
                    <rect
                      x={dimensions.previewWidth - frameWidth - 10}
                      y={dimensions.previewHeight / 2 - 15}
                      width={6}
                      height={30}
                      rx={2}
                      fill={frame.dark}
                    />
                    <rect
                      x={dimensions.previewWidth - frameWidth - 9}
                      y={dimensions.previewHeight / 2 - 14}
                      width={4}
                      height={28}
                      rx={1}
                      fill={frame.light}
                    />
                  </g>
                  <text
                    x={frameWidth + innerWidth * 0.75}
                    y={frameWidth + 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill={frame.dark}
                    opacity={0.4}
                  >
                    ←
                  </text>
                </g>
              </g>
            );
          }
          
          // Default XO behavior (no specific config) with animation
          return (
            <g>
              {/* Right pane - background */}
              {renderFramedGlassPanel(frameWidth + innerWidth / 2 + innerFrameWidth, frameWidth, innerWidth / 2 - innerFrameWidth, innerHeight, 'right')}
              
              {/* Left sliding pane with animation */}
              <g style={{ transform: `translateX(${Math.max(0, slideOffset)}px)`, transition: 'transform 0.1s ease-out' }}>
                {renderFramedGlassPanel(frameWidth, frameWidth, innerWidth / 2 - innerFrameWidth, innerHeight, 'left')}
                {render3DFrameEdge(frameWidth + innerWidth / 2 - innerFrameWidth, frameWidth - 2, innerFrameWidth * 2, innerHeight + 4, false)}
                {/* Handle on RIGHT edge of left pane (interior side, near rail) */}
                <g>
                  <rect
                    x={frameWidth + innerWidth / 2 + innerFrameWidth - 2}
                    y={dimensions.previewHeight / 2 - 15}
                    width={6}
                    height={30}
                    rx={2}
                    fill={frame.dark}
                  />
                  <rect
                    x={frameWidth + innerWidth / 2 + innerFrameWidth - 1}
                    y={dimensions.previewHeight / 2 - 14}
                    width={4}
                    height={28}
                    rx={1}
                    fill={frame.light}
                  />
                </g>
              </g>
            </g>
          );
        };
        
        return renderSlidingConfig();

      case 'casement':
        return (
          <g>
            {/* Single pane with opening animation */}
            <g 
              style={{ 
                transformOrigin: `${frameWidth}px ${dimensions.previewHeight / 2}px`,
                transform: `perspective(200px) rotateY(${casementRotation}deg)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              {renderGlassPanel(frameWidth, frameWidth, innerWidth, innerHeight, 'main')}
              
              {/* Crank handle on right */}
              <g>
                <circle
                  cx={dimensions.previewWidth - frameWidth - 15}
                  cy={dimensions.previewHeight / 2}
                  r={7}
                  fill={frame.dark}
                />
                <circle
                  cx={dimensions.previewWidth - frameWidth - 15}
                  cy={dimensions.previewHeight / 2}
                  r={5}
                  fill={frame.light}
                />
                <rect
                  x={dimensions.previewWidth - frameWidth - 17}
                  y={dimensions.previewHeight / 2 + 5}
                  width={4}
                  height={16}
                  rx={1}
                  fill={frame.dark}
                />
              </g>
            </g>
            
            {/* Hinge indicators on left side (stationary) */}
            <g>
              <rect x={frameWidth + 2} y={frameWidth + 15} width={4} height={12} rx={1} fill={frame.dark} />
              <rect x={frameWidth + 2} y={frameWidth + innerHeight - 27} width={4} height={12} rx={1} fill={frame.dark} />
            </g>
          </g>
        );

      case 'pictureFixed':
        return (
          <>
            {renderGlassPanel(frameWidth, frameWidth, innerWidth, innerHeight, 'main')}
            
            {/* Fixed label indicator */}
            <text
              x={dimensions.previewWidth / 2}
              y={dimensions.previewHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill={frame.dark}
              opacity={0.3}
              fontWeight="bold"
            >
              FIXED
            </text>
          </>
        );

      case 'slidingGlass':
        return (
          <g>
            {/* Left panel - fixed background */}
            {renderFramedGlassPanel(frameWidth, frameWidth, innerWidth / 2 - 2, innerHeight, 'left')}
            
            {/* Right sliding panel with animation */}
            <g style={{ transform: `translateX(${Math.min(0, slideOffset)}px)`, transition: 'transform 0.1s ease-out' }}>
              {/* Center track with depth */}
              <g>
                <rect
                  x={frameWidth + innerWidth / 2 - 3}
                  y={frameWidth - 2}
                  width={6}
                  height={innerHeight + 4}
                  fill={frame.dark}
                />
                <rect
                  x={frameWidth + innerWidth / 2 - 2}
                  y={frameWidth - 1}
                  width={4}
                  height={innerHeight + 2}
                  fill={frame.main}
                />
                <line
                  x1={frameWidth + innerWidth / 2}
                  y1={frameWidth}
                  x2={frameWidth + innerWidth / 2}
                  y2={frameWidth + innerHeight}
                  stroke={frame.dark}
                  strokeWidth={1}
                />
              </g>
              
              {/* Right panel */}
              {renderFramedGlassPanel(frameWidth + innerWidth / 2 + 3, frameWidth, innerWidth / 2 - 3, innerHeight, 'right')}
              
              {/* Vertical handle bar - at bottom */}
              <g>
                <rect
                  x={frameWidth + innerWidth * 0.72}
                  y={frameWidth + innerHeight - 45}
                  width={8}
                  height={36}
                  rx={2}
                  fill={frame.dark}
                />
                <rect
                  x={frameWidth + innerWidth * 0.72 + 1}
                  y={frameWidth + innerHeight - 44}
                  width={6}
                  height={34}
                  rx={1}
                  fill={frame.light}
                />
                <line
                  x1={frameWidth + innerWidth * 0.72 + 4}
                  y1={frameWidth + innerHeight - 39}
                  x2={frameWidth + innerWidth * 0.72 + 4}
                  y2={frameWidth + innerHeight - 15}
                  stroke={frame.dark}
                  strokeWidth={1}
                  opacity={0.5}
                />
              </g>
            </g>
          </g>
        );

      case 'frenchDoor':
        const doorPanelWidth = innerWidth / 2 - innerFrameWidth;
        return (
          <>
            {/* Left door panel */}
            {renderGlassPanel(frameWidth, frameWidth, doorPanelWidth, innerHeight, 'leftDoor')}
            
            {/* Left door muntins (grid) */}
            <g stroke={frame.main} strokeWidth={3}>
              <line x1={frameWidth + doorPanelWidth / 2} y1={frameWidth} x2={frameWidth + doorPanelWidth / 2} y2={frameWidth + innerHeight} />
              <line x1={frameWidth} y1={frameWidth + innerHeight / 3} x2={frameWidth + doorPanelWidth} y2={frameWidth + innerHeight / 3} />
              <line x1={frameWidth} y1={frameWidth + innerHeight * 2 / 3} x2={frameWidth + doorPanelWidth} y2={frameWidth + innerHeight * 2 / 3} />
            </g>
            {/* Muntin highlights */}
            <g stroke={frame.light} strokeWidth={1} opacity={0.6}>
              <line x1={frameWidth + doorPanelWidth / 2 - 1} y1={frameWidth} x2={frameWidth + doorPanelWidth / 2 - 1} y2={frameWidth + innerHeight} />
            </g>
            
            {/* Center stile (meeting rail) */}
            {render3DFrameEdge(frameWidth + innerWidth / 2 - innerFrameWidth, frameWidth - 2, innerFrameWidth * 2, innerHeight + 4, true)}
            
            {/* Right door panel */}
            {renderGlassPanel(frameWidth + innerWidth / 2 + innerFrameWidth, frameWidth, doorPanelWidth, innerHeight, 'rightDoor')}
            
            {/* Right door muntins (grid) */}
            <g stroke={frame.main} strokeWidth={3}>
              <line x1={frameWidth + innerWidth / 2 + innerFrameWidth + doorPanelWidth / 2} y1={frameWidth} x2={frameWidth + innerWidth / 2 + innerFrameWidth + doorPanelWidth / 2} y2={frameWidth + innerHeight} />
              <line x1={frameWidth + innerWidth / 2 + innerFrameWidth} y1={frameWidth + innerHeight / 3} x2={frameWidth + innerWidth} y2={frameWidth + innerHeight / 3} />
              <line x1={frameWidth + innerWidth / 2 + innerFrameWidth} y1={frameWidth + innerHeight * 2 / 3} x2={frameWidth + innerWidth} y2={frameWidth + innerHeight * 2 / 3} />
            </g>
            
            {/* Door handles (lever style) */}
            <g>
              {/* Left door handle */}
              <ellipse cx={frameWidth + doorPanelWidth - 12} cy={dimensions.previewHeight / 2} rx={5} ry={5} fill={frame.dark} />
              <ellipse cx={frameWidth + doorPanelWidth - 12} cy={dimensions.previewHeight / 2} rx={3} ry={3} fill={frame.light} />
              
              {/* Right door handle */}
              <ellipse cx={frameWidth + innerWidth / 2 + innerFrameWidth + 12} cy={dimensions.previewHeight / 2} rx={5} ry={5} fill={frame.dark} />
              <ellipse cx={frameWidth + innerWidth / 2 + innerFrameWidth + 12} cy={dimensions.previewHeight / 2} rx={3} ry={3} fill={frame.light} />
            </g>
          </>
        );

      default:
        return renderGlassPanel(frameWidth, frameWidth, innerWidth, innerHeight, 'default');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl">
      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <span className="text-lg">{productType === 'window' ? '🪟' : '🚪'}</span>
        Vista Previa / Preview
      </div>
      
      {/* 3D perspective container */}
      <div 
        className="relative rounded-lg p-6"
        style={{ 
          minWidth: maxSize + 60,
          minHeight: maxSize + 60,
          background: 'linear-gradient(145deg, #e8f4fc 0%, #b8d4e8 50%, #98c4d8 100%)',
          boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.1), inset 0 -2px 10px rgba(255,255,255,0.5)',
        }}
      >
        {/* Perspective wrapper for 3D effect */}
        <div
          style={{
            perspective: '600px',
            perspectiveOrigin: 'center center',
          }}
        >
          <div
            style={{
              transform: 'rotateX(2deg) rotateY(-3deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            <svg
              width={dimensions.previewWidth}
              height={dimensions.previewHeight}
              style={{ 
                display: 'block', 
                margin: 'auto',
                filter: 'drop-shadow(4px 6px 12px rgba(0,0,0,0.3)) drop-shadow(1px 2px 4px rgba(0,0,0,0.2))',
              }}
            >
              <defs>
                {/* Sky reflection gradient */}
                <linearGradient id="skyReflection" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="30%" stopColor="#87CEEB" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#4A90B8" stopOpacity="0.15" />
                </linearGradient>
                
                {/* Main diagonal reflection */}
                <linearGradient id="mainReflection" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                  <stop offset="20%" stopColor="#ffffff" stopOpacity="0.2" />
                  <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="80%" stopColor="#ffffff" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                </linearGradient>
                
                {/* Spot reflection for top-left */}
                <radialGradient id="spotReflection" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
                
                {/* Frame gradient for 3D depth */}
                <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={frame.light} />
                  <stop offset="50%" stopColor={frame.main} />
                  <stop offset="100%" stopColor={frame.dark} />
                </linearGradient>
                
                {/* Frosted glass pattern */}
                <pattern id="frostedPattern" patternUnits="userSpaceOnUse" width="4" height="4">
                  <rect width="4" height="4" fill="rgba(255,255,255,0.3)" />
                  <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.4)" />
                  <circle cx="0" cy="0" r="0.5" fill="rgba(200,200,200,0.3)" />
                  <circle cx="4" cy="4" r="0.5" fill="rgba(200,200,200,0.3)" />
                </pattern>
                
                {/* Frosted blur filter */}
                <filter id="frostedBlur">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                </filter>
                
                {/* Outer shadow for depth */}
                <filter id="frameShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Outer frame shadow layer */}
              <rect
                x={2}
                y={3}
                width={dimensions.previewWidth - 2}
                height={dimensions.previewHeight - 2}
                rx={3}
                fill="rgba(0,0,0,0.2)"
              />

              {/* Main outer frame with 3D beveled effect */}
              <rect
                x={0}
                y={0}
                width={dimensions.previewWidth}
                height={dimensions.previewHeight}
                rx={3}
                fill={frame.main}
              />
              
              {/* Frame top highlight */}
              <rect
                x={0}
                y={0}
                width={dimensions.previewWidth}
                height={3}
                rx={3}
                fill={frame.light}
              />
              
              {/* Frame left highlight */}
              <rect
                x={0}
                y={0}
                width={3}
                height={dimensions.previewHeight}
                rx={3}
                fill={frame.light}
              />
              
              {/* Frame bottom shadow */}
              <rect
                x={0}
                y={dimensions.previewHeight - 3}
                width={dimensions.previewWidth}
                height={3}
                rx={3}
                fill={frame.dark}
              />
              
              {/* Frame right shadow */}
              <rect
                x={dimensions.previewWidth - 3}
                y={0}
                width={3}
                height={dimensions.previewHeight}
                rx={3}
                fill={frame.dark}
              />
              
              {/* Inner frame edge (creates inset look) */}
              <rect
                x={frameWidth - 2}
                y={frameWidth - 2}
                width={innerWidth + 4}
                height={innerHeight + 4}
                rx={1}
                fill="none"
                stroke={frame.dark}
                strokeWidth={2}
              />
              
              {/* Background behind glass (exterior/sky view) */}
              <rect
                x={frameWidth}
                y={frameWidth}
                width={innerWidth}
                height={innerHeight}
                fill="url(#skyReflection)"
                opacity={0.3}
              />
              <rect
                x={frameWidth}
                y={frameWidth}
                width={innerWidth}
                height={innerHeight}
                fill="#B8D8E8"
              />

              {/* Render specific window/door type */}
              {renderWindowType()}

            </svg>
          </div>
        </div>
      </div>

      {/* Dimensions display */}
      <div className="flex items-center gap-4 text-sm bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
        <span className="flex items-center gap-1 text-muted-foreground">
          <span className="font-bold text-foreground">{width}"</span> × <span className="font-bold text-foreground">{height}"</span>
        </span>
        <span className="text-primary font-bold">
          {((width * height) / 144).toFixed(1)} ft²
        </span>
      </div>
    </div>
  );
};

export default WindowPreview;

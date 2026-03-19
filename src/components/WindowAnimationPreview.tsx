import { useId, useState } from "react";

interface WindowAnimationPreviewProps {
  productKey: string;
  isActive?: boolean;
  autoPlay?: boolean;
}

const WindowAnimationPreview = ({ productKey, isActive = false, autoPlay = false }: WindowAnimationPreviewProps) => {
  const uid = useId();
  const [isHovered, setIsHovered] = useState(false);

  const shouldAnimate = isHovered || isActive || autoPlay;

  const renderAnimation = () => {
    const baseClass = "transition-all duration-500 ease-in-out";

    // Use design tokens only (HSL)
    const stroke = "hsl(var(--primary))";
    const strokeSubtle = "hsl(var(--primary) / 0.35)";
    const fillFixed = "hsl(var(--primary) / 0.1)";
    const fillMove = "hsl(var(--primary) / 0.2)";

    // Single Hung - Bottom panel slides up
    if (productKey === "MG200_SH") {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full" aria-label="MG200 Single Hung window animation">
          {/* Frame */}
          <rect x="5" y="5" width="90" height="110" fill="none" stroke={stroke} strokeWidth="3" rx="2" />

          {/* Top fixed panel */}
          <rect x="10" y="10" width="80" height="50" fill={fillFixed} stroke={stroke} strokeWidth="1.5" />
          <line x1="50" y1="10" x2="50" y2="60" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />

          {/* Bottom sliding panel */}
          <g className={baseClass} style={{ transform: shouldAnimate ? "translateY(-35px)" : "translateY(0)" }}>
            <rect x="10" y="65" width="80" height="45" fill={fillMove} stroke={stroke} strokeWidth="2" />
            <line x1="50" y1="65" x2="50" y2="110" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
            {/* Handle - at bottom of sliding panel */}
            <rect x="45" y="102" width="10" height="4" fill={stroke} rx="1" />
          </g>

          {/* Motion cue (arrow animates along the same direction as the sash) */}
          {shouldAnimate && (
            <g className="animate-fade-in">
              {/* travel track */}
              <path d="M82 106 L82 64" stroke={strokeSubtle} strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
              <g>
                <path d="M82 98 L82 76" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M82 76 L76 82" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M82 76 L88 82" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0 8; 0 -8; 0 8"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              </g>
            </g>
          )}
        </svg>
      );
    }

    // Single Hung 350 - Bottom panel slides up (similar to MG200)
    if (productKey === "MG350_SH") {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full" aria-label="MG350 Single Hung window animation">
          {/* Frame */}
          <rect x="5" y="5" width="90" height="110" fill="none" stroke={stroke} strokeWidth="3" rx="2" />

          {/* Top fixed panel */}
          <rect x="10" y="10" width="80" height="50" fill={fillFixed} stroke={stroke} strokeWidth="1.5" />
          <line x1="50" y1="10" x2="50" y2="60" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
          
          {/* 350 Series badge */}
          <rect x="70" y="14" width="16" height="10" fill="hsl(var(--primary))" rx="2" />
          <text x="78" y="22" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="6" fontWeight="bold">350</text>

          {/* Bottom sliding panel */}
          <g className={baseClass} style={{ transform: shouldAnimate ? "translateY(-35px)" : "translateY(0)" }}>
            <rect x="10" y="65" width="80" height="45" fill={fillMove} stroke={stroke} strokeWidth="2" />
            <line x1="50" y1="65" x2="50" y2="110" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
            {/* Handle */}
            <rect x="45" y="82" width="10" height="4" fill={stroke} rx="1" />
          </g>

          {/* Motion cue */}
          {shouldAnimate && (
            <g className="animate-fade-in">
              <path d="M82 106 L82 64" stroke={strokeSubtle} strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
              <g>
                <path d="M82 98 L82 76" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M82 76 L76 82" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M82 76 L88 82" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0 8; 0 -8; 0 8"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              </g>
            </g>
          )}
        </svg>
      );
    }

    // Horizontal Roller - Panel slides horizontally
    if (productKey === "MG300_HR") {
      return (
        <svg viewBox="0 0 120 100" className="w-full h-full" aria-label="MG300 Horizontal Roller window animation">
          {/* Frame */}
          <rect x="5" y="5" width="110" height="90" fill="none" stroke={stroke} strokeWidth="3" rx="2" />

          {/* Left fixed panel */}
          <rect x="10" y="10" width="48" height="80" fill={fillFixed} stroke={stroke} strokeWidth="1.5" />

          {/* Right sliding panel */}
          <g className={baseClass} style={{ transform: shouldAnimate ? "translateX(-35px)" : "translateX(0)" }}>
            <rect x="62" y="10" width="48" height="80" fill={fillMove} stroke={stroke} strokeWidth="2" />
            {/* Handle */}
            <rect x="66" y="45" width="4" height="10" fill={stroke} rx="1" />
          </g>

          {/* Motion cue */}
          {shouldAnimate && (
            <g className="animate-fade-in">
              <path d="M108 50 L78 50" stroke={strokeSubtle} strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
              <g>
                <path d="M102 50 L86 50" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M86 50 L92 44" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M86 50 L92 56" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="6 0; -6 0; 6 0"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              </g>
            </g>
          )}
        </svg>
      );
    }

    // Horizontal Roller 350 - Panel slides horizontally (similar to MG300)
    if (productKey === "MG350_HR") {
      return (
        <svg viewBox="0 0 120 100" className="w-full h-full" aria-label="MG350 Horizontal Roller window animation">
          {/* Frame */}
          <rect x="5" y="5" width="110" height="90" fill="none" stroke={stroke} strokeWidth="3" rx="2" />

          {/* Left fixed panel */}
          <rect x="10" y="10" width="48" height="80" fill={fillFixed} stroke={stroke} strokeWidth="1.5" />
          
          {/* 350 Series badge */}
          <rect x="90" y="14" width="16" height="10" fill="hsl(var(--primary))" rx="2" />
          <text x="98" y="22" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="6" fontWeight="bold">350</text>

          {/* Right sliding panel */}
          <g className={baseClass} style={{ transform: shouldAnimate ? "translateX(-35px)" : "translateX(0)" }}>
            <rect x="62" y="10" width="48" height="80" fill={fillMove} stroke={stroke} strokeWidth="2" />
            {/* Handle */}
            <rect x="66" y="45" width="4" height="10" fill={stroke} rx="1" />
          </g>

          {/* Motion cue */}
          {shouldAnimate && (
            <g className="animate-fade-in">
              <path d="M108 50 L78 50" stroke={strokeSubtle} strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
              <g>
                <path d="M102 50 L86 50" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M86 50 L92 44" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M86 50 L92 56" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="6 0; -6 0; 6 0"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              </g>
            </g>
          )}
        </svg>
      );
    }

    // Picture Window - Fixed, no animation just a subtle glow
    if (productKey === "MG400_PW" || productKey === "MG450_PW" || productKey === "MG350_PW") {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" aria-label="Picture window fixed preview">
          {/* Glow effect when hovered */}
          <defs>
            <filter id={`${uid}-glow`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Frame */}
          <rect
            x="5"
            y="5"
            width="90"
            height="90"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
            rx="2"
            filter={shouldAnimate ? `url(#${uid}-glow)` : ""}
            className={baseClass}
          />

          {/* Glass panel with sun reflection effect */}
          <rect x="10" y="10" width="80" height="80" fill={fillFixed} stroke={stroke} strokeWidth="1.5" />

          {/* Sun reflection animation */}
          <ellipse
            cx="30"
            cy="30"
            rx="15"
            ry="20"
            fill="hsl(var(--primary) / 0.15)"
            className={baseClass}
            style={{
              opacity: shouldAnimate ? 0.4 : 0.1,
              transform: shouldAnimate ? "translate(10px, 10px)" : "translate(0, 0)",
            }}
          />

          {/* Fixed indicator */}
          <text x="50" y="55" textAnchor="middle" fill={stroke} fontSize="10" fontWeight="bold">
            FIXED
          </text>
        </svg>
      );
    }

    // Casement/Awning - Swings outward (perspective effect - panel opens toward viewer)
    if (productKey === "MG600_CA") {
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full" aria-label="MG600 Casement/Awning window animation">
          {/* Frame */}
          <rect x="25" y="5" width="70" height="110" fill="none" stroke={stroke} strokeWidth="3" rx="2" />

          {/* Glass panel that swings outward - hinged on left side */}
          <g className={baseClass}>
            <polygon
              points={shouldAnimate ? "30,10 85,18 85,102 30,110" : "30,10 90,10 90,110 30,110"}
              fill="hsl(var(--primary) / 0.15)"
              stroke={stroke}
              strokeWidth="2"
            />
            {/* Crank handle indicator */}
            <circle cx={shouldAnimate ? 79 : 82} cy="60" r="4" fill={stroke} className={baseClass} />
          </g>

          {/* Hinge indicators */}
          <rect x="27" y="25" width="5" height="8" fill="hsl(var(--muted-foreground))" rx="1" />
          <rect x="27" y="85" width="5" height="8" fill="hsl(var(--muted-foreground))" rx="1" />

        </svg>
      );
    }

    // Sliding Glass Door - Slides horizontally
    if (productKey === "MG1000_SGD" || productKey === "MG1500_SGD") {
      return (
        <svg viewBox="0 0 140 120" className="w-full h-full" aria-label="Sliding glass door animation">
          {/* Frame */}
          <rect x="5" y="5" width="130" height="110" fill="none" stroke={stroke} strokeWidth="3" rx="2" />

          {/* Left fixed panel */}
          <rect x="10" y="10" width="58" height="100" fill={fillFixed} stroke={stroke} strokeWidth="1.5" />

          {/* Right sliding panel */}
          <g className={baseClass} style={{ transform: shouldAnimate ? "translateX(-50px)" : "translateX(0)" }}>
            <rect x="72" y="10" width="58" height="100" fill={fillMove} stroke={stroke} strokeWidth="2" />
            {/* Door handle */}
            <rect x="76" y="50" width="4" height="20" fill={stroke} rx="1" />
          </g>

          {/* Floor line */}
          <line x1="0" y1="118" x2="140" y2="118" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4" />

          {/* Motion cue */}
          {shouldAnimate && (
            <g className="animate-fade-in">
              <path d="M130 60 L104 60" stroke={strokeSubtle} strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
              <g>
                <path d="M124 60 L110 60" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M110 60 L116 54" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M110 60 L116 66" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="6 0; -6 0; 6 0"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              </g>
            </g>
          )}
        </svg>
      );
    }

    // SGD MultiTrack - Multiple panels slide
    if (productKey === "MG1100_SGD") {
      return (
        <svg viewBox="0 0 180 120" className="w-full h-full" aria-label="Multi-track sliding glass door animation">
          {/* Frame */}
          <rect x="5" y="5" width="170" height="110" fill="none" stroke={stroke} strokeWidth="3" rx="2" />

          {/* Panel 1 - Fixed */}
          <rect x="10" y="10" width="38" height="100" fill={fillFixed} stroke={stroke} strokeWidth="1" />

          {/* Panel 2 - Slides left */}
          <g className={baseClass} style={{ transform: shouldAnimate ? "translateX(-25px)" : "translateX(0)" }}>
            <rect x="52" y="10" width="38" height="100" fill="hsl(var(--primary) / 0.15)" stroke={stroke} strokeWidth="1.5" />
          </g>

          {/* Panel 3 - Slides right */}
          <g className={baseClass} style={{ transform: shouldAnimate ? "translateX(25px)" : "translateX(0)" }}>
            <rect x="94" y="10" width="38" height="100" fill="hsl(var(--primary) / 0.15)" stroke={stroke} strokeWidth="1.5" />
          </g>

          {/* Panel 4 - Fixed */}
          <rect x="136" y="10" width="34" height="100" fill={fillFixed} stroke={stroke} strokeWidth="1" />

          {/* Floor line */}
          <line x1="0" y1="118" x2="180" y2="118" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4" />

          {/* Motion cues */}
          {shouldAnimate && (
            <g className="animate-fade-in">
              {/* left-moving */}
              <path d="M86 110 L52 110" stroke={strokeSubtle} strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
              <g>
                <path d="M78 110 L64 110" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M64 110 L70 104" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M64 110 L70 116" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="5 0; -5 0; 5 0"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              </g>

              {/* right-moving */}
              <path d="M94 110 L128 110" stroke={strokeSubtle} strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
              <g>
                <path d="M102 110 L116 110" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M116 110 L110 104" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M116 110 L110 116" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="-5 0; 5 0; -5 0"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              </g>
            </g>
          )}
        </svg>
      );
    }

    // French Door - Both panels swing open (perspective effect)
    if (productKey === "MG3000_FD") {
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full" aria-label="French door animation">
          {/* Frame - centered with space on sides for arrows */}
          <rect x="20" y="5" width="120" height="110" fill="none" stroke={stroke} strokeWidth="3" rx="2" />

          {/* Left door panel (hinge left) */}
          <polygon
            points={shouldAnimate ? "25,10 70,18 70,102 25,110" : "25,10 78,10 78,110 25,110"}
            fill="hsl(var(--primary) / 0.15)"
            stroke={stroke}
            strokeWidth="2"
            className={baseClass}
          />
          <circle cx={shouldAnimate ? 65 : 72} cy="60" r="3" fill={stroke} className={baseClass} />

          {/* Right door panel (hinge right) */}
          <polygon
            points={shouldAnimate ? "90,18 135,10 135,110 90,102" : "82,10 135,10 135,110 82,110"}
            fill="hsl(var(--primary) / 0.15)"
            stroke={stroke}
            strokeWidth="2"
            className={baseClass}
          />
          <circle cx={shouldAnimate ? 95 : 88} cy="60" r="3" fill={stroke} className={baseClass} />

          {/* Hinges */}
          <rect x="22" y="25" width="4" height="6" fill="hsl(var(--muted-foreground))" rx="1" />
          <rect x="22" y="90" width="4" height="6" fill="hsl(var(--muted-foreground))" rx="1" />
          <rect x="134" y="25" width="4" height="6" fill="hsl(var(--muted-foreground))" rx="1" />
          <rect x="134" y="90" width="4" height="6" fill="hsl(var(--muted-foreground))" rx="1" />

          {/* Floor line */}
          <line x1="0" y1="118" x2="160" y2="118" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4" />

        </svg>
      );
    }

    // Default fallback
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" aria-label="Window preview">
        <rect x="10" y="10" width="80" height="80" fill={fillFixed} stroke={stroke} strokeWidth="2" rx="2" />
      </svg>
    );
  };

  return (
    <div
      className="relative w-full aspect-square max-w-[120px] mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderAnimation()}

      {/* Hover instruction */}
      <div
        className={`absolute -bottom-6 left-0 right-0 text-center text-xs text-muted-foreground transition-opacity duration-300 ${
          isHovered ? "opacity-0" : "opacity-100"
        }`}
      >
        Hover to see
      </div>
    </div>
  );
};

export default WindowAnimationPreview;

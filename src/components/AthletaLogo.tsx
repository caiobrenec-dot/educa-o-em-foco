import React from "react";

interface AthletaLogoProps {
  className?: string;
  variant?: "default" | "white" | "gold" | "compact";
  showSubtitle?: boolean;
  subtitleText?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AthletaLogo({
  className = "",
  variant = "default",
  showSubtitle = true,
  subtitleText = "PONTO",
  size = "md",
}: AthletaLogoProps) {
  const isWhite = variant === "white";
  const isGold = variant === "gold";

  // Sizes
  const sizeConfig = {
    sm: { height: 28, textClass: "text-lg", starSize: 8 },
    md: { height: 36, textClass: "text-2xl", starSize: 10 },
    lg: { height: 48, textClass: "text-3xl", starSize: 14 },
    xl: { height: 64, textClass: "text-4xl", starSize: 18 },
  }[size];

  const primaryColor = isWhite ? "#FFFFFF" : isGold ? "#FFC72C" : "#005C30";
  const starColor = isGold ? "#FFFFFF" : "#FFC72C";
  const subtitleColor = isWhite ? "#E2E8F0" : isGold ? "#FEF08A" : "#004724";

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#005C30] to-[#004724] border border-[#FFC72C]/40 shadow-md">
          {/* 3 stars on top */}
          <div className="absolute top-1 flex items-center gap-0.5">
            <svg width="6" height="6" viewBox="0 0 24 24" fill={starColor}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <svg width="7" height="7" viewBox="0 0 24 24" fill={starColor}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <svg width="6" height="6" viewBox="0 0 24 24" fill={starColor}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span className="font-extrabold text-white text-base tracking-tighter mt-1 font-mono">
            A
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start leading-none select-none ${className}`}>
      {/* 3 World Champion Stars */}
      <div className="flex items-center gap-1.5 mb-0.5 ml-1">
        <svg
          width={sizeConfig.starSize}
          height={sizeConfig.starSize}
          viewBox="0 0 24 24"
          fill={starColor}
          className="drop-shadow-sm transition-transform hover:scale-110"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <svg
          width={sizeConfig.starSize + 2}
          height={sizeConfig.starSize + 2}
          viewBox="0 0 24 24"
          fill={starColor}
          className="drop-shadow-sm transition-transform hover:scale-110"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <svg
          width={sizeConfig.starSize}
          height={sizeConfig.starSize}
          viewBox="0 0 24 24"
          fill={starColor}
          className="drop-shadow-sm transition-transform hover:scale-110"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>

      {/* Main ATHLETA Typography */}
      <div className="flex items-baseline gap-2">
        <span
          className={`font-black tracking-[-0.04em] uppercase ${sizeConfig.textClass}`}
          style={{
            color: primaryColor,
            fontFamily: "Impact, 'Plus Jakarta Sans', -apple-system, sans-serif",
            letterSpacing: "0.03em",
          }}
        >
          ATHLETA
        </span>

        {showSubtitle && (
          <span
            className="text-[10px] md:text-xs font-black uppercase px-2 py-0.5 rounded-md tracking-wider"
            style={{
              backgroundColor: isWhite ? "rgba(255, 199, 44, 0.2)" : "#FFC72C",
              color: isWhite ? "#FFC72C" : "#004724",
            }}
          >
            {subtitleText}
          </span>
        )}
      </div>

      {/* Small tagline */}
      <span
        className="text-[9px] font-semibold tracking-widest uppercase mt-0.5 ml-0.5 opacity-80"
        style={{ color: subtitleColor }}
      >
        Controle de Ponto & Gestão
      </span>
    </div>
  );
}

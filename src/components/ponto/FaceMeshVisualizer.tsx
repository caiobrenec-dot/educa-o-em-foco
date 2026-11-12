import React, { useState } from "react";
import { BiometricLandmark, getStandardFaceLandmarks } from "../../lib/facial-biometrics";

interface FaceMeshVisualizerProps {
  photoUrl: string;
  employeeName: string;
  landmarks?: BiometricLandmark[];
  showLandmarks?: boolean;
  showLines?: boolean;
  showHud?: boolean;
  showPupilDistance?: boolean;
  interpupillaryMm?: number;
  qualityScore?: number;
  className?: string;
}

export function FaceMeshVisualizer({
  photoUrl,
  employeeName,
  landmarks: propLandmarks,
  showLandmarks = true,
  showLines = true,
  showHud = true,
  showPupilDistance = true,
  interpupillaryMm = 63.4,
  qualityScore = 99.4,
  className = "",
}: FaceMeshVisualizerProps) {
  const [hoveredPoint, setHoveredPoint] = useState<BiometricLandmark | null>(null);

  const landmarks = propLandmarks || getStandardFaceLandmarks(employeeName);

  const pupilL = landmarks.find((l) => l.name === "pupila_esq") || { x: 36, y: 36 };
  const pupilR = landmarks.find((l) => l.name === "pupila_dir") || { x: 64, y: 36 };
  const chin = landmarks.find((l) => l.name === "queixo") || { x: 50, y: 84 };
  const nose = landmarks.find((l) => l.name === "nariz_ponta") || { x: 50, y: 52 };

  // Linhas das sobrancelhas
  const browL = landmarks.filter((l) => l.name.startsWith("sob_esq"));
  const browR = landmarks.filter((l) => l.name.startsWith("sob_dir"));
  const jaw = landmarks.filter((l) => l.name.startsWith("mandibula") || l.name === "queixo");

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-950 aspect-square select-none group ${className}`}>
      {/* 1. Foto do Colaborador */}
      <img
        src={photoUrl}
        alt={employeeName}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* 2. Malha Biométrica SVG */}
      {showLandmarks && (
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-auto"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="meshGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFC72C" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFC72C" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Elipse de Referência Facial */}
          <ellipse
            cx="50"
            cy="48"
            rx="32"
            ry="40"
            fill="none"
            stroke="rgba(255, 199, 44, 0.25)"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />

          {/* Conexões e Polígonos de Proporção Áurea */}
          {showLines && (
            <g stroke="rgba(255, 199, 44, 0.45)" strokeWidth="0.6" fill="none">
              {/* Contorno da Mandíbula */}
              <polyline
                points={jaw.map((p) => `${p.x},${p.y}`).join(" ")}
              />

              {/* Sobrancelhas */}
              <polyline points={browL.map((p) => `${p.x},${p.y}`).join(" ")} />
              <polyline points={browR.map((p) => `${p.x},${p.y}`).join(" ")} />

              {/* Triângulo Biométrico Central: Olhos e Nariz */}
              <polygon
                points={`${pupilL.x},${pupilL.y} ${pupilR.x},${pupilR.y} ${nose.x},${nose.y}`}
                fill="rgba(255, 199, 44, 0.08)"
                stroke="rgba(255, 199, 44, 0.6)"
                strokeWidth="0.8"
              />

              {/* Linha do Nariz ao Queixo */}
              <line
                x1={nose.x}
                y1={nose.y}
                x2={chin.x}
                y2={chin.y}
                stroke="rgba(255, 199, 44, 0.4)"
                strokeDasharray="1.5 1.5"
              />

              {/* Linha de Distância Interpupilar */}
              {showPupilDistance && (
                <g>
                  <line
                    x1={pupilL.x}
                    y1={pupilL.y}
                    x2={pupilR.x}
                    y2={pupilR.y}
                    stroke="#10B981"
                    strokeWidth="1"
                  />
                  <circle cx={pupilL.x} cy={pupilL.y} r="1.5" fill="#10B981" />
                  <circle cx={pupilR.x} cy={pupilR.y} r="1.5" fill="#10B981" />
                </g>
              )}
            </g>
          )}

          {/* 68 Pontos Biométricos Interativos */}
          {landmarks.map((point) => {
            const isHovered = hoveredPoint?.id === point.id;
            return (
              <g
                key={point.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Ponto sutil */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? "2.5" : "1.2"}
                  fill={isHovered ? "#FFFFFF" : "#FFC72C"}
                  stroke="#000000"
                  strokeWidth="0.3"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* 3. HUD e Moldura Holográfica */}
      {showHud && (
        <>
          {/* Cantos Dourados */}
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#FFC72C]" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#FFC72C]" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#FFC72C]" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#FFC72C]" />

          {/* Badge Superior HUD */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#FFC72C]/40 flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-[#FFC72C] font-mono uppercase">
              68 MARCOS • {qualityScore}%
            </span>
          </div>

          {/* Distância Interpupilar Indicador Inferior */}
          {showPupilDistance && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded-md border border-emerald-500/50 text-[9px] font-mono text-emerald-400 font-bold whitespace-nowrap">
              D.I.P: {interpupillaryMm}mm • SIMÉTRICO
            </div>
          )}
        </>
      )}

      {/* Tooltip ao pairar sobre ponto */}
      {hoveredPoint && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg border border-[#FFC72C] z-20 pointer-events-none whitespace-nowrap">
          Marco #{hoveredPoint.id}: {hoveredPoint.name.toUpperCase()} (X: {hoveredPoint.x}%, Y: {hoveredPoint.y}%)
        </div>
      )}
    </div>
  );
}

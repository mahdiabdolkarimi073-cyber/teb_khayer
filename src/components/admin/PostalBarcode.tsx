import React from "react";

// Code 128B character patterns (widths of alternating 3 bars and 3 spaces, total 11 modules)
const CODE128_PATTERNS: number[][] = [
  [2,1,2,2,2,2], [2,2,2,1,2,2], [2,2,2,2,2,1], [1,2,1,2,2,3], [1,2,1,3,2,2], // 0-4
  [1,3,1,2,2,2], [1,2,2,2,1,3], [1,2,2,3,1,2], [1,3,2,2,1,2], [2,2,1,2,1,3], // 5-9
  [2,2,1,3,1,2], [2,3,1,2,1,2], [1,1,2,2,3,2], [1,2,2,1,3,2], [1,2,2,2,3,1], // 10-14
  [1,1,3,2,2,2], [1,2,3,1,2,2], [1,2,3,2,2,1], [2,2,3,2,1,1], [2,2,1,1,3,2], // 15-19
  [2,2,1,2,3,1], [2,1,3,2,1,2], [2,2,3,1,1,2], [3,1,2,1,3,1], [3,1,1,2,2,2], // 20-24
  [3,2,1,1,2,2], [3,2,1,2,2,1], [3,1,2,2,1,2], [3,2,2,1,1,2], [3,2,2,2,1,1], // 25-29
  [2,1,2,1,2,3], [2,1,2,3,2,1], [2,3,2,1,2,1], [1,1,1,3,2,3], [1,3,1,1,2,3], // 30-34
  [1,3,1,3,2,1], [1,1,2,3,1,3], [1,3,2,1,1,3], [1,3,2,3,1,1], [2,1,1,3,1,3], // 35-39
  [2,3,1,1,1,3], [2,3,1,3,1,1], [1,1,2,1,3,3], [1,1,2,3,3,1], [1,3,2,1,3,1], // 40-44
  [1,1,3,1,2,3], [1,1,3,3,2,1], [1,3,3,1,2,1], [3,1,3,1,2,1], [2,1,1,3,3,1], // 45-49
  [2,3,1,1,3,1], [2,1,3,1,1,3], [2,1,3,3,1,1], [2,1,3,1,3,1], [3,1,1,1,2,3], // 50-54
  [3,1,1,3,2,1], [3,3,1,1,2,1], [3,1,2,1,1,3], [3,1,2,3,1,1], [3,3,2,1,1,1], // 55-59
  [3,1,4,1,1,1], [2,2,1,4,1,1], [4,3,1,1,1,1], [1,1,1,2,2,4], [1,1,1,4,2,2], // 60-64
  [1,2,1,1,2,4], [1,2,1,4,2,1], [1,4,1,1,2,2], [1,4,1,2,2,1], [1,1,2,2,1,4], // 65-69
  [1,1,2,4,1,2], [1,2,2,1,1,4], [1,2,2,4,1,1], [1,4,2,1,1,2], [1,4,2,2,1,1], // 70-74
  [2,4,1,2,1,1], [2,2,1,1,1,4], [4,1,3,1,1,1], [2,4,1,1,1,2], [1,3,4,1,1,1], // 75-79
  [1,1,1,2,4,2], [1,2,1,1,4,2], [1,2,1,2,4,1], [1,1,4,2,1,2], [1,2,4,1,1,2], // 80-84
  [1,2,4,2,1,1], [4,1,1,2,1,2], [4,2,1,1,1,2], [4,2,1,2,1,1], [2,1,2,1,4,1], // 85-89
  [2,1,4,1,2,1], [4,1,2,1,2,1], [1,1,1,1,4,3], [1,1,1,3,4,1], [1,3,1,1,4,1], // 90-94
  [1,1,4,1,1,3], [1,1,4,3,1,1], [4,1,1,1,1,3], [4,1,1,3,1,1], [1,1,3,1,4,1], // 95-99
  [1,1,4,1,3,1], [3,1,1,1,4,1], [4,1,1,1,3,1], [2,1,1,4,1,2], [2,1,1,2,1,4], // 100-104 (104 = Start B)
  [2,1,1,2,3,2], [2,3,3,1,1,1,2] // 105 (Start C), 106 (Stop)
];

export function PostalBarcode({
  value,
  height = 42,
  barWidth = 1.6,
  showText = true,
  className = "",
}: {
  value: string;
  height?: number;
  barWidth?: number;
  showText?: boolean;
  className?: string;
}) {
  const cleanValue = (value || "").replace(/[^\x20-\x7E]/g, "");
  if (!cleanValue) return null;

  // Code 128B Start
  const startCode = 104;
  const codes: number[] = [startCode];
  let checksum = startCode;

  for (let i = 0; i < cleanValue.length; i++) {
    const charCode = cleanValue.charCodeAt(i) - 32;
    codes.push(charCode);
    checksum += charCode * (i + 1);
  }

  codes.push(checksum % 103);
  codes.push(106); // Stop code

  // Build bars
  const elements: { x: number; w: number }[] = [];
  let currentX = 10; // quiet zone

  codes.forEach((codeIdx, codePosition) => {
    const pattern = CODE128_PATTERNS[codeIdx] || [1, 1, 1, 1, 1, 1];
    pattern.forEach((width, pIdx) => {
      const isBar = pIdx % 2 === 0;
      const w = width * barWidth;
      if (isBar) {
        elements.push({ x: currentX, w });
      }
      currentX += w;
    });
  });

  // Extra stop bar (2 modules wide)
  currentX += 10; // trailing quiet zone
  const totalSvgWidth = currentX;
  const totalSvgHeight = showText ? height + 16 : height;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={totalSvgWidth}
        height={height}
        viewBox={`0 0 ${totalSvgWidth} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className="block"
      >
        <rect width={totalSvgWidth} height={height} fill="#ffffff" />
        {elements.map((el, i) => (
          <rect
            key={i}
            x={el.x}
            y={0}
            width={el.w}
            height={height}
            fill="#000000"
          />
        ))}
      </svg>
      {showText && (
        <span className="font-mono text-[11px] font-bold tracking-widest text-black mt-1 dir-ltr">
          {cleanValue}
        </span>
      )}
    </div>
  );
}
